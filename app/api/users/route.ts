import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { cacheFetch } from "@/lib/redis"

// GET /api/users?cursor=<name>&limit=<number>&search=<query>
export async function GET(request: NextRequest) {
  try {
    const start = performance.now()
    const searchParams = request.nextUrl.searchParams
    const cursor = searchParams.get("cursor")
    const limitParam = parseInt(searchParams.get("limit") || "20", 10)
    const search = searchParams.get("search")
    const limit = Math.min(Math.max(limitParam, 1), 50)

    // Cache first page (no cursor, no search) for 60 seconds
    const cacheKey = !cursor && !search ? "users:firstpage" : null
    
    const fetchUsers = async () => {
      const db = await getDatabase()
      const query: any = {}

      if (cursor) {
        query.name = { $gt: cursor }
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { skills: { $in: [new RegExp(search, "i")] } },
          { college: { $regex: search, $options: "i" } },
          { department: { $regex: search, $options: "i" } },
        ]
      }

      const users = await db
        .collection("users")
        .find(query, {
          projection: {
            name: 1,
            profileImage: 1,
            department: 1,
            year: 1,
            skills: 1,
            college: 1,
          },
        })
        .sort({ name: 1 })
        .limit(limit + 1)
        .toArray()

      const hasMore = users.length > limit
      const page = users.slice(0, limit)

      const serialized = page.map((u: any) => ({
        ...u,
        _id: u._id?.toString(),
      }))

      const nextCursor = hasMore ? serialized[serialized.length - 1].name : null

      return { users: serialized, nextCursor, hasMore }
    }

    let result
    if (cacheKey) {
      result = await cacheFetch(cacheKey, 60, fetchUsers)
    } else {
      result = await fetchUsers()
    }

    const duration = performance.now() - start
    console.log(`[GET /api/users] ${duration.toFixed(2)}ms, ${result.users.length} users`)

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
