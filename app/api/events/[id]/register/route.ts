import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const { id: eventId } = await params

    const event = await prisma.collegeEvent.findUnique({
      where: { id: eventId },
      select: { id: true, attendees: true, maxAttendees: true },
    })
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const attendees = event.attendees || []
    const isRegistered = attendees.includes(userId)

    if (isRegistered) {
      // Atomic remove — array_remove is idempotent and race-free
      await prisma.$executeRaw`
        UPDATE "CollegeEvent"
        SET "attendees" = array_remove("attendees", ${userId})
        WHERE "id" = ${eventId} AND "attendees" @> ARRAY[${userId}]::text[]
      `
      return NextResponse.json({ message: "Unregistered from event", registered: false }, { status: 200 })
    }

    // Check max capacity (pre-check for a friendly error)
    if (event.maxAttendees && attendees.length >= event.maxAttendees) {
      return NextResponse.json({ error: "Event is full" }, { status: 400 })
    }

    // Atomic guarded append: the capacity check runs in the same UPDATE, so
    // two users racing for the last seat can't both slip through.
    const updated = await prisma.$executeRaw`
      UPDATE "CollegeEvent"
      SET "attendees" = array_append("attendees", ${userId})
      WHERE "id" = ${eventId}
        AND NOT ("attendees" @> ARRAY[${userId}]::text[])
        AND ("maxAttendees" IS NULL OR cardinality("attendees") < "maxAttendees")
    `

    if (updated === 0) {
      // Re-read to distinguish "lost the race for the last seat" from
      // "another request from the same user already registered"
      const fresh = await prisma.collegeEvent.findUnique({
        where: { id: eventId },
        select: { attendees: true },
      })
      if (fresh?.attendees?.includes(userId)) {
        return NextResponse.json({ message: "Registered for event successfully", registered: true }, { status: 200 })
      }
      return NextResponse.json({ error: "Event is full" }, { status: 400 })
    }

    return NextResponse.json({ message: "Registered for event successfully", registered: true }, { status: 200 })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "Failed to register for event" }, { status: 500 })
  }
}
