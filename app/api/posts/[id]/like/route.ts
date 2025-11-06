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
    const postId = new ObjectId(params.id)
    const userObjectId = new ObjectId(userId)

    const post = await db.collection("posts").findOne({ _id: postId })
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    const isLiked = post.likes?.some((id: ObjectId) => id.equals(userObjectId))

    if (isLiked) {
      await db.collection("posts").updateOne({ _id: postId }, { $pull: { likes: userObjectId } })
    } else {
      await db.collection("posts").updateOne({ _id: postId }, { $push: { likes: userObjectId } })
    }

    return NextResponse.json({ message: "Like toggled successfully" }, { status: 200 })
  } catch (error) {
    console.error("Like error:", error)
    return NextResponse.json({ error: "Failed to like post" }, { status: 500 })
  }
}
