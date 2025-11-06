import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Get all projects
export async function GET() {
  try {
    const db = await getDatabase()
    const projects = await db.collection("projects").find({}).sort({ createdAt: -1 }).limit(100).toArray()

    return NextResponse.json({ projects }, { status: 200 })
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
