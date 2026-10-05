import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { cacheFetch, cacheDelete } from "@/lib/redis"
import { triggerNewMessage } from "@/lib/pusher"

/**
 * Check if two users are connected, with Redis caching.
 */
async function isConnected(userId: string, targetId: string): Promise<boolean> {
  return cacheFetch<boolean>(
    `conn:${[userId, targetId].sort().join(":")}`,
    30, // 30 second TTL
    async () => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { connections: true },
      })
      return (user?.connections || []).includes(targetId)
    }
  )
}

// GET /api/messages?with=<userId>&cursor=<ISO date>&limit=<number>
export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const withId = request.nextUrl.searchParams.get("with")
    if (!withId) return NextResponse.json({ error: "Missing 'with' param" }, { status: 400 })

    // Check connection (cached)
    const connected = await isConnected(userId, withId)
    if (!connected) return NextResponse.json({ error: "Not connected" }, { status: 403 })

    // Pagination params
    const cursor = request.nextUrl.searchParams.get("cursor")
    const limitParam = parseInt(request.nextUrl.searchParams.get("limit") || "50", 10)
    const limit = Math.min(Math.max(limitParam, 1), 100)

    const query: any = {
      OR: [
        { from: userId, to: withId },
        { from: withId, to: userId },
      ],
    }

    // Cursor-based pagination: fetch messages before cursor
    if (cursor) {
      const cursorDate = new Date(cursor)
      if (!isNaN(cursorDate.getTime())) {
        query.createdAt = { lt: cursorDate }
      }
    }

    const messages = await prisma.message.findMany({
      where: query,
      orderBy: { createdAt: "desc" },
      take: limit + 1,
    })

    const hasMore = messages.length > limit
    const page = messages.slice(0, limit).reverse() // Reverse to chronological order

    const serialized = page.map((m) => ({
      _id: m.id,
      from: m.from,
      to: m.to,
      content: m.content,
      readAt: m.readAt ? new Date(m.readAt).toISOString() : null,
      createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : null,
    }))

    const nextCursor = hasMore && messages.length > limit
      ? new Date(messages[limit].createdAt).toISOString()
      : null

    return NextResponse.json({ messages: serialized, nextCursor, hasMore }, { status: 200 })
  } catch (error) {
    console.error("Get messages error:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

// POST /api/messages { to, content }
export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const body = await request.json()
    const { to, content } = body
    if (!to || !content) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

    // Check connection (cached)
    const connected = await isConnected(userId, to)
    if (!connected) return NextResponse.json({ error: "Not connected" }, { status: 403 })

    const created = await prisma.message.create({
      data: {
        from: userId,
        to,
        content: content.slice(0, 5000), // Max 5000 chars
        readAt: null,
      },
    })

    const serialized = {
      _id: created.id,
      from: created.from,
      to: created.to,
      content: created.content,
      readAt: null,
      createdAt: created.createdAt.toISOString(),
    }

    // Trigger real-time delivery via Pusher (fire and forget)
    triggerNewMessage(userId, to, serialized).catch((err) =>
      console.error("Pusher trigger failed:", err)
    )

    return NextResponse.json({ message: serialized }, { status: 201 })
  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
