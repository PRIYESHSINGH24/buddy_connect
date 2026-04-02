"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import EventCard from "@/components/events/event-card"
import CreateEventDialog from "@/components/events/create-event-dialog"
import { Button } from "@/components/ui/button"
import BeautifulLoader from "@/components/ui/beautiful-loader"
import Header from "@/components/header"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarDays, Sparkles, Plus } from "lucide-react"

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
          setLoading(false)
          return
        }
        const userData = await response.json()
        setUser(userData)
        await loadEvents()
      } catch (error) {
        console.error("Auth check failed:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

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
  const categories = Array.from(new Set(upcomingEvents.map((e) => e.category || "other")))

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Gradient Page Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-accent/10 via-primary/5 to-accent/10 border-b border-border/30">
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-0 left-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="container mx-auto px-4 py-10 md:py-14 relative z-10">
          <div className="flex items-end justify-between gap-4 page-enter">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/20 px-3 py-1 text-xs font-semibold text-accent mb-2">
                <CalendarDays className="w-3.5 h-3.5" />
                Campus Life
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                College Events
              </h1>
              <p className="text-muted-foreground text-lg max-w-lg">
                Discover hackathons, workshops, seminars, and meetups happening at your campus.
              </p>
            </div>
            <div className="page-enter-delay shrink-0">
              {user && <CreateEventDialog userId={user._id} onEventCreated={loadEvents} />}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : upcomingEvents.length === 0 ? (
          /* Beautiful Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent/30 to-primary/20 blur-2xl opacity-60 animate-pulse" />
              <div className="relative p-8 rounded-full bg-gradient-to-br from-accent/15 to-primary/10 border border-accent/20">
                <CalendarDays className="w-12 h-12 text-accent" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">No upcoming events</h3>
            <p className="text-muted-foreground max-w-md mb-8 text-base">
              There are no events scheduled right now. Be the first to create one and bring your campus community together!
            </p>
            {user && (
              <Button className="bg-gradient-to-r from-accent to-accent/80 hover:shadow-lg hover:shadow-accent/30 transition-all font-semibold px-8 h-11">
                <Plus className="w-4 h-4 mr-2" />
                Create the First Event
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            {categories.map((category) => {
              const categoryEvents = upcomingEvents.filter((e) => e.category === category)
              if (categoryEvents.length === 0) return null

              return (
                <div key={category} className="page-enter">
                  <h3 className="text-xl font-bold mb-5 capitalize flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    {category}s
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
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
