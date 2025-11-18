import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

function randomToken() {
  return [...crypto.getRandomValues(new Uint8Array(16))].map(b=>b.toString(16).padStart(2,'0')).join('')
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const db = await getDatabase()
    const token = randomToken()
    const expires = new Date(Date.now() + 1000 * 60 * 30) // 30 minutes
    await db.collection('users').updateOne({ email: email.toLowerCase() }, { $set: { resetToken: token, resetTokenExpires: expires } })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    const link = `${appUrl}/reset-password?token=${token}`
    // Normally email this link; return for testing
    return NextResponse.json({ ok: true, resetLink: link })
  } catch (e) {
    console.error('request-password-reset error:', e)
    return NextResponse.json({ error: 'Failed to create reset link' }, { status: 500 })
  }
}
