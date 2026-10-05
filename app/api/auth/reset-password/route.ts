import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()
    if (!token || !newPassword) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const user = await prisma.user.findFirst({ where: { resetToken: token } })
    if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    const hash = await hashPassword(newPassword)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hash, resetToken: null, resetTokenExpires: null },
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('reset-password error:', e)
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}
