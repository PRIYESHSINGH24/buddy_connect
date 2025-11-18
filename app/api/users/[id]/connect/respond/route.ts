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

    const body = await request.json()
    const { requesterId, action } = body as { requesterId?: string; action?: string }

    if (!requesterId || !action) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

    const db = await getDatabase()

    if (action === "accept") {
      // Add each other as connections and remove pending requests
      await Promise.all([
        db.collection("users").updateOne({ _id: new ObjectId(targetId) }, { $addToSet: { connections: new ObjectId(requesterId) } as any } as any),
        db.collection("users").updateOne({ _id: new ObjectId(requesterId) }, { $addToSet: { connections: new ObjectId(targetId) } as any } as any),
        db.collection("users").updateOne({ _id: new ObjectId(targetId) }, { $pull: { incomingRequests: new ObjectId(requesterId) } as any } as any),
        db.collection("users").updateOne({ _id: new ObjectId(requesterId) }, { $pull: { outgoingRequests: new ObjectId(targetId) } as any } as any),
      ])

      return NextResponse.json({ message: "Connection accepted" }, { status: 200 })
    }

    // decline
    if (action === "decline") {
      await Promise.all([
        db.collection("users").updateOne({ _id: new ObjectId(targetId) }, { $pull: { incomingRequests: new ObjectId(requesterId) } as any } as any),
        db.collection("users").updateOne({ _id: new ObjectId(requesterId) }, { $pull: { outgoingRequests: new ObjectId(targetId) } as any } as any),
      ])

      return NextResponse.json({ message: "Connection declined" }, { status: 200 })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (error) {
    console.error("Respond connect request error:", error)
    return NextResponse.json({ error: "Failed to respond" }, { status: 500 })
  }
}
