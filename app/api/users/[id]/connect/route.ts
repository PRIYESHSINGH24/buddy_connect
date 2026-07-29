import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { verifyAuth } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> } | any) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const resolved = params && typeof params.then === "function" ? await params : params
    const targetId = resolved.id
    if (!targetId) return NextResponse.json({ error: "Target user id required" }, { status: 400 })
    if (targetId === userId) return NextResponse.json({ error: "Cannot connect to self" }, { status: 400 })

    const db = await getDatabase()

    // Add to target incomingRequests and to requester outgoingRequests
    await Promise.all([
      db.collection("users").updateOne({ _id: new ObjectId(targetId) }, { $addToSet: { incomingRequests: new ObjectId(userId) } as any } as any),
      db.collection("users").updateOne({ _id: new ObjectId(userId) }, { $addToSet: { outgoingRequests: new ObjectId(targetId) } as any } as any),
    ])

    return NextResponse.json({ message: "Connection request sent" }, { status: 200 })
  } catch (error) {
    console.error("Send connect request error:", error)
    return NextResponse.json({ error: "Failed to send request" }, { status: 500 })
  }
}
