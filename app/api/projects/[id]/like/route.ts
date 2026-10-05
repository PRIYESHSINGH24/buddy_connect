import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const { id: projectId } = await params

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const isLiked = (project.likes || []).includes(userId)

    await prisma.project.update({
      where: { id: projectId },
      data: {
        likes: isLiked
          ? { set: project.likes.filter((id) => id !== userId) }
          : { push: userId },
      },
    })

    return NextResponse.json({ message: "Like toggled successfully" }, { status: 200 })
  } catch (error) {
    console.error("Like error:", error)
    return NextResponse.json({ error: "Failed to like project" }, { status: 500 })
  }
}
