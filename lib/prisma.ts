import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    // Connection pool tuning for concurrent traffic:
    // pg defaults to max=10 connections with an infinite wait — under load,
    // requests queue forever ("page never loads"). Size the pool explicitly
    // and fail fast instead of hanging when the DB is saturated.
    max: Number(process.env.DB_POOL_MAX) || 20,
    idleTimeoutMillis: 30_000, // reap idle connections
    connectionTimeoutMillis: 5_000, // error after 5s instead of waiting forever
  })
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma
