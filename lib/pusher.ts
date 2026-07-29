import Pusher from "pusher"
import PusherClient from "pusher-js"

// ─── Server-side Pusher instance ───────────────────────────────────
let serverPusher: Pusher | null = null

/**
 * Get the server-side Pusher instance.
 * Returns null if Pusher is not configured.
 */
export function getServerPusher(): Pusher | null {
  if (serverPusher) return serverPusher

  const appId = process.env.PUSHER_APP_ID
  const key = process.env.PUSHER_KEY
  const secret = process.env.PUSHER_SECRET
  const cluster = process.env.PUSHER_CLUSTER

  if (!appId || !key || !secret || !cluster) {
    return null
  }

  serverPusher = new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  })

  return serverPusher
}

// ─── Client-side Pusher instance ───────────────────────────────────
let clientPusher: PusherClient | null = null

/**
 * Get the client-side Pusher instance (for use in React components).
 * Returns null if Pusher is not configured.
 */
export function getClientPusher(): PusherClient | null {
  if (typeof window === "undefined") return null // Server-side guard
  if (clientPusher) return clientPusher

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER

  if (!key || !cluster) {
    return null
  }

  clientPusher = new PusherClient(key, {
    cluster,
    authEndpoint: "/api/pusher/auth",
  })

  return clientPusher
}

// ─── Channel naming conventions ────────────────────────────────────

/**
 * Get the private channel name for a conversation between two users.
 * Channel name is deterministic — IDs are sorted so both users subscribe to the same channel.
 */
export function conversationChannel(userId1: string, userId2: string): string {
  const sorted = [userId1, userId2].sort()
  return `private-conversation-${sorted[0]}-${sorted[1]}`
}

/**
 * Get the private channel name for a user's notifications.
 */
export function notificationChannel(userId: string): string {
  return `private-notifications-${userId}`
}

// ─── Event types ───────────────────────────────────────────────────

export const PUSHER_EVENTS = {
  NEW_MESSAGE: "new-message",
  MESSAGES_READ: "messages-read",
  NEW_NOTIFICATION: "new-notification",
  TYPING: "client-typing",
} as const

// ─── Server-side triggers ──────────────────────────────────────────

/**
 * Trigger a new message event on a conversation channel.
 */
export async function triggerNewMessage(
  fromUserId: string,
  toUserId: string,
  message: {
    _id: string
    from: string
    to: string
    content: string
    createdAt: string
  }
): Promise<void> {
  const pusher = getServerPusher()
  if (!pusher) return

  try {
    await pusher.trigger(
      conversationChannel(fromUserId, toUserId),
      PUSHER_EVENTS.NEW_MESSAGE,
      message
    )
  } catch (error) {
    console.error("Pusher triggerNewMessage error:", error)
  }
}

/**
 * Trigger a read receipt event.
 */
export async function triggerMessagesRead(
  userId: string,
  otherUserId: string,
  messageIds: string[]
): Promise<void> {
  const pusher = getServerPusher()
  if (!pusher) return

  try {
    await pusher.trigger(
      conversationChannel(userId, otherUserId),
      PUSHER_EVENTS.MESSAGES_READ,
      { readBy: userId, messageIds }
    )
  } catch (error) {
    console.error("Pusher triggerMessagesRead error:", error)
  }
}

/**
 * Trigger a notification event for a user.
 */
export async function triggerNotification(
  recipientId: string,
  notification: {
    _id: string
    type: string
    message: string
    senderId?: string
    createdAt: string
  }
): Promise<void> {
  const pusher = getServerPusher()
  if (!pusher) return

  try {
    await pusher.trigger(
      notificationChannel(recipientId),
      PUSHER_EVENTS.NEW_NOTIFICATION,
      notification
    )
  } catch (error) {
    console.error("Pusher triggerNotification error:", error)
  }
}
