"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ProjectCard from "@/components/projects/project-card"
import CreateProjectDialog from "@/components/projects/create-project-dialog"
import { Button } from "@/components/ui/button"
import Link from "next/link"
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
    return <div className="p-4">Loading...</div>
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
            <Link href="/dashboard">
              <Button variant="ghost">Feed</Button>
            </Link>
            <Button variant="ghost" className="font-semibold">
              Projects
            </Button>
            <Link href="/hackathon">
              <Button variant="ghost">Hackathon</Button>
            </Link>
            <Link href="/events">
              <Button variant="ghost">Events</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Student Projects</h2>
          {user && <CreateProjectDialog userId={user._id} userName={user.name} onProjectCreated={loadProjects} />}
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No projects yet. Be the first to share yours!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
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
