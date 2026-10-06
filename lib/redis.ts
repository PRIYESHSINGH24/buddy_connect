import { Redis } from "@upstash/redis"
import { Redis as IoRedis } from "ioredis"

// Cache backend resolution:
// 1. Upstash REST (serverless) when UPSTASH_REDIS_REST_URL is set
// 2. else the local Redis from docker-compose via REDIS_HOST/REDIS_PORT
// 3. else no-op (every helper is a cache miss; app still works, just uncached)

const upstash = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
    })
  : null

const local = !upstash && process.env.REDIS_HOST
  ? new IoRedis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT) || 6379,
      connectTimeout: 1_500,
      maxRetriesPerRequest: 1,
      // Fail fast when Redis is down — a cache lookup must never hang a request
      enableOfflineQueue: false,
      retryStrategy: (times: number) => (times > 5 ? null : Math.min(times * 200, 1_000)),
    })
  : null

// ioredis retries/reconnects emit errors — we already handle failures in helpers
if (local) local.on("error", () => {})

/**
 * Get a cached value by key.
 * Returns null if no Redis is configured or key doesn't exist.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    if (upstash) {
      const value = await upstash.get<T>(key)
      return (value ?? null) as T | null
    }
    if (local) {
      const value = await local.get(key)
      if (value == null) return null
      try {
        return JSON.parse(value) as T
      } catch {
        return value as unknown as T
      }
    }
  } catch (error) {
    console.error("Redis cacheGet error:", error)
  }
  return null
}

/**
 * Set a cached value with TTL in seconds.
 */
export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number
): Promise<void> {
  try {
    if (upstash) {
      await upstash.set(key, value, { ex: ttlSeconds })
      return
    }
    if (local) {
      await local.set(key, JSON.stringify(value), "EX", ttlSeconds)
    }
  } catch (error) {
    console.error("Redis cacheSet error:", error)
  }
}

/**
 * Delete a cached key.
 */
export async function cacheDelete(key: string): Promise<void> {
  try {
    if (upstash) {
      await upstash.del(key)
      return
    }
    if (local) {
      await local.del(key)
    }
  } catch (error) {
    console.error("Redis cacheDelete error:", error)
  }
}

/**
 * Delete all cached keys matching a pattern.
 * Use carefully — SCAN-based, not atomic.
 */
export async function cacheDeletePattern(pattern: string): Promise<void> {
  try {
    if (upstash) {
      let cursor: any = 0
      do {
        const result = await upstash.scan(cursor, { match: pattern, count: 100 })
        cursor = result[0]
        const keys = result[1]
        if (keys.length > 0) {
          await Promise.all(keys.map((k) => upstash!.del(k)))
        }
      } while (cursor !== 0 && cursor !== "0")
      return
    }
    if (local) {
      let cursor = "0"
      do {
        const [next, keys] = await local.scan(cursor, "MATCH", pattern, "COUNT", 100)
        cursor = next
        if (keys.length > 0) {
          await local.del(...keys)
        }
      } while (cursor !== "0")
    }
  } catch (error) {
    console.error("Redis cacheDeletePattern error:", error)
  }
}

/**
 * Cache-aside pattern: check cache → miss → fetch → store → return.
 * If Redis is not configured, always calls fetchFn directly.
 */
export async function cacheFetch<T>(
  key: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  // Try cache first
  const cached = await cacheGet<T>(key)
  if (cached !== null) return cached

  // Cache miss — fetch from source
  const value = await fetchFn()

  // Store in cache (fire and forget)
  cacheSet(key, value, ttlSeconds).catch(() => {})

  return value
}

/**
 * Raw Upstash client (null when not configured).
 * Kept for advanced use (rate limiting etc.).
 */
export const redis = upstash
