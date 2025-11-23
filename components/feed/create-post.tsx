"use client"

import { useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Paperclip, X, FileText } from "lucide-react"

interface CreatePostProps {
  userId: string
  userName: string
  userImage?: string
  onPostCreated: () => void
}

export default function CreatePost({ userId, userName, userImage, onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  type AttachmentDraft = {
    id: string
    name: string
    type: string
    size: number
    data: string
  }

  const [attachments, setAttachments] = useState<AttachmentDraft[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB per file
  const MAX_ATTACHMENTS = 5

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files?.length) return

    const selected = Array.from(files).slice(0, MAX_ATTACHMENTS - attachments.length)

    const processed: AttachmentDraft[] = []
    for (const file of selected) {
      if (file.size > MAX_FILE_SIZE) {
        alert(`${file.name} is larger than 20MB and was skipped.`)
        continue
      }

      try {
        const data = await readFileAsDataUrl(file)
        processed.push({
          id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size,
          data,
        })
      } catch (error) {
        console.error("Failed to read file", error)
      }
    }

    if (processed.length) {
      setAttachments((prev) => [...prev, ...processed])
    }
    event.target.value = ""
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((file) => file.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0B"
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    const value = bytes / Math.pow(1024, i)
    return `${value.toFixed(1)} ${sizes[i]}`
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
          image: attachments.find((file) => file.type.startsWith("image/"))?.data || null,
          attachments: attachments.map(({ name, type, size, data }) => ({ name, type, size, data })),
        }),
      })

      if (response.ok) {
        setContent("")
        setAttachments([])
        onPostCreated()
      }
    } catch (error) {
      console.error("Failed to create post:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardContent className="p-3 md:p-6">
        <div className="flex gap-2 md:gap-4">
          <Avatar className="w-9 h-9 md:w-10 md:h-10 shrink-0">
            <AvatarImage src={userImage || "/placeholder.svg"} alt={userName} />
            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2 md:space-y-3 min-w-0">

            {/* Attachments Preview */}
            {attachments.length > 0 && (
              <div className="space-y-2 md:space-y-3">
                {attachments.map((file) => (
                  file.type.startsWith("image/") ? (
                    <div key={file.id} className="relative rounded-lg overflow-hidden bg-muted h-40 md:h-48">
                      <img src={file.data} alt={file.name} className="w-full h-full object-cover" />
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={() => removeAttachment(file.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      key={file.id}
                      className="flex items-center justify-between rounded-lg border border-dashed border-border/50 px-2 md:px-3 py-2 text-xs md:text-sm gap-2"
                    >
                      <div className="flex items-center gap-2 md:gap-3 min-w-0">
                        <FileText className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium leading-none truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => removeAttachment(file.id)} className="h-8 w-8 shrink-0">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                ))}
              </div>
            )}

            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="resize-none bg-background/50 min-h-20 md:min-h-24 text-sm md:text-base"
            />

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 md:gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs md:text-sm text-muted-foreground hover:text-primary h-8 md:h-10"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="w-4 h-4 mr-1 md:mr-2" />
                  <span className="hidden md:inline">Add Files</span>
                  <span className="md:hidden">Files</span>
                </Button>
                <p className="text-xs text-muted-foreground">Max {MAX_ATTACHMENTS} · 20MB</p>
              </div>

              <input
                type="file"
                accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar,.mp4,.mp3,application/*"
                className="hidden"
                ref={fileInputRef}
                multiple
                onChange={handleFileSelect}
              />

              <Button onClick={handleSubmit} disabled={isLoading || !content.trim()} size="sm" className="text-xs md:text-sm h-8 md:h-10">
                {isLoading ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
