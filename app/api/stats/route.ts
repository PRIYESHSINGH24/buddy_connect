import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { cacheFetch } from "@/lib/redis"

export async function GET() {
  try {
    // Cache stats for 5 minutes — countDocuments() is expensive
    const stats = await cacheFetch(
      "stats:global",
      300, // 5 min TTL
      async () => {
        const db = await getDatabase()
        try {
          const [users, projects, posts, events, jobs] = await Promise.all([
            db.collection("users").countDocuments({}),
            db.collection("projects").countDocuments({}),
            db.collection("posts").countDocuments({}),
            db.collection("college_events").countDocuments({}),
            db.collection("jobs").countDocuments({}),
          ])
          return { users, projects, posts, events, jobs }
        } catch (e) {
          console.error("Stats count error:", e)
          return { users: 0, projects: 0, posts: 0, events: 0, jobs: 0, warning: "db_count_failed" }
        }
      }
    )

    return NextResponse.json(stats, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    })
  } catch (e) {
    console.error("Stats error:", e)
    return NextResponse.json(
      { users: 0, projects: 0, posts: 0, events: 0, jobs: 0, warning: "db_unavailable" },
      { status: 200 }
    )
  }
}
