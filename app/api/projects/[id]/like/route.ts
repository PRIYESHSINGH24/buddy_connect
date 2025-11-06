import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const db = await getDatabase()
    const projectId = new ObjectId(params.id)
    const userObjectId = new ObjectId(userId)

    const project = await db.collection("projects").findOne({ _id: projectId })
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const isLiked = project.likes?.some((id: ObjectId) => id.equals(userObjectId))

    if (isLiked) {
      await db.collection("projects").updateOne({ _id: projectId }, { $pull: { likes: userObjectId } })
    } else {
      await db.collection("projects").updateOne({ _id: projectId }, { $push: { likes: userObjectId } })
    }

    return NextResponse.json({ message: "Like toggled successfully" }, { status: 200 })
  } catch (error) {
    console.error("Like error:", error)
    return NextResponse.json({ error: "Failed to like project" }, { status: 500 })
  }
}
