import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { verifyAuth } from "@/lib/auth"

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

    const doc = (result as any)?.value || result
    if (!doc) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Mark read error:", e)
    return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 })
  }
}
