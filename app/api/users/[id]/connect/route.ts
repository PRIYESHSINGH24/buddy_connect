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
