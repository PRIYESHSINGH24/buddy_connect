import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { triggerMessagesRead } from "@/lib/pusher"

/**
 * POST /api/messages/read
 * Mark messages as read and trigger read receipt events.
 * Body: { messageIds: string[], conversationWith: string }
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { messageIds, conversationWith } = body

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json(
        { error: "messageIds array is required" },
        { status: 400 }
      )
    }

    if (!conversationWith) {
      return NextResponse.json(
        { error: "conversationWith is required" },
        { status: 400 }
      )
    }

    // Only mark messages that are sent TO the current user (not FROM)
    const ids = messageIds.filter((id): id is string => typeof id === "string" && id.length > 0)

    if (ids.length === 0) {
      return NextResponse.json({ error: "No valid message IDs" }, { status: 400 })
    }

    const result = await prisma.message.updateMany({
      where: {
        id: { in: ids },
        to: userId, // Only mark messages sent TO me
        readAt: null, // Only mark unread messages
      },
      data: { readAt: new Date() },
    })

    // Trigger read receipt via Pusher (fire and forget)
    if (result.count > 0) {
      triggerMessagesRead(userId, conversationWith, messageIds).catch((err) =>
        console.error("Pusher read receipt trigger failed:", err)
      )
    }

    return NextResponse.json(
      {
        marked: result.count,
        messageIds,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Mark messages read error:", error)
    return NextResponse.json(
      { error: "Failed to mark messages as read" },
      { status: 500 }
    )
  }
}
