import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyAuth } from "@/lib/auth"

function randomToken() {
  return [...crypto.getRandomValues(new Uint8Array(16))].map(b=>b.toString(16).padStart(2,'0')).join('')
}

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const db = await getDatabase()
    const token = randomToken()
    await db.collection("users").updateOne({ _id: new (require("mongodb").ObjectId)(userId) }, { $set: { verificationToken: token } })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    const link = `${appUrl}/api/auth/verify?token=${token}`
    // Normally send via email; for now return link for testing
    return NextResponse.json({ ok: true, verifyLink: link })
  } catch (e) {
    console.error("request-verify error:", e)
    return NextResponse.json({ error: "Failed to create verification link" }, { status: 500 })
  }
}
