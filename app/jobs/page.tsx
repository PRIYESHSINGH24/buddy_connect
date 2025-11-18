"use client"

import { useEffect, useState } from "react"
import Header from "@/components/header"
import CreateJobDialog from "@/components/jobs/create-job-dialog"
import JobCard from "@/components/jobs/job-card"

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const r = await fetch('/api/jobs')
        const data = await r.json()
        setJobs(data.jobs || [])

        const me = await fetch('/api/auth/me')
        if (me.ok) setUser(await me.json())
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const reload = async () => {
    const r = await fetch('/api/jobs')
    const data = await r.json()
    setJobs(data.jobs || [])
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Campus Jobs & Drives</h2>
          <div>
            <CreateJobDialog onCreated={reload} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {jobs.map((j) => (
            <JobCard key={j._id} job={j} currentUser={user} onApplied={reload} />
          ))}
        </div>
      </div>
    </main>
  )
}
