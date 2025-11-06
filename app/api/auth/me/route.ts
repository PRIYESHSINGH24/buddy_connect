import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { getUserById, updateUser } from "@/lib/auth-utils"

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
    const { bio, skills, interests, profileImage } = body

    await updateUser(userId, {
      bio,
      skills,
      interests,
      profileImage,
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
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
