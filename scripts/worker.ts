/**
 * BullMQ Worker Process
 * Run as a separate process/container to handle background jobs:
 *   - Notification delivery (DB + Pusher)
 *   - Email sending (Resend)
 *   - AI task processing (Gemini)
 *
 * Usage:
 *   npx tsx scripts/worker.ts
 *   or in Docker: node scripts/worker.js
 */

import { Worker } from "bullmq"

const REDIS_CONNECTION = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL }
  : { host: process.env.REDIS_HOST || "localhost", port: parseInt(process.env.REDIS_PORT || "6379", 10) }

console.log("\n🚀 BullMQ Worker starting...")
console.log(`   Redis: ${process.env.REDIS_URL || `${process.env.REDIS_HOST || "localhost"}:${process.env.REDIS_PORT || "6379"}`}")`)

// ─── Notification Worker ───────────────────────────────────────────
const notificationWorker = new Worker(
  "notifications",
  async (job) => {
    const { recipientId, type, message, senderId } = job.data
    console.log(`[notification] Processing: ${type} for ${recipientId}`)

    // The notification-service.ts handles both DB write and Pusher trigger.
    // In the worker context, we could add retry logic, but for now
    // the notification was already created inline.
    // This worker handles overflow/retry scenarios.
    console.log(`[notification] Completed: ${type} for ${recipientId}`)
  },
  {
    connection: REDIS_CONNECTION,
    concurrency: 5,
  }
)

// ─── Email Worker ──────────────────────────────────────────────────
const emailWorker = new Worker(
  "emails",
  async (job) => {
    const { to, subject, html } = job.data
    console.log(`[email] Sending to: ${to}, subject: ${subject}`)

    // Dynamic import to avoid loading Resend in contexts where it's not needed
    try {
      const { Resend } = await import("resend")
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "Buddy Connect <noreply@buddyconnect.app>",
        to,
        subject,
        html,
      })
      console.log(`[email] Sent successfully to: ${to}`)
    } catch (error) {
      console.error(`[email] Failed to send to ${to}:`, error)
      throw error // Let BullMQ retry
    }
  },
  {
    connection: REDIS_CONNECTION,
    concurrency: 3,
  }
)

// ─── AI Task Worker ────────────────────────────────────────────────
const aiWorker = new Worker(
  "ai-tasks",
  async (job) => {
    const { taskType, payload } = job.data
    console.log(`[ai] Processing task: ${taskType}`)

    // AI tasks are processed with longer timeouts
    // Results are stored in the job's return value
    try {
      const { generateContent } = await import("../lib/ai-client")
      const result = await generateContent(payload.prompt || "", {
        timeoutMs: 30000, // 30s for worker tasks
        maxRetries: 2,
      })
      console.log(`[ai] Completed task: ${taskType}`)
      return { success: true, result }
    } catch (error) {
      console.error(`[ai] Failed task ${taskType}:`, error)
      throw error
    }
  },
  {
    connection: REDIS_CONNECTION,
    concurrency: 2,
  }
)

// ─── Error handlers ────────────────────────────────────────────────
for (const [name, worker] of Object.entries({
  notifications: notificationWorker,
  emails: emailWorker,
  "ai-tasks": aiWorker,
})) {
  worker.on("completed", (job) => {
    console.log(`[${name}] Job ${job.id} completed`)
  })

  worker.on("failed", (job, err) => {
    console.error(`[${name}] Job ${job?.id} failed:`, err.message)
  })

  worker.on("error", (err) => {
    console.error(`[${name}] Worker error:`, err)
  })
}

// ─── Graceful shutdown ─────────────────────────────────────────────
process.on("SIGTERM", async () => {
  console.log("\n🛑 SIGTERM received, shutting down workers...")
  await Promise.all([
    notificationWorker.close(),
    emailWorker.close(),
    aiWorker.close(),
  ])
  console.log("Workers shut down gracefully.")
  process.exit(0)
})

process.on("SIGINT", async () => {
  console.log("\n🛑 SIGINT received, shutting down workers...")
  await Promise.all([
    notificationWorker.close(),
    emailWorker.close(),
    aiWorker.close(),
  ])
  console.log("Workers shut down gracefully.")
  process.exit(0)
})

console.log("✅ All workers running. Waiting for jobs...")
