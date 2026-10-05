import { prisma } from "@/lib/prisma"
import { triggerNotification } from "@/lib/pusher"

/**
 * Create a notification in the database and deliver it via Pusher in real-time.
 *
 * Usage:
 *   await sendNotification(recipientId, {
 *     type: "connection_request",
 *     message: "John sent you a connection request",
 *     senderId: "abc123",
 *   })
 */
export async function sendNotification(
  recipientId: string,
  data: {
    type: string
    message: string
    senderId?: string
    jobId?: string
    metadata?: Record<string, unknown>
  }
): Promise<string | null> {
  try {
    const notification = await prisma.notification.create({
      data: {
        recipient: recipientId,
        sender: data.senderId ?? null,
        type: data.type,
        message: data.message,
        jobId: data.jobId ?? null,
        read: false,
      },
    })

    // Trigger real-time notification via Pusher (fire and forget)
    triggerNotification(recipientId, {
      _id: notification.id,
      type: data.type,
      message: data.message,
      senderId: data.senderId,
      createdAt: notification.createdAt.toISOString(),
    }).catch((err) =>
      console.error("Failed to trigger Pusher notification:", err)
    )

    return notification.id
  } catch (error) {
    console.error("sendNotification error:", error)
    return null
  }
}
