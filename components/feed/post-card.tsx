"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Share2 } from "lucide-react"

interface PostCardProps {
  id: string
  author: string
  authorImage?: string
  content: string
  image?: string
  likes: number
  comments: Array<{ author: string; content: string }>
  isLiked?: boolean
  onLike: (postId: string) => void
  onComment: (postId: string, content: string) => void
  userId: string
}

export default function PostCard({
  id,
  author,
  authorImage,
  content,
  image,
  likes,
  comments,
  isLiked,
  onLike,
  onComment,
  userId,
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [commentInput, setCommentInput] = useState("")
  const [isCommentLoading, setIsCommentLoading] = useState(false)

  const handleCommentSubmit = async () => {
    if (!commentInput.trim()) return

    setIsCommentLoading(true)
    try {
      await onComment(id, commentInput)
      setCommentInput("")
    } finally {
      setIsCommentLoading(false)
    }
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/30 transition">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={authorImage || "/placeholder.svg"} alt={author} />
              <AvatarFallback>{author.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">{author}</p>
              <p className="text-xs text-muted-foreground">College Network</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-foreground text-pretty">{content}</p>
        {image && (
          <div className="rounded-lg overflow-hidden bg-muted h-64">
            <img src={image || "/placeholder.svg"} alt="Post" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex items-center gap-6 text-sm text-muted-foreground border-t border-border/30 pt-3">
          <button onClick={() => onLike(id)} className="flex items-center gap-2 hover:text-primary transition">
            <Heart className={`w-4 h-4 ${isLiked ? "fill-primary text-primary" : ""}`} />
            <span>{likes}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 hover:text-primary transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{comments.length}</span>
          </button>
          <button className="flex items-center gap-2 hover:text-primary transition">
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {showComments && (
          <div className="space-y-3 border-t border-border/30 pt-4">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {comments.map((comment, idx) => (
                <div key={idx} className="flex gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{comment.author}</p>
                    <p className="text-sm text-muted-foreground">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Write a comment..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCommentSubmit()}
                className="bg-background/50"
              />
              <Button size="sm" onClick={handleCommentSubmit} disabled={isCommentLoading || !commentInput.trim()}>
                Post
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
