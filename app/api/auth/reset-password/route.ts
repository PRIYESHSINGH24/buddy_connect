import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { hashPassword } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()
    if (!token || !newPassword) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const db = await getDatabase()
    const user = await db.collection('users').findOne({ resetToken: token })
    if (!user || !user.resetTokenExpires || new Date(user.resetTokenExpires) < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    const hash = await hashPassword(newPassword)
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { password: hash }, $unset: { resetToken: "", resetTokenExpires: "" } }
    )

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('reset-password error:', e)
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}
