import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

    const db = await getDatabase()
    const result = await db.collection('users').findOneAndUpdate(
      { verificationToken: token },
      { $set: { emailVerified: true }, $unset: { verificationToken: "" } },
      { returnDocument: 'after' }
    )

    if (!result.value) return NextResponse.json({ error: 'Invalid token' }, { status: 400 })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('verify error:', e)
    return NextResponse.json({ error: 'Failed to verify' }, { status: 500 })
  }
}
