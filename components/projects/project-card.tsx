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
    <Card className="card-hover group border-border/40 bg-card/70 backdrop-blur hover:border-purple-500/40 h-full flex flex-col overflow-hidden">
      {image ? (
        <div className="h-44 bg-muted overflow-hidden relative">
          <img src={image || "/placeholder.svg"} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      ) : (
        /* Decorative header when no image */
        <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-600" />
      )}
      <CardHeader className="pb-2 pt-5">
        <div className="space-y-1.5">
          <h3 className="font-bold text-lg text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-sm text-muted-foreground font-medium">{author}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{description}</p>

        {technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {technologies.slice(0, 4).map((tech) => (
              <Badge key={tech} variant="secondary" className="text-xs font-medium bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20">
                {tech}
              </Badge>
            ))}
            {technologies.length > 4 && (
              <Badge variant="secondary" className="text-xs font-medium">
                +{technologies.length - 4}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 pt-4 border-t border-border/30 mt-auto">
          <button
            onClick={() => onLike(id)}
            className={`flex items-center gap-1.5 text-sm transition-all ${
              isLiked
                ? "text-red-500 font-semibold"
                : "text-muted-foreground hover:text-red-500"
            }`}
          >
            <Heart className={`w-4 h-4 transition-transform ${isLiked ? "fill-red-500 scale-110" : "hover:scale-110"}`} />
            <span>{likes}</span>
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
              aria-label="View on GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
              aria-label="Open project"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
