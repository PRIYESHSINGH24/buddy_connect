"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import EventCard from "@/components/events/event-card"
import CreateEventDialog from "@/components/events/create-event-dialog"
import { Button } from "@/components/ui/button"
import BeautifulLoader from "@/components/ui/beautiful-loader"
import Link from "next/link"
import Header from "@/components/header"
import Image from "next/image"

interface Event {
  _id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  category: string
  attendees: string[]
  maxAttendees?: number
  createdAt: string
}

export default function EventsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (!response.ok) {
          // Don't redirect here; allow public access to events.
          setLoading(false)
          return
        }
        const userData = await response.json()
        setUser(userData)
        await loadEvents()
      } catch (error) {
        // If auth check fails, don't redirect — keep events viewable.
        console.error("Auth check failed:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // Always load events on mount so events are visible even when the user
  // is not authenticated. This also avoids hiding events if auth fails.
  useEffect(() => {
    loadEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadEvents = async () => {
    try {
      const response = await fetch("/api/events?upcoming=true")
      const data = await response.json()
      setEvents(data.events || [])
    } catch (error) {
      console.error("Failed to load events:", error)
    }
  }

  const handleRegister = async (eventId: string) => {
    if (!user) return

    setRegistering((prev) => ({ ...prev, [eventId]: true }))
    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id }),
      })

      if (response.ok) {
        await loadEvents()
      }
    } catch (error) {
      console.error("Failed to register:", error)
    } finally {
      setRegistering((prev) => ({ ...prev, [eventId]: false }))
    }
  }

  if (loading) {
    return <BeautifulLoader message="Loading events" />
  }

  const today = new Date()
today.setHours(0, 0, 0, 0)

  const upcomingEvents = events.filter((e) => {
    const eventDate = new Date(e.date)
    eventDate.setHours(0, 0, 0, 0)
    return eventDate >= today
  })
  // Derive categories from the fetched events so that any category value
  // present in the DB will be rendered (handles capitalization/mismatch).
  const categories = Array.from(new Set(upcomingEvents.map((e) => e.category || "other")))

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">College Events</h2>
            <p className="text-muted-foreground">Discover and join events happening at your college</p>
          </div>
          {user && <CreateEventDialog userId={user._id} onEventCreated={loadEvents} />}
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No upcoming events. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map((category) => {
              const categoryEvents = upcomingEvents.filter((e) => e.category === category)
              if (categoryEvents.length === 0) return null

              return (
                <div key={category}>
                  <h3 className="text-xl font-semibold mb-4 capitalize">{category}s</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryEvents.map((event) => (
                      <EventCard
                        key={event._id}
                        id={event._id}
                        title={event.title}
                        description={event.description}
                        date={event.date}
                        time={event.time}
                        location={event.location}
                        category={event.category}
                        attendees={event.attendees.length}
                        maxAttendees={event.maxAttendees}
                        isRegistered={event.attendees.includes(user?._id)}
                        onRegister={handleRegister}
                        loading={registering[event._id]}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
