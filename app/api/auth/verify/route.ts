import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

    const result = await prisma.user.updateMany({
      where: { verificationToken: token },
      data: { emailVerified: true, verificationToken: null },
    })

    if (result.count === 0) return NextResponse.json({ error: 'Invalid token' }, { status: 400 })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('verify error:', e)
    return NextResponse.json({ error: 'Failed to verify' }, { status: 500 })
  }
}
