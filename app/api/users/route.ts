import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await getDatabase()

    // Fetch users with safe public fields only
    const users = await db
      .collection("users")
      .find(
        {},
        {
          projection: {
            name: 1,
            profileImage: 1,
            department: 1,
            year: 1,
            skills: 1,
            college: 1,
          },
        }
      )
      .sort({ name: 1 })
      .toArray()

    return NextResponse.json({ users }, { status: 200 })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
