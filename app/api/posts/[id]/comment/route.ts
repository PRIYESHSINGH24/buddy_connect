import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> } | any) {
  try {
    const body = await request.json()
    const { userId, author, content } = body

    if (!userId || !author || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()
    const resolvedParams = params && typeof params.then === "function" ? await params : params
    const postId = new ObjectId(resolvedParams.id)
    const comment = {
      _id: new ObjectId(),
      userId: new ObjectId(userId),
      author,
      content,
      createdAt: new Date(),
    }

    // Push the new comment onto the post's comments array
    await db.collection("posts").updateOne({ _id: postId }, { $push: { comments: comment } as any } as any)

    // Return a serialized comment to the client
    const serialized = {
      ...comment,
      _id: comment._id.toString(),
      userId: comment.userId.toString(),
      createdAt: comment.createdAt.toISOString(),
    }

    return NextResponse.json({ message: "Comment added", comment: serialized }, { status: 201 })
  } catch (error) {
    console.error("Comment error:", error)
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 })
  }
}
