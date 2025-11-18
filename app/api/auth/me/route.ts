import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { getUserById, updateUser } from "@/lib/auth-utils"
import { getDatabase } from "@/lib/mongodb"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")

async function verifyAuth(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value

    if (!token) {
      return null
    }

    const decoded = await jwtVerify(token, JWT_SECRET)
    return decoded.payload.userId as string
  } catch (error) {
    return null
  }
}

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
    const db = await getDatabase()
    const rawNotifs = await db
      .collection("notifications")
      .find({ recipient: new (require("mongodb").ObjectId)(userId) })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray()

    const notifications = (rawNotifs || []).map((n: any) => ({
      _id: n._id.toString(),
      sender: n.sender?.toString(),
      type: n.type,
      message: n.message,
      jobId: n.jobId?.toString(),
      read: !!n.read,
      createdAt: n.createdAt?.toISOString(),
    }))

    return NextResponse.json({
      _id: user._id?.toString(),
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
      experience: user.experience || [],
      education: user.education || [],
      projects: user.projects || [],
      certifications: user.certifications || [],
      contact: user.contact || {},
      resumeUrl: user.resumeUrl || null,
      notifications,
      // connection info
      connections: (user.connections || []).map((id: any) => id.toString()),
      incomingRequests: (user.incomingRequests || []).map((id: any) => id.toString()),
      outgoingRequests: (user.outgoingRequests || []).map((id: any) => id.toString()),
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
      const db = await getDatabase()
      const existing = await db.collection('users').findOne({ username, _id: { $ne: new (require('mongodb').ObjectId)(userId) } })
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
      _id: user?._id?.toString(),
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
      featuredProjectIds: (user?.featuredProjectIds || []).map((id: any) => id.toString()),
      username: user?.username,
      connections: (user?.connections || []).map((id: any) => id.toString()),
      incomingRequests: (user?.incomingRequests || []).map((id: any) => id.toString()),
      outgoingRequests: (user?.outgoingRequests || []).map((id: any) => id.toString()),
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
