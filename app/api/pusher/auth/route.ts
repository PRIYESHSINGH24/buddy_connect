import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getServerPusher } from "@/lib/pusher"

/**
 * POST /api/pusher/auth
 * Authenticates Pusher private channel subscriptions.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const pusher = getServerPusher()
    if (!pusher) {
      return NextResponse.json(
        { error: "Real-time not configured" },
        { status: 503 }
      )
    }

    const body = await request.formData()
    const socketId = body.get("socket_id") as string
    const channel = body.get("channel_name") as string

    if (!socketId || !channel) {
      return NextResponse.json(
        { error: "Missing socket_id or channel_name" },
        { status: 400 }
      )
    }

    // Validate channel access:
    // - private-conversation-{id1}-{id2}: user must be one of the IDs
    // - private-notifications-{userId}: user must own the channel
    if (channel.startsWith("private-conversation-")) {
      const parts = channel.replace("private-conversation-", "").split("-")
      if (!parts.includes(userId)) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        )
      }
    } else if (channel.startsWith("private-notifications-")) {
      const channelUserId = channel.replace("private-notifications-", "")
      if (channelUserId !== userId) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        )
      }
    }

    const authResponse = pusher.authorizeChannel(socketId, channel)
    return NextResponse.json(authResponse)
  } catch (error) {
    console.error("Pusher auth error:", error)
    return NextResponse.json(
      { error: "Pusher auth failed" },
      { status: 500 }
    )
  }
}
