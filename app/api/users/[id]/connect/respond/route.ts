import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

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

    const [target, requester] = await Promise.all([
      prisma.user.findUnique({
        where: { id: targetId },
        select: { connections: true, incomingRequests: true },
      }),
      prisma.user.findUnique({
        where: { id: requesterId },
        select: { connections: true, outgoingRequests: true },
      }),
    ])
    if (!target || !requester) return NextResponse.json({ error: "User not found" }, { status: 404 })

    if (action === "accept") {
      // Add each other as connections and remove pending requests
      await prisma.$transaction([
        prisma.user.update({
          where: { id: targetId },
          data: {
            connections: { set: Array.from(new Set([...(target.connections || []), requesterId])) },
            incomingRequests: { set: (target.incomingRequests || []).filter((id) => id !== requesterId) },
          },
        }),
        prisma.user.update({
          where: { id: requesterId },
          data: {
            connections: { set: Array.from(new Set([...(requester.connections || []), targetId])) },
            outgoingRequests: { set: (requester.outgoingRequests || []).filter((id) => id !== targetId) },
          },
        }),
      ])

      return NextResponse.json({ message: "Connection accepted" }, { status: 200 })
    }

    // decline
    if (action === "decline") {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: targetId },
          data: { incomingRequests: { set: (target.incomingRequests || []).filter((id) => id !== requesterId) } },
        }),
        prisma.user.update({
          where: { id: requesterId },
          data: { outgoingRequests: { set: (requester.outgoingRequests || []).filter((id) => id !== targetId) } },
        }),
      ])

      return NextResponse.json({ message: "Connection declined" }, { status: 200 })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (error) {
    console.error("Respond connect request error:", error)
    return NextResponse.json({ error: "Failed to respond" }, { status: 500 })
  }
}
