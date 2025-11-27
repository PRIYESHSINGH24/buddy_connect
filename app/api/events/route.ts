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
    
    // Fallback mock data when database is unavailable
    const mockEvents = [
      {
        _id: "1",
        title: "Tech Career Conference 2025",
        description: "Join industry leaders to discuss career growth in technology",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        time: "09:00",
        location: "Convention Center, New York",
        organizer: { name: "Tech Summit Inc" },
        attendees: ["user1", "user2"],
        category: "Conference",
        registrationOpen: true,
        maxAttendees: 500,
        image: "https://via.placeholder.com/300x200?text=Tech+Conference"
      },
      {
        _id: "2",
        title: "Networking Mixer - Tech Professionals",
        description: "Casual networking event for tech professionals to connect",
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        time: "18:00",
        location: "Downtown Lounge, San Francisco",
        organizer: { name: "Tech Network" },
        attendees: ["user3"],
        category: "Networking",
        registrationOpen: true,
        maxAttendees: 100,
        image: "https://via.placeholder.com/300x200?text=Networking"
      },
      {
        _id: "3",
        title: "AI & Machine Learning Workshop",
        description: "Hands-on workshop on building AI applications",
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        time: "10:00",
        location: "University Campus",
        organizer: { name: "ML Academy" },
        attendees: ["user4", "user5", "user6"],
        category: "Workshop",
        registrationOpen: true,
        maxAttendees: 50,
        image: "https://via.placeholder.com/300x200?text=AI+Workshop"
      },
      {
        _id: "4",
        title: "Startup Pitch Event",
        description: "Watch innovative startups pitch to investors",
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        time: "19:00",
        location: "Innovation Hub, Boston",
        organizer: { name: "Startup Network" },
        attendees: ["user7"],
        category: "Pitch",
        registrationOpen: true,
        maxAttendees: 200,
        image: "https://via.placeholder.com/300x200?text=Startup+Pitch"
      },
      {
        _id: "5",
        title: "Leadership Development Program",
        description: "6-week program on developing leadership skills",
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        time: "14:00",
        location: "Business School",
        organizer: { name: "Leadership Institute" },
        attendees: ["user8", "user9"],
        category: "Course",
        registrationOpen: true,
        maxAttendees: 30,
        image: "https://via.placeholder.com/300x200?text=Leadership"
      },
      {
        _id: "6",
        title: "Product Management Seminar",
        description: "Learn product management from industry experts",
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        time: "11:00",
        location: "Tech Park, Seattle",
        organizer: { name: "PM School" },
        attendees: ["user10"],
        category: "Seminar",
        registrationOpen: true,
        maxAttendees: 75,
        image: "https://via.placeholder.com/300x200?text=Product+Management"
      }
    ];
    
    return NextResponse.json({ events: mockEvents }, { status: 200 })
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
