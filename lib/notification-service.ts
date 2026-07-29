import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
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
    const db = await getDatabase()

    const notification = {
      recipient: new ObjectId(recipientId),
      ...(data.senderId && { sender: new ObjectId(data.senderId) }),
      type: data.type,
      message: data.message,
      ...(data.jobId && { jobId: new ObjectId(data.jobId) }),
      read: false,
      createdAt: new Date(),
    }

    const result = await db
      .collection("notifications")
      .insertOne(notification)

    // Trigger real-time notification via Pusher (fire and forget)
    triggerNotification(recipientId, {
      _id: result.insertedId.toString(),
      type: data.type,
      message: data.message,
      senderId: data.senderId,
      createdAt: notification.createdAt.toISOString(),
    }).catch((err) =>
      console.error("Failed to trigger Pusher notification:", err)
    )

    return result.insertedId.toString()
  } catch (error) {
    console.error("sendNotification error:", error)
    return null
  }
}
