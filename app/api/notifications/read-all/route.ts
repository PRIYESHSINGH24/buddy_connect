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

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const db = await getDatabase()
    await db.collection("notifications").updateMany(
      { recipient: new ObjectId(userId), read: { $ne: true } },
      { $set: { read: true } }
    )

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Mark all read error:", e)
    return NextResponse.json({ error: "Failed to mark notifications as read" }, { status: 500 })
  }
}
