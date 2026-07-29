import { NextResponse } from "next/server"

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || ""
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || ""

/**
 * GET /api/auth/linkedin
 * Redirects the user to LinkedIn's OAuth authorization page.
 */
export async function GET() {
  if (!LINKEDIN_CLIENT_ID || !LINKEDIN_REDIRECT_URI) {
    return NextResponse.json(
      { error: "LinkedIn OAuth is not configured. Set LINKEDIN_CLIENT_ID and LINKEDIN_REDIRECT_URI." },
      { status: 503 }
    )
  }

  const state = crypto.randomUUID()
  const scopes = ["openid", "profile", "email"].join("%20")

  const authUrl =
    `https://www.linkedin.com/oauth/v2/authorization?` +
    `response_type=code&` +
    `client_id=${LINKEDIN_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(LINKEDIN_REDIRECT_URI)}&` +
    `state=${state}&` +
    `scope=${scopes}`

  return NextResponse.redirect(authUrl)
}
