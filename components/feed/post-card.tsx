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
    <Card id={`post-${id}`} className="group border border-border/40 bg-linear-to-br from-card/40 to-card/80 backdrop-blur transition-all hover:border-primary/40 hover:shadow-lg">
      <CardHeader className="pb-2 md:pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <Avatar className="w-9 h-9 md:w-10 md:h-10 shrink-0 ring-2 ring-primary/20">
              <AvatarImage src={authorImage || "/placeholder.svg"} alt={author} />
              <AvatarFallback className="bg-linear-to-br from-primary/50 to-accent/50 text-white font-bold">{author.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-semibold text-sm md:text-base text-foreground truncate">{author}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                <Clock3 className="w-3 h-3 shrink-0" />
                <span className="truncate">{formattedTime || "College Network"}</span>
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4">
        <p className="text-sm md:text-base text-foreground text-pretty">{content}</p>
        {attachments.length > 0 && (
          <div className="space-y-3 md:space-y-5">
            {attachments.map((file, index) => {
              const key = `${file.name}-${index}`
              // Images
              if (file.type.startsWith("image/")) {
                return (
                  <div key={key} className="rounded-lg md:rounded-xl overflow-hidden bg-muted max-h-80 md:max-h-[420px] group-hover:shadow-xl transition">
                    <img src={file.data} alt={file.name} className="w-full h-full object-cover" />
                  </div>
                )
              }
              // PDFs
              if (file.type === "application/pdf") {
                return (
                  <div key={key} className="space-y-2 md:space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 text-xs md:text-sm font-medium min-w-0">
                        <FileText className="w-4 h-4 shrink-0" /> <span className="truncate">{file.name}</span>
                      </div>
                      <a href={file.data} download={file.name} className="text-xs inline-flex items-center gap-1 text-primary hover:underline whitespace-nowrap">
                        <Download className="w-3 h-3" /> Download
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
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-3 md:px-4 py-2 md:py-3 gap-2"
                >
                  <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    <FileText className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm font-medium text-foreground truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <a
                    href={file.data}
                    download={file.name}
                    className="inline-flex items-center gap-1 text-xs md:text-sm text-primary hover:underline shrink-0"
                  >
                    <Download className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden md:inline">Download</span>
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
          <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground border-t border-border/30 pt-2 md:pt-3 -mx-3 -mb-3 md:-mx-6 md:-mb-6 px-3 md:px-6 py-2 md:py-3 bg-linear-to-r from-primary/5 to-accent/5 rounded-b-lg">
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => onLike(id)} className="flex items-center gap-1 md:gap-2 hover:text-primary transition-all group" aria-label="Like post">
                  <Heart className={`w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:scale-110 ${isLiked ? "fill-primary text-primary" : ""}`} />
                  <span className="text-xs md:text-sm font-medium">{likes}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>Like</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center gap-1 md:gap-2 hover:text-accent transition-all group"
                  aria-label="Show comments"
                >
                  <MessageCircle className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:scale-110" />
                  <span className="text-xs md:text-sm font-medium">{comments.length}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>Comments</TooltipContent>
            </Tooltip>
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 md:gap-2 hover:text-orange-500 transition-all group" aria-label="Share post">
                      <Share2 className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:scale-110" />
                    </button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>Share</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="start" className="w-48 md:w-56 text-xs md:text-sm">
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
          <div className="space-y-2 md:space-y-3 border-t border-border/30 pt-3 md:pt-4">
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {comments.map((comment, idx) => (
                <div key={idx} className="flex gap-2">
                  <Avatar className="w-7 h-7 md:w-8 md:h-8 shrink-0">
                    <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-medium">{comment.author}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">{comment.content}</p>
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
                className="bg-background/50 text-xs md:text-sm"
              />
              <Button size="sm" onClick={handleCommentSubmit} disabled={isCommentLoading || !commentInput.trim()} className="text-xs md:text-sm">
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
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-xs md:text-sm font-medium min-w-0">
          <Play className="w-4 h-4 shrink-0" /> <span className="truncate">{file.name}</span>
        </div>
        <a href={file.data} download={file.name} className="text-xs inline-flex items-center gap-1 text-primary hover:underline whitespace-nowrap">
          <Download className="w-3 h-3" /> Download
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
