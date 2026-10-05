import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> } | any) {
  try {
    const body = await request.json()
    const { userId, author, content } = body

    if (!userId || !author || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const resolvedParams = params && typeof params.then === "function" ? await params : params
    const postId = resolvedParams.id as string

    const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } })
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        userId,
        author,
        content,
      },
    })

    // Return a serialized comment to the client
    const serialized = {
      _id: comment.id,
      userId: comment.userId,
      author: comment.author,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
    }

    return NextResponse.json({ message: "Comment added", comment: serialized }, { status: 201 })
  } catch (error) {
    console.error("Comment error:", error)
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 })
  }
}
