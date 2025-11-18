import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> } | any) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const db = await getDatabase()
    // `params` may be a Promise in some Next.js runtimes — await to unwrap safely
    const resolvedParams = params && typeof params.then === "function" ? await params : params
    const postId = new ObjectId(resolvedParams.id)
    const userObjectId = new ObjectId(userId)

    const post = await db.collection("posts").findOne({ _id: postId })
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    const isLiked = post.likes?.some((id: ObjectId) => id.equals(userObjectId))

    if (isLiked) {
      // If already liked, remove the like
      await db.collection("posts").updateOne({ _id: postId }, { $pull: { likes: userObjectId as any } as any } as any)
    } else {
      // Use $addToSet to avoid duplicates (idempotent insert)
      await db.collection("posts").updateOne({ _id: postId }, { $addToSet: { likes: userObjectId as any } as any } as any)
    }

    // Return updated likes as strings so client can update UI without refetch
    const updated = await db.collection("posts").findOne({ _id: postId })
    const likes = (updated?.likes || []).map((id: any) => id.toString())

    return NextResponse.json({ message: "Like toggled successfully", likes }, { status: 200 })
  } catch (error) {
    console.error("Like error:", error)
    return NextResponse.json({ error: "Failed to like post" }, { status: 500 })
  }
}
