import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import type { NextRequest } from "next/server"

// Initialize Redis for rate limiting (reuses same Upstash instance)
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
    })
  : null

// Rate limiter instances for different tiers
const limiters = redis
  ? {
      /** Login/Signup: 5 requests per 15 minutes per IP */
      auth: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "15 m"),
        prefix: "rl:auth",
        analytics: false,
      }),

      /** AI endpoints: 10 requests per minute per user */
      ai: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "1 m"),
        prefix: "rl:ai",
        analytics: false,
      }),

      /** General API: 100 requests per minute per user */
      api: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, "1 m"),
        prefix: "rl:api",
        analytics: false,
      }),

      /** Public read endpoints: 200 requests per minute per IP */
      publicRead: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(200, "1 m"),
        prefix: "rl:public",
        analytics: false,
      }),
    }
  : null

export type RateLimitTier = "auth" | "ai" | "api" | "publicRead"

/**
 * Check rate limit for a given tier and identifier.
 * Returns { success, limit, remaining, reset } or null if rate limiting is not configured.
 */
export async function checkRateLimit(
  tier: RateLimitTier,
  identifier: string
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
} | null> {
  if (!limiters) return null // Rate limiting not configured — allow through

  const limiter = limiters[tier]
  if (!limiter) return null

  try {
    const result = await limiter.limit(identifier)
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    }
  } catch (error) {
    console.error(`Rate limit check failed for tier=${tier}:`, error)
    // Fail open — don't block requests if rate limiter is down
    return null
  }
}

/**
 * Extract client IP from a Next.js request.
 */
export function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    (request as any).ip ||
    "unknown"
  )
}

/**
 * Create rate limit response headers.
 */
export function rateLimitHeaders(result: {
  limit: number
  remaining: number
  reset: number
}): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.reset),
  }
}
