import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const fromUserId = await verifyAuth(request)
    if (!fromUserId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const { id } = params

    const body = await request.json()
    const { text } = body
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: "Endorsement text required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id }, select: { endorsements: true } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const current = (user.endorsements as any[]) || []
    await prisma.user.update({
      where: { id },
      data: {
        endorsements: [
          ...current,
          { from: fromUserId, text: text.trim(), createdAt: new Date().toISOString() },
        ],
      },
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Endorsement error:", e)
    return NextResponse.json({ error: "Failed to endorse" }, { status: 500 })
  }
}
