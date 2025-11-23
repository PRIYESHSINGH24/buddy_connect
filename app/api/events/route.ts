import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Get all events
export async function GET(request: NextRequest) {
  try {
    const start = performance.now()
    const searchParams = request.nextUrl.searchParams
    const filter: any = {}

    // Filter by category if provided
    if (searchParams.has("category")) {
      filter.category = searchParams.get("category")
    }

    // Upcoming events filter
    if (searchParams.get("upcoming") === "true") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      filter.date = { $gte: today }
    }

    const db = await getDatabase()
    const dbStart = performance.now()
    const events = await db
      .collection("college_events")
      .find(filter, {
        projection: {
          title: 1,
          description: 1,
          date: 1,
          time: 1,
          location: 1,
          organizer: 1,
          attendees: 1,
          category: 1,
          image: 1,
          registrationOpen: 1,
          maxAttendees: 1,
          createdAt: 1,
        },
      })
      .sort({ date: 1 })
      .limit(100)
      .toArray()
    const dbDuration = performance.now() - dbStart
    const duration = performance.now() - start
    console.log(`[GET /api/events] ${duration.toFixed(2)}ms (db: ${dbDuration.toFixed(2)}ms), ${events.length} events`)

    return NextResponse.json({ events }, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      },
    })
  } catch (error) {
    console.error("Get events error:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}

// Create new event
// Create new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, date, time, location, organizer, category, image, maxAttendees } = body

    if (!title || !date || !location || !organizer || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // COMBINE date + time into a single Date
    const eventDateTime = new Date(`${date}T${time || "00:00"}:00`)

    const db = await getDatabase()
    const result = await db.collection("college_events").insertOne({
      title,
      description,
      date: eventDateTime,
      time,
      location,
      organizer: new ObjectId(organizer),
      attendees: [],
      category,
      image,
      registrationOpen: true,
      maxAttendees,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({ message: "Event created successfully", eventId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Create event error:", error)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}
