"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"

interface CreateProjectDialogProps {
  userId: string
  userName: string
  onProjectCreated: () => void
}

export default function CreateProjectDialog({ userId, userName, onProjectCreated }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    githubUrl: "",
    technologies: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          author: userName,
          title: formData.title,
          description: formData.description,
          githubUrl: formData.githubUrl,
          technologies: formData.technologies
            .split(",")
            .map((tech) => tech.trim())
            .filter(Boolean),
        }),
      })

      if (response.ok) {
        setFormData({ title: "", description: "", githubUrl: "", technologies: "" })
        setOpen(false)
        onProjectCreated()
      }
    } catch (error) {
      console.error("Failed to create project:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Share Project
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border/50 bg-background/95 backdrop-blur">
        <DialogHeader>
          <DialogTitle>Share Your Project</DialogTitle>
          <DialogDescription>Add your GitHub project to showcase your work</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="My Awesome Project"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="What does your project do?"
              value={formData.description}
              onChange={handleChange}
              required
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="githubUrl">GitHub URL</Label>
            <Input
              id="githubUrl"
              name="githubUrl"
              type="url"
              placeholder="https://github.com/username/repo"
              value={formData.githubUrl}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="technologies">Technologies (comma-separated)</Label>
            <Input
              id="technologies"
              name="technologies"
              placeholder="React, TypeScript, MongoDB"
              value={formData.technologies}
              onChange={handleChange}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Share Project"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
