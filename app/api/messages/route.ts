import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
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
      const db = await getDatabase()
      const user = await db.collection("users").findOne(
        { _id: new ObjectId(userId) },
        { projection: { connections: 1 } }
      )
      return (user?.connections || []).some(
        (id: any) => id.toString() === targetId
      )
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

    const db = await getDatabase()
    const query: any = {
      $or: [
        { from: new ObjectId(userId), to: new ObjectId(withId) },
        { from: new ObjectId(withId), to: new ObjectId(userId) },
      ],
    }

    // Cursor-based pagination: fetch messages before cursor
    if (cursor) {
      const cursorDate = new Date(cursor)
      if (!isNaN(cursorDate.getTime())) {
        query.createdAt = { $lt: cursorDate }
      }
    }

    const messages = await db
      .collection("messages")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .toArray()

    const hasMore = messages.length > limit
    const page = messages.slice(0, limit).reverse() // Reverse to chronological order

    const serialized = page.map((m: any) => ({
      _id: m._id?.toString(),
      from: m.from?.toString(),
      to: m.to?.toString(),
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

    const db = await getDatabase()
    const message = {
      from: new ObjectId(userId),
      to: new ObjectId(to),
      content: content.slice(0, 5000), // Max 5000 chars
      readAt: null,
      createdAt: new Date(),
    }

    const result = await db.collection("messages").insertOne(message)

    const serialized = {
      _id: result.insertedId.toString(),
      from: message.from.toString(),
      to: message.to.toString(),
      content: message.content,
      readAt: null,
      createdAt: message.createdAt.toISOString(),
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
