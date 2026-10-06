import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"
import { cacheDelete } from "@/lib/redis"

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

    // Existence check only (index-only reads)
    const [target, requester] = await Promise.all([
      prisma.user.findUnique({ where: { id: targetId }, select: { id: true } }),
      prisma.user.findUnique({ where: { id: requesterId }, select: { id: true } }),
    ])
    if (!target || !requester) return NextResponse.json({ error: "User not found" }, { status: 404 })

    if (action === "accept") {
      // All array moves happen atomically inside the UPDATEs
      // (append-if-missing + array_remove) — parallel accepts can't lose connections.
      await prisma.$transaction([
        prisma.$executeRaw`
          UPDATE "User"
          SET "connections" = CASE
                WHEN "connections" @> ARRAY[${requesterId}]::text[] THEN "connections"
                ELSE array_append("connections", ${requesterId})
              END,
              "incomingRequests" = array_remove("incomingRequests", ${requesterId})
          WHERE "id" = ${targetId}
        `,
        prisma.$executeRaw`
          UPDATE "User"
          SET "connections" = CASE
                WHEN "connections" @> ARRAY[${targetId}]::text[] THEN "connections"
                ELSE array_append("connections", ${targetId})
              END,
              "outgoingRequests" = array_remove("outgoingRequests", ${targetId})
          WHERE "id" = ${requesterId}
        `,
      ])

      // Conversation-gate cache for this pair is now stale
      cacheDelete(`conn:${[targetId, requesterId].sort().join(":")}`).catch(() => {})

      return NextResponse.json({ message: "Connection accepted" }, { status: 200 })
    }

    // decline (array_remove is idempotent under concurrency)
    if (action === "decline") {
      await prisma.$transaction([
        prisma.$executeRaw`
          UPDATE "User" SET "incomingRequests" = array_remove("incomingRequests", ${requesterId})
          WHERE "id" = ${targetId}
        `,
        prisma.$executeRaw`
          UPDATE "User" SET "outgoingRequests" = array_remove("outgoingRequests", ${targetId})
          WHERE "id" = ${requesterId}
        `,
      ])

      return NextResponse.json({ message: "Connection declined" }, { status: 200 })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (error) {
    console.error("Respond connect request error:", error)
    return NextResponse.json({ error: "Failed to respond" }, { status: 500 })
  }
}
