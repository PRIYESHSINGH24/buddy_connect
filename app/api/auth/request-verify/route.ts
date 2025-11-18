import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")

async function verifyAuth(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value
    if (!token) return null
    const decoded = await jwtVerify(token, JWT_SECRET)
    return decoded.payload.userId as string
  } catch {
    return null
  }
}

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
