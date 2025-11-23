import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const start = performance.now()
    const db = await getDatabase()

    // Fetch users with safe public fields only, limit to 100
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
      .limit(100)
      .toArray()

    const duration = performance.now() - start
    console.log(`[GET /api/users] ${duration.toFixed(2)}ms, ${users.length} users`)

    return NextResponse.json({ users }, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
