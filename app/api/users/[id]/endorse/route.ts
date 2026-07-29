import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { verifyAuth } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const fromUserId = await verifyAuth(request)
    if (!fromUserId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const { id } = params
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid user" }, { status: 400 })

    const body = await request.json()
    const { text } = body
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: "Endorsement text required" }, { status: 400 })
    }

    const db = await getDatabase()
    await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      { $push: { endorsements: { from: new ObjectId(fromUserId), text: text.trim(), createdAt: new Date() } } as any }
    )

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Endorsement error:", e)
    return NextResponse.json({ error: "Failed to endorse" }, { status: 500 })
  }
}
