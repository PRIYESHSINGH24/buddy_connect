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

    // Verify both users exist (cheap, index-only reads)
    const [target, me] = await Promise.all([
      prisma.user.findUnique({ where: { id: targetId }, select: { id: true } }),
      prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
    ])
    if (!target || !me) return NextResponse.json({ error: "User not found" }, { status: 404 })

    // Atomic append-if-missing (array ops run inside the UPDATE itself):
    // concurrent requests can't clobber each other the way read-then-set can.
    await prisma.$transaction([
      prisma.$executeRaw`
        UPDATE "User"
        SET "incomingRequests" = CASE
          WHEN "incomingRequests" @> ARRAY[${userId}]::text[] THEN "incomingRequests"
          ELSE array_append("incomingRequests", ${userId})
        END
        WHERE "id" = ${targetId}
      `,
      prisma.$executeRaw`
        UPDATE "User"
        SET "outgoingRequests" = CASE
          WHEN "outgoingRequests" @> ARRAY[${targetId}]::text[] THEN "outgoingRequests"
          ELSE array_append("outgoingRequests", ${targetId})
        END
        WHERE "id" = ${userId}
      `,
    ])

    return NextResponse.json({ message: "Connection request sent" }, { status: 200 })
  } catch (error) {
    console.error("Send connect request error:", error)
    return NextResponse.json({ error: "Failed to send request" }, { status: 500 })
  }
}
