"use client"

import { useState, useRef } from "react"
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

  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Optional: size guard (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setImageBase64(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

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
          image: imageBase64 || null,
        }),
      })

      if (response.ok) {
        setContent("")
        setImageBase64(null) // reset image preview
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

            {/* Image Preview */}
            {imageBase64 && (
              <div className="rounded-lg overflow-hidden bg-muted h-48">
                <img src={imageBase64} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}

            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="resize-none bg-background/50 min-h-24"
            />

            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Add Image
              </Button>

              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageSelect}
              />

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
