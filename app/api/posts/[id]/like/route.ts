import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> } | any) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // `params` may be a Promise in some Next.js runtimes — await to unwrap safely
    const resolvedParams = params && typeof params.then === "function" ? await params : params
    const postId = resolvedParams.id as string

    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    const isLiked = (post.likes || []).includes(userId)

    // Toggle like (read-modify-write on the likes array)
    const updated = await prisma.post.update({
      where: { id: postId },
      data: {
        likes: isLiked
          ? { set: post.likes.filter((id) => id !== userId) }
          : { push: userId },
      },
      select: { likes: true },
    })

    // Return updated likes as strings so client can update UI without refetch
    const likes = updated.likes || []

    return NextResponse.json({ message: "Like toggled successfully", likes }, { status: 200 })
  } catch (error) {
    console.error("Like error:", error)
    return NextResponse.json({ error: "Failed to like post" }, { status: 500 })
  }
}
