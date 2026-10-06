import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const fromUserId = await verifyAuth(request)
    if (!fromUserId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const { id } = await params

    const body = await request.json()
    const { text } = body
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: "Endorsement text required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id }, select: { id: true } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    // Atomic jsonb append (single UPDATE) — concurrent endorsements don't
    // overwrite each other the way read-then-set does.
    const entry = JSON.stringify({
      from: fromUserId,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    })
    await prisma.$executeRaw`
      UPDATE "User"
      SET "endorsements" = COALESCE("endorsements", '[]'::jsonb) || ${entry}::jsonb
      WHERE "id" = ${id}
    `

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Endorsement error:", e)
    return NextResponse.json({ error: "Failed to endorse" }, { status: 500 })
  }
}
