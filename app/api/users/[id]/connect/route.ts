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
    if (targetId === userId) return NextResponse.json({ error: "Cannot connect to self" }, { status: 400 })

    // Add to target incomingRequests and to requester outgoingRequests ($addToSet semantics)
    const [target, me] = await Promise.all([
      prisma.user.findUnique({ where: { id: targetId }, select: { incomingRequests: true } }),
      prisma.user.findUnique({ where: { id: userId }, select: { outgoingRequests: true } }),
    ])
    if (!target || !me) return NextResponse.json({ error: "User not found" }, { status: 404 })

    await prisma.$transaction([
      prisma.user.update({
        where: { id: targetId },
        data: { incomingRequests: { set: Array.from(new Set([...(target.incomingRequests || []), userId])) } },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { outgoingRequests: { set: Array.from(new Set([...(me.outgoingRequests || []), targetId])) } },
      }),
    ])

    return NextResponse.json({ message: "Connection request sent" }, { status: 200 })
  } catch (error) {
    console.error("Send connect request error:", error)
    return NextResponse.json({ error: "Failed to send request" }, { status: 500 })
  }
}
