"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
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
      <nav className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Buddy Connect" width={40} height={40} />
            <h1 className="text-xl font-bold">Buddy Connect</h1>
          </Link>

          <div className="flex gap-4">
            <Link href="/dashboard">Home</Link>
            <Link href="/projects">Projects</Link>
            <Link href="/hackathon">Hackathon</Link>
            <Link href="/events">Events</Link>
            <Link href="/profile">Profile</Link>
            <div>
              <CreateJobDialog onCreated={reload} />
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">Campus Jobs & Drives</h2>

        <div className="grid grid-cols-1 gap-4">
          {jobs.map((j) => (
            <JobCard key={j._id} job={j} currentUser={user} onApplied={reload} />
          ))}
        </div>
      </div>
    </main>
  )
}
