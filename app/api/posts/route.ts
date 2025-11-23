import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Get all posts
export async function GET(request: NextRequest) {
  try {
    const start = performance.now()
    const { searchParams } = new URL(request.url)
    const limitParam = parseInt(searchParams.get("limit") || "10", 10)
    const before = searchParams.get("cursor")
    const limit = Math.min(Math.max(limitParam, 1), 50)

    const db = await getDatabase()
    const query: any = {}
    if (before) {
      const beforeDate = new Date(before)
      if (!isNaN(beforeDate.getTime())) {
        query.createdAt = { $lt: beforeDate }
      }
    }

    const dbStart = performance.now()
    const posts = await db
      .collection("posts")
      .find(query, {
        projection: {
          userId: 1,
          author: 1,
          authorImage: 1,
          content: 1,
          image: 1,
          attachments: 1,
          likes: 1,
          comments: 1,
          createdAt: 1,
        },
      })
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .toArray()
    const dbDuration = performance.now() - dbStart

    // Serialize ObjectId and Date fields so the client receives simple JSON
    const serialized = posts.slice(0, limit).map((p: any) => ({
      ...p,
      _id: p._id?.toString(),
      userId: p.userId?.toString(),
      likes: (p.likes || []).map((id: any) => id?.toString()),
      comments: (p.comments || []).map((c: any) => ({
        ...c,
        _id: c._id?.toString(),
        userId: c.userId?.toString(),
        createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : null,
      })),
      attachments: p.attachments || [],
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
    }))

    const hasMore = posts.length > limit
    const nextCursor = serialized.length > 0 ? serialized[serialized.length - 1].createdAt : null
    const duration = performance.now() - start
    console.log(`[GET /api/posts] ${duration.toFixed(2)}ms (db: ${dbDuration.toFixed(2)}ms), ${serialized.length} posts`)

    return NextResponse.json({ posts: serialized, nextCursor, hasMore }, {
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
    const body = await request.json()
    const { userId, author, authorImage, content, image, attachments } = body

    if (!userId || !author || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const sanitizedAttachments = Array.isArray(attachments)
      ? attachments
          .slice(0, 5)
          .map((file) => ({
            name: typeof file.name === "string" ? file.name.slice(0, 255) : "attachment",
            type: typeof file.type === "string" ? file.type : "application/octet-stream",
            size: Number.isFinite(file.size) ? Math.min(file.size, 20 * 1024 * 1024) : 0,
            data: typeof file.data === "string" ? file.data : "",
          }))
          .filter((file) => file.data && file.size <= 20 * 1024 * 1024)
      : []

    const db = await getDatabase()
    const result = await db.collection("posts").insertOne({
      userId: new ObjectId(userId),
      author,
      authorImage,
      content,
      image: image || null, // important fix
      attachments: sanitizedAttachments,
      likes: [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({ message: "Post created", postId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Create post error:", error)
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}
