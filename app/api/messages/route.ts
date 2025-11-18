import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")

async function verifyAuth(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value
    if (!token) return null
    const decoded = await jwtVerify(token, JWT_SECRET)
    return decoded.payload.userId as string
  } catch (error) {
    return null
  }
}

// GET /api/messages?with=<userId> -> conversation between authenticated user and <userId>
export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const withId = request.nextUrl.searchParams.get("with")
    if (!withId) return NextResponse.json({ error: "Missing 'with' param" }, { status: 400 })

    const db = await getDatabase()

    // Ensure users are connected before returning messages
    const me = await db.collection("users").findOne({ _id: new ObjectId(userId) })
    const isConnected = (me?.connections || []).some((id: any) => id.toString() === withId)
    if (!isConnected) return NextResponse.json({ error: "Not connected" }, { status: 403 })

    const messages = await db
      .collection("messages")
      .find({
        $or: [
          { from: new ObjectId(userId), to: new ObjectId(withId) },
          { from: new ObjectId(withId), to: new ObjectId(userId) },
        ],
      })
      .sort({ createdAt: 1 })
      .limit(100)
      .toArray()

    const serialized = messages.map((m: any) => ({
      _id: m._id?.toString(),
      from: m.from?.toString(),
      to: m.to?.toString(),
      content: m.content,
      createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : null,
    }))

    return NextResponse.json({ messages: serialized }, { status: 200 })
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

    const db = await getDatabase()

    // Check connection
    const me = await db.collection("users").findOne({ _id: new ObjectId(userId) })
    const isConnected = (me?.connections || []).some((id: any) => id.toString() === to)
    if (!isConnected) return NextResponse.json({ error: "Not connected" }, { status: 403 })

    const message = {
      from: new ObjectId(userId),
      to: new ObjectId(to),
      content,
      createdAt: new Date(),
    }

    const result = await db.collection("messages").insertOne(message)

    const serialized = {
      _id: result.insertedId.toString(),
      from: message.from.toString(),
      to: message.to.toString(),
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    }

    return NextResponse.json({ message: serialized }, { status: 201 })
  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
