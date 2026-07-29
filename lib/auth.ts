import { jwtVerify, SignJWT } from "jose"
import type { NextRequest } from "next/server"

/**
 * Lazily retrieve the JWT secret key.
 * Throws at runtime if JWT_SECRET environment variable is missing.
 */
export function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error(
      "FATAL: JWT_SECRET environment variable is not set. " +
      "This is required for authentication. " +
      "Set it in .env.local or your deployment provider."
    )
  }
  return new TextEncoder().encode(secret)
}

/**
 * Verify the auth_token cookie and return the userId.
 * Returns null if not authenticated.
 */
export async function verifyAuth(request: NextRequest | Request): Promise<string | null> {
  try {
    let token: string | undefined

    // Support both NextRequest (with cookies helper) and standard Request
    if ('cookies' in request && typeof (request as NextRequest).cookies?.get === 'function') {
      token = (request as NextRequest).cookies.get("auth_token")?.value
    } else {
      // Fallback: parse cookie header manually
      const cookieHeader = request.headers.get("cookie") || ""
      const match = cookieHeader.match(/auth_token=([^;]+)/)
      token = match?.[1]
    }

    if (!token) return null

    const secretKey = getJwtSecretKey()
    const decoded = await jwtVerify(token, secretKey)
    return decoded.payload.userId as string
  } catch {
    return null
  }
}

/**
 * Sign a JWT token with the given payload.
 * Token expires in 7 days by default.
 */
export async function signToken(
  payload: Record<string, unknown>,
  expiresIn: string = "7d"
): Promise<string> {
  const secretKey = getJwtSecretKey()
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresIn)
    .sign(secretKey)
}
