"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Users } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface EventCardProps {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  category: string
  attendees: number
  maxAttendees?: number
  isRegistered?: boolean
  onRegister: (eventId: string) => void
  loading?: boolean
}

export default function EventCard({
  id,
  title,
  description,
  date,
  time,
  location,
  category,
  attendees,
  maxAttendees,
  isRegistered,
  onRegister,
  loading,
}: EventCardProps) {
  const categoryColors: Record<string, string> = {
    hackathon: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
    seminar: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    workshop: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    meetup: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/30 transition overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <h3 className="font-bold text-lg text-foreground line-clamp-2">{title}</h3>
            <Badge className={categoryColors[category] || categoryColors.seminar}>{category}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-foreground line-clamp-2">{description}</p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              {formatDate(new Date(date))} at {time}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>
              {attendees} attending
              {maxAttendees && ` / ${maxAttendees}`}
            </span>
          </div>
        </div>

        <Button
          onClick={() => onRegister(id)}
          disabled={loading}
          variant={isRegistered ? "outline" : "default"}
          className="w-full"
        >
          {loading ? "Processing..." : isRegistered ? "Unregister" : "Register"}
        </Button>
      </CardContent>
    </Card>
  )
}
