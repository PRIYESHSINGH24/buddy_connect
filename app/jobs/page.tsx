"use client"

import { useEffect, useState } from "react"
import Header from "@/components/header"
import CreateJobDialog from "@/components/jobs/create-job-dialog"
import JobCard from "@/components/jobs/job-card"
import { Briefcase, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

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

      {/* Gradient Page Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-500/10 via-primary/5 to-orange-500/10 border-b border-border/30">
        <div className="absolute -top-20 right-20 w-60 h-60 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute bottom-0 -left-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="container mx-auto px-4 py-10 md:py-14 relative z-10">
          <div className="flex items-end justify-between gap-4 page-enter">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 border border-orange-500/20 px-3 py-1 text-xs font-semibold text-orange-600 dark:text-orange-400 mb-2">
                <Briefcase className="w-3.5 h-3.5" />
                Career Growth
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                Campus Jobs & Drives
              </h1>
              <p className="text-muted-foreground text-lg max-w-lg">
                Find internships, placement drives, and freelance opportunities posted by your community.
              </p>
            </div>
            <div className="page-enter-delay shrink-0">
              <CreateJobDialog onCreated={reload} />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {jobs.length === 0 && !loading ? (
          /* Beautiful Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500/30 to-primary/20 blur-2xl opacity-60 animate-pulse" />
              <div className="relative p-8 rounded-full bg-gradient-to-br from-orange-500/15 to-primary/10 border border-orange-500/20">
                <Search className="w-12 h-12 text-orange-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">No jobs posted yet</h3>
            <p className="text-muted-foreground max-w-md mb-8 text-base">
              Be the first to share a job opportunity or placement drive with the campus community!
            </p>
            <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-lg hover:shadow-orange-500/30 transition-all font-semibold px-8 h-11 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Post a Job
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 stagger-children max-w-4xl">
            {jobs.map((j) => (
              <JobCard key={j._id} job={j} currentUser={user} onApplied={reload} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
