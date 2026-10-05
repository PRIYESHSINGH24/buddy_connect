import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const notifId = params.id
    if (!notifId) {
      return NextResponse.json({ error: "Invalid notification id" }, { status: 400 })
    }

    const result = await prisma.notification.updateMany({
      where: { id: notifId, recipient: userId },
      data: { read: true },
    })

    if (result.count === 0) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Mark read error:", e)
    return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 })
  }
}
