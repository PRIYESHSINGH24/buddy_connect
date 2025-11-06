import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const db = await getDatabase()
    const eventId = new ObjectId(params.id)
    const userObjectId = new ObjectId(userId)

    const event = await db.collection("college_events").findOne({ _id: eventId })
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check if already registered
    const isRegistered = event.attendees?.some((id: ObjectId) => id.equals(userObjectId))
    if (isRegistered) {
      await db.collection("college_events").updateOne({ _id: eventId }, { $pull: { attendees: userObjectId } })
      return NextResponse.json({ message: "Unregistered from event", registered: false }, { status: 200 })
    }

    // Check max capacity
    if (event.maxAttendees && event.attendees?.length >= event.maxAttendees) {
      return NextResponse.json({ error: "Event is full" }, { status: 400 })
    }

    await db.collection("college_events").updateOne({ _id: eventId }, { $push: { attendees: userObjectId } })

    return NextResponse.json({ message: "Registered for event successfully", registered: true }, { status: 200 })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "Failed to register for event" }, { status: 500 })
  }
}
