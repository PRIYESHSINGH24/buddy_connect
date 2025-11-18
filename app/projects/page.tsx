"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ProjectCard from "@/components/projects/project-card"
import CreateProjectDialog from "@/components/projects/create-project-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import BeautifulLoader from "@/components/ui/beautiful-loader"
import Link from "next/link"
import Header from "@/components/header"
import Image from "next/image"

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

  const loadProjects = async () => {
    try {
      const response = await fetch("/api/projects")
      const data = await response.json()
      setProjects(data.projects || [])
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

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold">Student Projects</h2>
            <p className="text-sm text-muted-foreground">Explore student projects, contribute, and find collaborators.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block w-64">
              <Input placeholder="Search projects, techs..." value={query} onChange={(e)=>setQuery(e.target.value)} />
            </div>
            {user && <CreateProjectDialog userId={user._id} userName={user.name} onProjectCreated={loadProjects} />}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No projects match your search. Try a different keyword.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          </div>
        )}
      </div>
    </main>
  )
}
