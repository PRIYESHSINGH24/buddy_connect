import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

// JWT_SECRET must be set — but middleware runs at the edge,
// so we check at runtime rather than throwing at import time.
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) return null
  return new TextEncoder().encode(secret)
}

// ─── Route classification ──────────────────────────────────────────

/** Fully public routes — no auth required */
const PUBLIC_PATHS: Array<(path: string) => boolean> = [
  // Auth pages
  (p) => p === "/login",
  (p) => p === "/signup",

  // Auth API endpoints
  (p) => p === "/api/auth/login",
  (p) => p === "/api/auth/signup",
  (p) => p === "/api/auth/logout",
  (p) => p.startsWith("/api/auth/verify"),
  (p) => p.startsWith("/api/auth/reset-password"),
  (p) => p.startsWith("/api/auth/request-password-reset"),

  // Public read-only API
  (p) => p === "/api/stats",

  // Static & Next internals
  (p) => p.startsWith("/_next"),
  (p) => p === "/favicon.ico",
  (p) => p === "/logo.svg",
  (p) => p === "/buddy-logo.svg",
  (p) => p === "/placeholder-logo.svg",
  (p) => p === "/placeholder.svg",
  (p) => p.endsWith(".png"),
  (p) => p.endsWith(".svg"),
  (p) => p.endsWith(".jpg"),
  (p) => p.endsWith(".jpeg"),
  (p) => p.endsWith(".webp"),
]

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((fn) => fn(pathname))
}

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/")
}

// ─── Middleware ─────────────────────────────────────────────────────

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1. Allow public paths through unconditionally
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // 2. Check auth cookie
  const token = req.cookies.get("auth_token")?.value
  const jwtSecret = getJwtSecret()

  if (!token || !jwtSecret) {
    return handleUnauthorized(req, pathname)
  }

  // 3. Verify JWT
  try {
    const decoded = await jwtVerify(token, jwtSecret)
    const userId = decoded.payload.userId as string | undefined

    if (!userId) {
      return handleUnauthorized(req, pathname)
    }

    // Attach userId to request headers for downstream route handlers
    const response = NextResponse.next()
    response.headers.set("x-user-id", userId)
    return response
  } catch {
    // Token expired or invalid
    return handleUnauthorized(req, pathname)
  }
}

/**
 * Handle unauthorized requests differently for API vs page routes.
 */
function handleUnauthorized(req: NextRequest, pathname: string): NextResponse {
  if (isApiRoute(pathname)) {
    // API routes: return 401 JSON (never redirect)
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    )
  }

  // Page routes: redirect to login with return path
  const loginUrl = req.nextUrl.clone()
  loginUrl.pathname = "/login"
  loginUrl.searchParams.set("redirect", pathname)
  return NextResponse.redirect(loginUrl)
}

// ─── Matcher config ────────────────────────────────────────────────

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
