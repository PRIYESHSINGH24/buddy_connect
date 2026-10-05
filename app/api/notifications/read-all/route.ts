import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    await prisma.notification.updateMany(
      { where: { recipient: userId, read: false }, data: { read: true } }
    )

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Mark all read error:", e)
    return NextResponse.json({ error: "Failed to mark notifications as read" }, { status: 500 })
  }
}
