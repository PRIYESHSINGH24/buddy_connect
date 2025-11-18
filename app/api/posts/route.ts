import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Get all posts
export async function GET(request: NextRequest) {
  try {
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

    const posts = await db
      .collection("posts")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()

    // Serialize ObjectId and Date fields so the client receives simple JSON
    const serialized = posts.map((p: any) => ({
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
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
      updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : null,
    }))

    const nextCursor = serialized.length > 0 ? serialized[serialized.length - 1].createdAt : null
    return NextResponse.json({ posts: serialized, nextCursor }, { status: 200 })
  } catch (error) {
    console.error("Get posts error:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}

// Create new post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, author, authorImage, content, image } = body

    if (!userId || !author || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()
    const result = await db.collection("posts").insertOne({
      userId: new ObjectId(userId),
      author,
      authorImage,
      content,
      image: image || null, // important fix
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
