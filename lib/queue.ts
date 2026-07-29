import { Queue, Worker, Job } from "bullmq"

// BullMQ requires a standard Redis connection (not Upstash REST).
// Use REDIS_URL env for BullMQ (e.g. redis://localhost:6379 or Upstash Redis URL with ioredis adapter).
const REDIS_CONNECTION = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL }
  : { host: process.env.REDIS_HOST || "localhost", port: parseInt(process.env.REDIS_PORT || "6379", 10) }

// Lazy-initialized queues
let notificationQueue: Queue | null = null
let emailQueue: Queue | null = null
let aiTaskQueue: Queue | null = null

function getQueue(name: string): Queue {
  const queue = new Queue(name, { connection: REDIS_CONNECTION })
  return queue
}

export function getNotificationQueue(): Queue {
  if (!notificationQueue) {
    notificationQueue = getQueue("notifications")
  }
  return notificationQueue
}

export function getEmailQueue(): Queue {
  if (!emailQueue) {
    emailQueue = getQueue("emails")
  }
  return emailQueue
}

export function getAiTaskQueue(): Queue {
  if (!aiTaskQueue) {
    aiTaskQueue = getQueue("ai-tasks")
  }
  return aiTaskQueue
}

/**
 * Enqueue a notification job.
 */
export async function enqueueNotification(data: {
  recipientId: string
  type: string
  message: string
  senderId?: string
  metadata?: Record<string, unknown>
}): Promise<string> {
  const queue = getNotificationQueue()
  const job = await queue.add("send-notification", data, {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  })
  return job.id || ""
}

/**
 * Enqueue an email job.
 */
export async function enqueueEmail(data: {
  to: string
  subject: string
  html: string
}): Promise<string> {
  const queue = getEmailQueue()
  const job = await queue.add("send-email", data, {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  })
  return job.id || ""
}

/**
 * Enqueue an AI task job.
 */
export async function enqueueAiTask(data: {
  taskType: string
  payload: Record<string, unknown>
}): Promise<string> {
  const queue = getAiTaskQueue()
  const job = await queue.add("ai-task", data, {
    attempts: 2,
    backoff: { type: "exponential", delay: 3000 },
    removeOnComplete: 200,
    removeOnFail: 50,
  })
  return job.id || ""
}

export type { Job }
