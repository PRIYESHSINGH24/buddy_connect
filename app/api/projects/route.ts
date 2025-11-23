import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Get all projects (paginated)
export async function GET(request: NextRequest) {
  try {
    const start = performance.now()
    const { searchParams } = new URL(request.url)
    const limitParam = parseInt(searchParams.get("limit") || "12", 10)
    const before = searchParams.get("cursor")
    const userId = searchParams.get("userId")
    const limit = Math.min(Math.max(limitParam, 1), 50)

    const db = await getDatabase()
    const query: any = {}
    if (before) {
      const beforeDate = new Date(before)
      if (!isNaN(beforeDate.getTime())) {
        query.createdAt = { $lt: beforeDate }
      }
    }
    if (userId && ObjectId.isValid(userId)) {
      query.userId = new ObjectId(userId)
    }

    const dbStart = performance.now()
    const projects = await db
      .collection("projects")
      .find(query, {
        projection: {
          userId: 1,
          author: 1,
          title: 1,
          description: 1,
          technologies: 1,
          image: 1,
          likes: 1,
          createdAt: 1,
        },
      })
      .sort({ createdAt: -1 })
      .limit(limit + 1) // +1 to check if more exist
      .toArray()
    const dbDuration = performance.now() - dbStart

    // serialize
    const serialized = projects.slice(0, limit).map((p: any) => ({
      ...p,
      _id: p._id?.toString(),
      userId: p.userId?.toString?.(),
      likes: (p.likes || []).map((id: any) => id?.toString?.()),
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
    }))

    const hasMore = projects.length > limit
    const nextCursor = hasMore ? serialized[serialized.length - 1].createdAt : null
    const duration = performance.now() - start
    console.log(`[GET /api/projects] ${duration.toFixed(2)}ms (db: ${dbDuration.toFixed(2)}ms), ${serialized.length} projects`)

    return NextResponse.json({ projects: serialized, nextCursor, hasMore }, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    })
  } catch (error) {
    console.error("Get projects error:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}

// Create new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, author, title, description, githubUrl, technologies, image } = body

    if (!userId || !author || !title || !githubUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()
    const result = await db.collection("projects").insertOne({
      userId: new ObjectId(userId),
      author,
      title,
      description,
      githubUrl,
      technologies: technologies || [],
      image,
      likes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({ message: "Project created", projectId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Create project error:", error)
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}
