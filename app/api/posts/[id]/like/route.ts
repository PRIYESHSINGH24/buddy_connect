import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cacheDeletePattern } from "@/lib/redis"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> } | any) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // `params` may be a Promise in some Next.js runtimes — await to unwrap safely
    const resolvedParams = params && typeof params.then === "function" ? await params : params
    const postId = resolvedParams.id as string

    // Atomic toggle in a single UPDATE: concurrent likes from different users
    // serialize on the row lock instead of overwriting each other (read-modify-write race).
    const rows = await prisma.$queryRaw<{ likes: string[] }[]>`
      UPDATE "Post"
      SET "likes" = CASE
        WHEN "likes" @> ARRAY[${userId}]::text[] THEN array_remove("likes", ${userId})
        ELSE array_append("likes", ${userId})
      END
      WHERE "id" = ${postId}
      RETURNING "likes"
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    const likes = rows[0].likes || []

    // Feed payload embeds likes — drop the cached first page
    cacheDeletePattern("posts:firstpage*").catch(() => {})

    return NextResponse.json({ message: "Like toggled successfully", likes }, { status: 200 })
  } catch (error) {
    console.error("Like error:", error)
    return NextResponse.json({ error: "Failed to like post" }, { status: 500 })
  }
}
