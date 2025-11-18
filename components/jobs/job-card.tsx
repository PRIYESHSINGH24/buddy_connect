"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"

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
    <div className="border border-border/40 bg-card/60 p-4 rounded-md">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-lg font-semibold">{job.title}</div>
          <div className="text-sm text-muted-foreground">{job.companyName} • {job.location || 'Remote'}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">{job.employmentType || ''}</div>
          <div className="text-sm text-muted-foreground">{job.salaryRange || ''}</div>
        </div>
      </div>

      <div className="mt-3 text-sm text-foreground">{job.description}</div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">Posted: {new Date(job.createdAt).toLocaleString()}</div>
        <div>
          {applied ? (
            <Button variant="ghost" disabled>Applied</Button>
          ) : (
            <Button onClick={handleApply} disabled={applying}>{applying ? 'Applying...' : 'Apply'}</Button>
          )}
        </div>
      </div>
    </div>
  )
}
