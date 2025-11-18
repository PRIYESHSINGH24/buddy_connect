import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const db = await getDatabase()

    const user = await db.collection("users").findOne({ _id: new ObjectId(id) }, {
      projection: {
        name: 1,
        profileImage: 1,
        department: 1,
        year: 1,
        college: 1,
        skills: 1,
        bio: 1,
        experience: 1,
        education: 1,
        projects: 1,
        certifications: 1,
        contact: 1,
      }
    })

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    // serialize _id
    const serialized = { ...user, _id: user._id.toString() }
    return NextResponse.json({ user: serialized }, { status: 200 })
  } catch (err) {
    console.error("Get user error:", err)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}
