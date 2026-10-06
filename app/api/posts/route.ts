import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"
import { cacheFetch, cacheDelete } from "@/lib/redis"

// Get all posts
export async function GET(request: NextRequest) {
  try {
    const start = performance.now()
    const { searchParams } = new URL(request.url)
    const limitParam = parseInt(searchParams.get("limit") || "10", 10)
    const before = searchParams.get("cursor")
    const limit = Math.min(Math.max(limitParam, 1), 50)

    const query: any = {}
    if (before) {
      const beforeDate = new Date(before)
      if (!isNaN(beforeDate.getTime())) {
        query.createdAt = { lt: beforeDate }
      }
    }

    const fetchPage = async () => {
      const dbStart = performance.now()
      const posts = await prisma.post.findMany({
        where: query,
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        select: {
          id: true,
          userId: true,
          author: true,
          authorImage: true,
          content: true,
          image: true,
          attachments: true,
          likes: true,
          comments: {
            orderBy: { createdAt: "asc" },
            take: 5, // Only fetch first 5 comments
            select: { id: true, userId: true, author: true, content: true, createdAt: true },
          },
          createdAt: true,
        },
      })
      const dbDuration = performance.now() - dbStart

      // Serialize so the client receives simple JSON (frontend contract uses `_id`)
      const serialized = posts.slice(0, limit).map((p) => ({
        ...p,
        _id: p.id,
        id: undefined,
        likes: p.likes || [],
        comments: (p.comments || []).map((c) => ({
          ...c,
          _id: c.id,
          id: undefined,
          createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : null,
        })),
        attachments: (p.attachments as any[] | null) || [],
        createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
      }))

      const hasMore = posts.length > limit
      const nextCursor = serialized.length > 0 ? serialized[serialized.length - 1].createdAt : null
      console.log(`[GET /api/posts] db: ${dbDuration.toFixed(2)}ms, ${serialized.length} posts`)

      return { posts: serialized, nextCursor, hasMore }
    }

    // Hottest endpoint: serve the first page from Redis (30s) so N concurrent
    // users don't all hit Postgres. Writes invalidate via cacheDeletePattern.
    const result = before
      ? await fetchPage()
      : await cacheFetch(`posts:firstpage:${limit}`, 30, fetchPage)

    const duration = performance.now() - start
    console.log(`[GET /api/posts] ${duration.toFixed(2)}ms, ${result.posts.length} posts`)

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    })
  } catch (error) {
    console.error("Get posts error:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}

// Create new post
export async function POST(request: NextRequest) {
  try {
    const authUserId = await verifyAuth(request)
    if (!authUserId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    const contentType = request.headers.get("content-type") || ""
    let body: any = {}

    if (contentType.includes("multipart/form-data")) {
      try {
        const formData = await request.formData()
        body.userId = formData.get("userId")?.toString()
        body.author = formData.get("author")?.toString()
        body.authorImage = formData.get("authorImage")?.toString()
        body.content = formData.get("content")?.toString()
        
        const fileCount = parseInt(formData.get("fileCount")?.toString() || "0", 10)
        const attachments: any[] = []
        
        // Process file uploads
        for (let i = 0; i < fileCount; i++) {
          const file = formData.get(`file_${i}`)
          if (file instanceof File) {
            try {
              const buffer = await file.arrayBuffer()
              const base64 = Buffer.from(buffer).toString("base64")
              const dataUrl = `data:${file.type};base64,${base64}`
              
              attachments.push({
                name: file.name,
                type: file.type || "application/octet-stream",
                size: file.size,
                data: dataUrl,
              })
            } catch (fileError) {
              console.error(`Error processing file ${i}:`, fileError)
            }
          }
        }
        body.attachments = attachments
      } catch (parseError) {
        console.error("FormData parsing error:", parseError)
        return NextResponse.json({ error: "Failed to parse request body" }, { status: 400 })
      }
    } else if (contentType.includes("application/json")) {
      body = await request.json()
    } else {
      body = await request.json()
    }

    const { userId, author, authorImage, content, attachments } = body
    const effectiveUserId = authUserId

    if (!userId || !author || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const sanitizedAttachments = Array.isArray(attachments)
      ? attachments
          .slice(0, 3) // Max 3 attachments
          .map((file) => ({
            name: typeof file.name === "string" ? file.name.slice(0, 100) : "attachment",
            type: typeof file.type === "string" ? file.type : "application/octet-stream",
            size: Number.isFinite(file.size) ? Math.min(file.size, 5 * 1024 * 1024) : 0,
            data: typeof file.data === "string" ? file.data.slice(0, 1000000) : "", // Max 1MB base64
          }))
          .filter((file) => file.data && file.size <= 5 * 1024 * 1024)
      : []

    const post = await prisma.post.create({
      data: {
        userId: effectiveUserId,
        author,
        authorImage,
        content: content.slice(0, 5000), // Max 5000 chars
        attachments: sanitizedAttachments,
        likes: [],
      },
    })

    // Invalidate feed cache on new post
    cacheDelete("posts:firstpage").catch(() => {})

    return NextResponse.json({ message: "Post created", postId: post.id }, { status: 201 })
  } catch (error) {
    console.error("Create post error:", error)
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}
