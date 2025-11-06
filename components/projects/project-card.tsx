"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Heart, Github, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ProjectCardProps {
  id: string
  author: string
  title: string
  description: string
  githubUrl: string
  technologies: string[]
  image?: string
  likes: number
  isLiked?: boolean
  onLike: (projectId: string) => void
}

export default function ProjectCard({
  id,
  author,
  title,
  description,
  githubUrl,
  technologies,
  image,
  likes,
  isLiked,
  onLike,
}: ProjectCardProps) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/30 transition h-full flex flex-col">
      {image && (
        <div className="h-40 bg-muted overflow-hidden">
          <img src={image || "/placeholder.svg"} alt={title} className="w-full h-full object-cover" />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="space-y-2">
          <h3 className="font-bold text-lg text-foreground line-clamp-2">{title}</h3>
          <p className="text-sm text-muted-foreground">{author}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col">
        <p className="text-sm text-foreground line-clamp-3">{description}</p>

        {technologies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {technologies.slice(0, 3).map((tech) => (
              <Badge key={tech} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
            {technologies.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{technologies.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 pt-4 border-t border-border/30 mt-auto">
          <button onClick={() => onLike(id)} className="flex items-center gap-1 text-sm hover:text-primary transition">
            <Heart className={`w-4 h-4 ${isLiked ? "fill-primary text-primary" : ""}`} />
            <span>{likes}</span>
          </button>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition ml-auto"
          >
            <Github className="w-4 h-4" />
          </a>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
