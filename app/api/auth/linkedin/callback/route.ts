import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { signToken } from "@/lib/auth"

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || ""
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET || ""
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || ""
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

/**
 * GET /api/auth/linkedin/callback
 * Handles the OAuth callback from LinkedIn.
 */
export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code")
    const error = request.nextUrl.searchParams.get("error")

    if (error || !code) {
      const redirectUrl = new URL("/login", APP_URL)
      redirectUrl.searchParams.set("error", error || "no_code")
      return NextResponse.redirect(redirectUrl)
    }

    // Exchange code for access token
    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: LINKEDIN_REDIRECT_URI,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
      }),
    })

    if (!tokenRes.ok) {
      console.error("LinkedIn token exchange failed:", await tokenRes.text())
      return NextResponse.redirect(new URL("/login?error=token_exchange", APP_URL))
    }

    const tokenData = await tokenRes.json()
    const accessToken = tokenData.access_token

    // Fetch user profile from LinkedIn
    const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!profileRes.ok) {
      console.error("LinkedIn profile fetch failed:", await profileRes.text())
      return NextResponse.redirect(new URL("/login?error=profile_fetch", APP_URL))
    }

    const profile = await profileRes.json()
    const email = profile.email
    const name = profile.name || `${profile.given_name || ""} ${profile.family_name || ""}`.trim()

    if (!email) {
      return NextResponse.redirect(new URL("/login?error=no_email", APP_URL))
    }

    // Check if user exists, create if not
    let user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    let userId: string

    if (!user) {
      // Create new user from LinkedIn profile
      const created = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: "", // OAuth users don't have passwords
          name,
          college: "",
          department: "",
          year: "",
          skills: [],
          bio: "",
          interests: [],
          linkedinUrl: profile.sub ? `https://www.linkedin.com/in/${profile.sub}` : "",
          profileImage: profile.picture || "",
          emailVerified: true, // LinkedIn already verified
        },
      })
      userId = created.id
    } else {
      // Update existing user with LinkedIn data
      await prisma.user.update({
        where: { id: user.id },
        data: {
          linkedinUrl: profile.sub ? `https://www.linkedin.com/in/${profile.sub}` : user.linkedinUrl,
          profileImage: profile.picture || user.profileImage,
          emailVerified: true,
        },
      })
      userId = user.id
    }

    // Sign JWT and set cookie
    const token = await signToken({ userId, email })

    const response = NextResponse.redirect(new URL("/dashboard", APP_URL))
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error("LinkedIn OAuth callback error:", error)
    return NextResponse.redirect(new URL("/login?error=callback_failed", APP_URL))
  }
}
