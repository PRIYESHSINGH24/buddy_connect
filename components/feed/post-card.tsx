"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Heart, MessageCircle, Share2, Clock3, FileText, Download, Play } from "lucide-react"
import PdfViewer from "@/components/feed/pdf-viewer"
import { useInView } from "@/hooks/use-in-view"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"

interface PostCardProps {
  id: string
  author: string
  authorImage?: string
  content: string
  image?: string
  attachments?: Array<{ name: string; type: string; size: number; data: string }>
  likes: number
  comments: Array<{ author: string; content: string }>
  isLiked?: boolean
  onLike: (postId: string) => void
  onComment: (postId: string, content: string) => void
  userId: string
  createdAt?: string
}

export default function PostCard({
  id,
  author,
  authorImage,
  content,
  image,
  attachments = [],
  likes,
  comments,
  isLiked,
  onLike,
  onComment,
  userId,
  createdAt,
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [commentInput, setCommentInput] = useState("")
  const [isCommentLoading, setIsCommentLoading] = useState(false)

  const formattedTime = createdAt ? new Date(createdAt).toLocaleString() : ""

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0B"
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    const value = bytes / Math.pow(1024, i)
    return `${value.toFixed(1)} ${sizes[i]}`
  }

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

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/dashboard#post-${id}` : ''
  const shareText = `${author} shared a post on Buddy Connect`

  const onCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast({ title: "Link copied", description: "Post link copied to clipboard." })
    } catch {
      toast({ title: "Copy failed", description: shareUrl, })
    }
  }

  return (
    <Card id={`post-${id}`} className="group border border-border/60 bg-card/60 backdrop-blur transition hover:border-primary/40">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={authorImage || "/placeholder.svg"} alt={author} />
              <AvatarFallback>{author.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">{author}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock3 className="w-3 h-3" />
                {formattedTime || "College Network"}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-foreground text-pretty">{content}</p>
        {attachments.length > 0 && (
          <div className="space-y-5">
            {attachments.map((file, index) => {
              const key = `${file.name}-${index}`
              // Images
              if (file.type.startsWith("image/")) {
                return (
                  <div key={key} className="rounded-xl overflow-hidden bg-muted max-h-[420px] group-hover:shadow-xl transition">
                    <img src={file.data} alt={file.name} className="w-full h-full object-cover" />
                  </div>
                )
              }
              // PDFs
              if (file.type === "application/pdf") {
                return (
                  <div key={key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <FileText className="w-4 h-4" /> {file.name}
                      </div>
                      <a href={file.data} download={file.name} className="text-xs inline-flex items-center gap-1 text-primary hover:underline">
                        <Download className="w-3 h-3" /> Download PDF
                      </a>
                    </div>
                    <PdfViewer data={file.data} />
                  </div>
                )
              }
              // Videos
              if (file.type.startsWith("video/")) {
                return <VideoAttachment key={key} file={file} />
              }
              // Fallback generic file
              return (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <a
                    href={file.data}
                    download={file.name}
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>
              )
            })}
          </div>
        )}

        {!attachments.length && image && (
          <div className="rounded-xl overflow-hidden bg-muted h-64 group-hover:shadow-xl transition">
            <img src={image || "/placeholder.svg"} alt="Post" className="w-full h-full object-cover" />
          </div>
        )}

        <TooltipProvider>
          <div className="flex items-center gap-6 text-sm text-muted-foreground border-t border-border/30 pt-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => onLike(id)} className="flex items-center gap-2 hover:text-primary transition" aria-label="Like post">
                  <Heart className={`w-4 h-4 ${isLiked ? "fill-primary text-primary" : ""}`} />
                  <span>{likes}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>Like</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center gap-2 hover:text-primary transition"
                  aria-label="Show comments"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{comments.length}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>Comments</TooltipContent>
            </Tooltip>
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 hover:text-primary transition" aria-label="Share post">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>Share</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={onCopyLink}>Copy link</DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    if (navigator.share) {
                      try {
                        await navigator.share({ title: 'Buddy Connect', text: shareText, url: shareUrl })
                      } catch {}
                    } else {
                      onCopyLink()
                    }
                  }}
                >
                  Share via device…
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, '_blank')}>WhatsApp</DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')}>X (Twitter)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')}>LinkedIn</DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')}>Facebook</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TooltipProvider>

        {showComments && (
          <div className="space-y-3 border-t border-border/30 pt-4">
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
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

interface VideoAttachmentProps {
  file: { name: string; type: string; size: number; data: string }
}

function VideoAttachment({ file }: VideoAttachmentProps) {
  const { ref, inView } = useInView({ threshold: 0.4 })
  return (
    <div ref={ref} className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Play className="w-4 h-4" /> {file.name}
        </div>
        <a href={file.data} download={file.name} className="text-xs inline-flex items-center gap-1 text-primary hover:underline">
          <Download className="w-3 h-3" /> Download Video
        </a>
      </div>
      <video
        src={file.data}
        controls
        playsInline
        muted
        className="w-full rounded-lg border border-border/50 bg-black"
        {...(inView ? { autoPlay: true } : {})}
        onPlay={(e) => {
          if (!inView) (e.currentTarget as HTMLVideoElement).pause()
        }}
      />
    </div>
  )
}
