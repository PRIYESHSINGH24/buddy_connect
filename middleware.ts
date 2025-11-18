import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Paths that should be accessible without authentication
const PUBLIC_PATHS: Array<(path: string) => boolean> = [
  // Auth pages
  (p) => p.startsWith("/login"),
  (p) => p.startsWith("/signup"),
  // Public profiles
  (p) => p.startsWith("/u/"),
  (p) => p.startsWith("/users/"),

  // Static and Next internals
  (p) => p.startsWith("/_next"),
  (p) => p === "/favicon.ico",
  (p) => p === "/logo.svg",

  // Auth API endpoints
  (p) => p.startsWith("/api/auth/login"),
  (p) => p.startsWith("/api/auth/signup"),
  (p) => p.startsWith("/api/auth/logout"),
]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public paths through
  const isPublic = PUBLIC_PATHS.some((fn) => fn(pathname))
  if (isPublic) return NextResponse.next()

  // Check auth cookie
  const token = req.cookies.get("auth_token")?.value
  if (!token) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = "/login"
    // Optional: preserve intended path to return after login
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Optionally narrow middleware execution to app routes only
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
