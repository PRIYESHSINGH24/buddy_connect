import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const { id: projectId } = await params

    // Atomic toggle (single UPDATE) — no read-modify-write race under concurrency
    const rows = await prisma.$queryRaw<{ id: string }[]>`
      UPDATE "Project"
      SET "likes" = CASE
        WHEN "likes" @> ARRAY[${userId}]::text[] THEN array_remove("likes", ${userId})
        ELSE array_append("likes", ${userId})
      END
      WHERE "id" = ${projectId}
      RETURNING "id"
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Like toggled successfully" }, { status: 200 })
  } catch (error) {
    console.error("Like error:", error)
    return NextResponse.json({ error: "Failed to like project" }, { status: 500 })
  }
}
