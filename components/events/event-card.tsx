"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Users, CheckCircle2 } from "lucide-react"
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
  const categoryStyles: Record<string, { stripe: string; badge: string; bg: string }> = {
    hackathon: {
      stripe: "bg-gradient-to-r from-purple-500 to-purple-600",
      badge: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200",
      bg: "hover:border-purple-500/40",
    },
    seminar: {
      stripe: "bg-gradient-to-r from-blue-500 to-blue-600",
      badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200",
      bg: "hover:border-blue-500/40",
    },
    workshop: {
      stripe: "bg-gradient-to-r from-emerald-500 to-emerald-600",
      badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
      bg: "hover:border-emerald-500/40",
    },
    meetup: {
      stripe: "bg-gradient-to-r from-orange-500 to-orange-600",
      badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200",
      bg: "hover:border-orange-500/40",
    },
    conference: {
      stripe: "bg-gradient-to-r from-indigo-500 to-indigo-600",
      badge: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200",
      bg: "hover:border-indigo-500/40",
    },
  }

  const style = categoryStyles[category.toLowerCase()] || categoryStyles.seminar

  return (
    <Card className={`card-hover border-border/40 bg-card/70 backdrop-blur overflow-hidden ${style.bg}`}>
      {/* Category Accent Stripe */}
      <div className={`h-1.5 ${style.stripe}`} />

      <CardHeader className="pb-3 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1 min-w-0">
            <h3 className="font-bold text-lg text-foreground line-clamp-2 leading-snug">{title}</h3>
            <Badge className={`${style.badge} text-xs font-semibold`}>{category}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{description}</p>

        <div className="space-y-2.5 text-sm">
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <Clock className="w-4 h-4 shrink-0 text-primary/60" />
            <span>
              {formatDate(new Date(date))} at {time}
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <MapPin className="w-4 h-4 shrink-0 text-primary/60" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <Users className="w-4 h-4 shrink-0 text-primary/60" />
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
          className={`w-full h-10 font-semibold transition-all ${
            isRegistered
              ? "border-accent/40 text-accent hover:bg-accent/10"
              : "bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20 hover:shadow-primary/30"
          }`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              Processing…
            </span>
          ) : isRegistered ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Registered
            </span>
          ) : (
            "Register"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
