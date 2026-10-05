import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        profileImage: true,
        department: true,
        year: true,
        college: true,
        skills: true,
        bio: true,
        experience: true,
        education: true,
        projects: true,
        certifications: true,
        contact: true,
      },
    })

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    // serialize _id
    const serialized = { ...user, _id: user.id, id: undefined }
    return NextResponse.json({ user: serialized }, { status: 200 })
  } catch (err) {
    console.error("Get user error:", err)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}
