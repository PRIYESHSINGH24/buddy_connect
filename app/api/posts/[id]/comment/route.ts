import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { userId, author, content } = body

    if (!userId || !author || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()
    const postId = new ObjectId(params.id)
    const comment = {
      _id: new ObjectId(),
      userId: new ObjectId(userId),
      author,
      content,
      createdAt: new Date(),
    }

    await db.collection("posts").updateOne({ _id: postId }, { $push: { comments: comment } })

    return NextResponse.json({ message: "Comment added", comment }, { status: 201 })
  } catch (error) {
    console.error("Comment error:", error)
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 })
  }
}
