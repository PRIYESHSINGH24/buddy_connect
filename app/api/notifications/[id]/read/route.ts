import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")

async function verifyAuth(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value
    if (!token) return null
    const decoded = await jwtVerify(token, JWT_SECRET)
    return decoded.payload.userId as string
  } catch {
    return null
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const notifId = params.id
    if (!notifId || !ObjectId.isValid(notifId)) {
      return NextResponse.json({ error: "Invalid notification id" }, { status: 400 })
    }

    const db = await getDatabase()
    const result = await db.collection("notifications").findOneAndUpdate(
      { _id: new ObjectId(notifId), recipient: new ObjectId(userId) },
      { $set: { read: true } },
      { returnDocument: "after" }
    )

    if (!result.value) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Mark read error:", e)
    return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 })
  }
}
