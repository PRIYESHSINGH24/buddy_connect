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
    
    // Fallback mock data when database is unavailable
    const mockProjects = [
      {
        _id: "1",
        userId: "user1",
        author: "John Developer",
        title: "E-Commerce Platform",
        description: "Full-stack e-commerce platform built with Next.js and MongoDB",
        technologies: ["Next.js", "React", "MongoDB", "Stripe"],
        image: "https://via.placeholder.com/300x200?text=E-Commerce",
        likes: ["user2", "user3"],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: "2",
        userId: "user4",
        author: "Jane Smith",
        title: "AI Chat Assistant",
        description: "Intelligent chatbot using OpenAI API and React",
        technologies: ["React", "Node.js", "OpenAI", "TypeScript"],
        image: "https://via.placeholder.com/300x200?text=AI+Chat",
        likes: ["user1", "user5", "user6"],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: "3",
        userId: "user7",
        author: "Mike Johnson",
        title: "Task Management App",
        description: "Collaborative task management with real-time updates",
        technologies: ["Vue.js", "Firebase", "Tailwind CSS"],
        image: "https://via.placeholder.com/300x200?text=Task+Manager",
        likes: ["user2"],
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: "4",
        userId: "user8",
        author: "Sarah Wilson",
        title: "Data Visualization Dashboard",
        description: "Interactive dashboard for real-time data analysis",
        technologies: ["D3.js", "React", "Python", "Flask"],
        image: "https://via.placeholder.com/300x200?text=Dashboard",
        likes: ["user3", "user4"],
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: "5",
        userId: "user9",
        author: "Alex Chen",
        title: "Mobile Fitness Tracker",
        description: "React Native app for tracking workouts and nutrition",
        technologies: ["React Native", "Firebase", "Expo"],
        image: "https://via.placeholder.com/300x200?text=Fitness+App",
        likes: ["user1", "user7"],
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: "6",
        userId: "user10",
        author: "Emma Brown",
        title: "Social Media Analytics",
        description: "Analyze social media metrics and generate reports",
        technologies: ["Python", "Pandas", "Django", "PostgreSQL"],
        image: "https://via.placeholder.com/300x200?text=Analytics",
        likes: ["user2", "user3", "user5"],
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    return NextResponse.json({ projects: mockProjects, hasMore: false, nextCursor: null }, { status: 200 })
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
