import "dotenv/config"

// Build-time fallback: on Vercel, DATABASE_URL is injected via env vars.
// Locally, it's in .env.local. The fallback is a syntactically valid URL
// so prisma generate can run without failing, and the client connects to the
// real DB using the DATABASE_URL at runtime via lib/prisma.ts and
// next.config.mjs (which overrides the schema's datasource).
const databaseUrl = process.env.DATABASE_URL || "postgresql://localhost:5432/buddy_connect"

import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
})
