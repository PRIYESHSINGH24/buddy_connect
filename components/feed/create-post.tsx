"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImageIcon } from "lucide-react"

interface CreatePostProps {
  userId: string
  userName: string
  userImage?: string
  onPostCreated: () => void
}

export default function CreatePost({ userId, userName, userImage, onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          author: userName,
          authorImage: userImage,
          content,
        }),
      })

      if (response.ok) {
        setContent("")
        onPostCreated()
      }
    } catch (error) {
      console.error("Failed to create post:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur mb-6">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={userImage || "/placeholder.svg"} alt={userName} />
            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="resize-none bg-background/50 min-h-24"
            />
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                <ImageIcon className="w-4 h-4 mr-2" />
                Add Image
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading || !content.trim()}>
                {isLoading ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
