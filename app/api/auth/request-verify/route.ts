import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

function randomToken() {
  return [...crypto.getRandomValues(new Uint8Array(16))].map(b=>b.toString(16).padStart(2,'0')).join('')
}

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const token = randomToken()
    await prisma.user.update({ where: { id: userId }, data: { verificationToken: token } })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    const link = `${appUrl}/api/auth/verify?token=${token}`
    // Normally send via email; for now return link for testing
    return NextResponse.json({ ok: true, verifyLink: link })
  } catch (e) {
    console.error("request-verify error:", e)
    return NextResponse.json({ error: "Failed to create verification link" }, { status: 500 })
  }
}
