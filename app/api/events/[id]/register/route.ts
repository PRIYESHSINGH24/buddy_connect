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

    const event = await prisma.collegeEvent.findUnique({ where: { id: eventId } })
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const attendees = event.attendees || []

    // Check if already registered
    const isRegistered = attendees.includes(userId)
    if (isRegistered) {
      await prisma.collegeEvent.update({
        where: { id: eventId },
        data: { attendees: { set: attendees.filter((id) => id !== userId) } },
      })
      return NextResponse.json({ message: "Unregistered from event", registered: false }, { status: 200 })
    }

    // Check max capacity
    if (event.maxAttendees && attendees.length >= event.maxAttendees) {
      return NextResponse.json({ error: "Event is full" }, { status: 400 })
    }

    await prisma.collegeEvent.update({
      where: { id: eventId },
      data: { attendees: { push: userId } },
    })

    return NextResponse.json({ message: "Registered for event successfully", registered: true }, { status: 200 })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "Failed to register for event" }, { status: 500 })
  }
}
