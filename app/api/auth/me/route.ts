import { type NextRequest, NextResponse } from "next/server"
import { getUserById, updateUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuth(request)

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Load recent notifications (last 10)
    const rawNotifs = await prisma.notification.findMany({
      where: { recipient: userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    const notifications = rawNotifs.map((n) => ({
      _id: n.id,
      sender: n.sender ?? undefined,
      type: n.type,
      message: n.message,
      jobId: n.jobId ?? undefined,
      read: !!n.read,
      createdAt: n.createdAt?.toISOString(),
    }))

    return NextResponse.json({
      _id: user.id,
      email: user.email,
      name: user.name,
      college: user.college,
      department: user.department,
      year: user.year,
      bio: user.bio,
      skills: user.skills,
      interests: user.interests,
      profileImage: user.profileImage,
      linkedinUrl: user.linkedinUrl,
      // resume / profile fields
      experience: (user.experience as any) || [],
      education: (user.education as any) || [],
      projects: (user.projects as any) || [],
      certifications: (user.certifications as any) || [],
      contact: (user.contact as any) || {},
      resumeUrl: user.resumeUrl || null,
      notifications,
      // connection info
      connections: user.connections || [],
      incomingRequests: user.incomingRequests || [],
      outgoingRequests: user.outgoingRequests || [],
    })
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await verifyAuth(request)

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { bio, skills, interests, profileImage, experience, education, projects, certifications, contact, resumeUrl, socials, featuredProjectIds, username } = body

    // Enforce username uniqueness if changing
    if (username) {
      const existing = await prisma.user.findFirst({
        where: { username, NOT: { id: userId } },
      })
      if (existing) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
      }
    }

    await updateUser(userId, {
      bio,
      skills,
      interests,
      profileImage,
      experience,
      education,
      projects,
      certifications,
      contact,
      resumeUrl,
      socials,
      featuredProjectIds,
      username,
    })

    const user = await getUserById(userId)

    return NextResponse.json({
      _id: user?.id,
      email: user?.email,
      name: user?.name,
      college: user?.college,
      department: user?.department,
      year: user?.year,
      bio: user?.bio,
      skills: user?.skills,
      interests: user?.interests,
      profileImage: user?.profileImage,
      linkedinUrl: user?.linkedinUrl,
      socials: user?.socials,
      featuredProjectIds: user?.featuredProjectIds || [],
      username: user?.username,
      connections: user?.connections || [],
      incomingRequests: user?.incomingRequests || [],
      outgoingRequests: user?.outgoingRequests || [],
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
