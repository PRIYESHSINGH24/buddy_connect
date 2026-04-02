"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import ProjectCard from "@/components/projects/project-card"
import CreateProjectDialog from "@/components/projects/create-project-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import BeautifulLoader from "@/components/ui/beautiful-loader"
import Header from "@/components/header"
import { Code2, Search, Sparkles, Plus } from "lucide-react"

interface Project {
  _id: string
  author: string
  title: string
  description: string
  githubUrl: string
  technologies: string[]
  image?: string
  likes: string[]
  createdAt: string
}

export default function ProjectsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (!response.ok) {
          router.push("/login")
          return
        }
        const userData = await response.json()
        setUser(userData)
        await loadProjects()
      } catch (error) {
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const loadProjects = async (c?: string | null) => {
    try {
      const params = new URLSearchParams()
      params.set('limit', '12')
      if (c) params.set('cursor', c)
      const response = await fetch(`/api/projects?${params.toString()}`)
      const data = await response.json()
      if (c) {
        setProjects((prev)=>[...prev, ...(data.projects || [])])
      } else {
        setProjects(data.projects || [])
      }
      setCursor(data.nextCursor || null)
      setHasMore(Boolean(data.nextCursor))
    } catch (error) {
      console.error("Failed to load projects:", error)
    }
  }

  const handleLike = async (projectId: string) => {
    if (!user) return
    try {
      await fetch(`/api/projects/${projectId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id }),
      })
      await loadProjects()
    } catch (error) {
      console.error("Failed to like project:", error)
    }
  }

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        setLoadingMore(true)
        loadProjects(cursor).finally(()=> setLoadingMore(false))
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [cursor, hasMore, loadingMore])

  if (loading) {
    return <BeautifulLoader message="Loading projects" />
  }

  const filtered = projects.filter((p) => {
    if (!query) return true
    const q = query.toLowerCase()
    return (
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.technologies && p.technologies.join(" ").toLowerCase().includes(q))
    )
  })

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Gradient Page Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-500/10 via-primary/5 to-purple-500/10 border-b border-border/30">
        <div className="absolute -top-20 -right-10 w-60 h-60 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-20 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="container mx-auto px-4 py-10 md:py-14 relative z-10">
          <div className="flex items-end justify-between gap-4 page-enter">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2">
                <Code2 className="w-3.5 h-3.5" />
                Open Source
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                Student Projects
              </h1>
              <p className="text-muted-foreground text-lg max-w-lg">
                Explore student projects, contribute to open source, and find collaborators.
              </p>
            </div>
            <div className="page-enter-delay shrink-0 flex items-center gap-3">
              <div className="hidden sm:flex relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects, techs..."
                  value={query}
                  onChange={(e)=>setQuery(e.target.value)}
                  className="pl-10 w-64 bg-background/60 backdrop-blur border-border/50"
                />
              </div>
              {user && <CreateProjectDialog userId={user._id} userName={user.name} onProjectCreated={loadProjects} />}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {filtered.length === 0 ? (
          /* Beautiful Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/30 to-primary/20 blur-2xl opacity-60 animate-pulse" />
              <div className="relative p-8 rounded-full bg-gradient-to-br from-purple-500/15 to-primary/10 border border-purple-500/20">
                <Code2 className="w-12 h-12 text-purple-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {query ? "No matching projects" : "No projects yet"}
            </h3>
            <p className="text-muted-foreground max-w-md mb-8 text-base">
              {query
                ? "Try a different keyword or clear your search."
                : "Be the first to showcase your project and inspire the community!"
              }
            </p>
            {!query && user && (
              <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-lg hover:shadow-purple-500/30 transition-all font-semibold px-8 h-11 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Share Your Project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {filtered.map((project) => (
              <ProjectCard
                key={project._id}
                id={project._id}
                author={project.author}
                title={project.title}
                description={project.description}
                githubUrl={project.githubUrl}
                technologies={project.technologies}
                image={project.image}
                likes={project.likes.length}
                isLiked={project.likes.includes(user?._id)}
                onLike={handleLike}
              />
            ))}
            {/* Sentinel spans full width to trigger load */}
            <div ref={sentinelRef} className="col-span-full" />
            {loadingMore && (
              <div className="col-span-full flex justify-center py-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: "0s"}} />
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: "0.2s"}} />
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: "0.4s"}} />
                  <span className="ml-2">Loading more…</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
