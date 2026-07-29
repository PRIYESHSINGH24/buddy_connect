import { Redis } from "@upstash/redis"

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
    })
  : null

/**
 * Get a cached value by key.
 * Returns null if Redis is not configured or key doesn't exist.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null
  try {
    const value = await redis.get<T>(key)
    return value
  } catch (error) {
    console.error("Redis cacheGet error:", error)
    return null
  }
}

/**
 * Set a cached value with TTL in seconds.
 */
export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number
): Promise<void> {
  if (!redis) return
  try {
    await redis.set(key, value, { ex: ttlSeconds })
  } catch (error) {
    console.error("Redis cacheSet error:", error)
  }
}

/**
 * Delete a cached key.
 */
export async function cacheDelete(key: string): Promise<void> {
  if (!redis) return
  try {
    await redis.del(key)
  } catch (error) {
    console.error("Redis cacheDelete error:", error)
  }
}

/**
 * Delete all cached keys matching a pattern.
 * Use carefully — SCAN-based, not atomic.
 */
export async function cacheDeletePattern(pattern: string): Promise<void> {
  if (!redis) return
  try {
    let cursor: any = 0
    do {
      const result = await redis.scan(cursor, { match: pattern, count: 100 })
      cursor = result[0]
      const keys = result[1]
      if (keys.length > 0) {
        await Promise.all(keys.map((k) => redis!.del(k)))
      }
    } while (cursor !== 0 && cursor !== "0")
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

/** Export the raw Redis client for advanced use (rate limiting etc.) */
export { redis }
