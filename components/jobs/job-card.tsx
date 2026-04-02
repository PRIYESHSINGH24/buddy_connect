"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, DollarSign, Briefcase, CheckCircle2 } from "lucide-react"

function timeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function JobCard({ job, currentUser, onApplied }: { job: any; currentUser?: any; onApplied?: () => void }) {
  const [applying, setApplying] = useState(false)
  const applied = currentUser && job.applicants?.includes(currentUser._id)

  const handleApply = async () => {
    if (!currentUser) {
      window.location.href = "/login"
      return
    }
    setApplying(true)
    try {
      const res = await fetch(`/api/jobs/${job._id}/apply`, { method: "POST" })
      if (!res.ok) {
        console.error(await res.json())
        return
      }
      if (onApplied) onApplied()
    } catch (err) {
      console.error(err)
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="card-hover group relative rounded-xl border border-border/40 bg-card/70 backdrop-blur overflow-hidden">
      {/* Left accent stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 to-orange-600 rounded-l-xl" />

      <div className="p-5 pl-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-1.5">
            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate">
              {job.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{job.companyName}</span>
              {job.location && (
                <>
                  <span className="text-border">•</span>
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{job.location}</span>
                </>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {job.employmentType && (
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold">
                {job.employmentType}
              </Badge>
            )}
            {job.salaryRange && (
              <Badge variant="outline" className="text-xs gap-1 font-medium">
                <DollarSign className="w-3 h-3" />
                {job.salaryRange}
              </Badge>
            )}
          </div>
        </div>

        {job.description && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {job.description}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/30">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>Posted {timeAgo(job.createdAt)}</span>
            {job.applicants?.length > 0 && (
              <span className="ml-2 text-primary font-semibold">
                · {job.applicants.length} applicant{job.applicants.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div>
            {applied ? (
              <Button variant="outline" disabled className="gap-2 h-9 border-accent/40 text-accent">
                <CheckCircle2 className="w-4 h-4" />
                Applied
              </Button>
            ) : (
              <Button
                onClick={handleApply}
                disabled={applying}
                className="h-9 bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-lg hover:shadow-orange-500/25 transition-all font-semibold text-white"
              >
                {applying ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Applying…
                  </span>
                ) : (
                  "Apply Now"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
