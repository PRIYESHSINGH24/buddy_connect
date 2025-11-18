"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import CreatePost from "@/components/feed/create-post"
import PostCard from "@/components/feed/post-card"
import { Button } from "@/components/ui/button"
import BeautifulLoader from "@/components/ui/beautiful-loader"
import Link from "next/link"
import Header from "@/components/header"
import UsersTable from "@/components/users/users-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface UserInfo {
  _id: string
  name: string
  profileImage?: string
}

interface Post {
  _id: string
  author: string
  authorImage?: string
  content: string
  image?: string
  likes: string[]
  comments: Array<{ author: string; content: string }>
  createdAt: string
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [postCursor, setPostCursor] = useState<string | null>(null)
  const [postsLoadingMore, setPostsLoadingMore] = useState(false)
  const [postsHasMore, setPostsHasMore] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const [events, setEvents] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])

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

        await Promise.all([loadPosts(), loadUsers(), loadEvents(), loadJobs()])
      } catch (error) {
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const loadPosts = async (cursor?: string | null) => {
    try {
      const params = new URLSearchParams()
      params.set('limit', '10')
      if (cursor) params.set('cursor', cursor)
      const response = await fetch(`/api/posts?${params.toString()}`)
      const data = await response.json()
      if (cursor) {
        setPosts((prev) => [...prev, ...(data.posts || [])])
      } else {
        setPosts(data.posts || [])
      }
      setPostCursor(data.nextCursor || null)
      setPostsHasMore(Boolean(data.nextCursor))
    } catch (error) {
      console.error("Failed to load posts:", error)
    }
  }

  const loadEvents = async () => {
    try {
      const r = await fetch('/api/events')
      if (!r.ok) return
      const d = await r.json()
      setEvents(d.events || [])
    } catch (e) {
      console.error(e)
    }
  }

  const loadJobs = async () => {
    try {
      const r = await fetch('/api/jobs')
      if (!r.ok) return
      const d = await r.json()
      setJobs(d.jobs || [])
    } catch (e) {
      console.error(e)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/users")
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error("Failed to load users:", error)
    }
  }

  const handleLike = async (postId: string) => {
    if (!user) return
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id }),
      })
      const data = await res.json()

      if (res.ok && data.likes) {
        // Update the specific post's likes without refetching all posts
        setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, likes: data.likes } : p)))
      } else {
        // Fallback: reload all posts
        await loadPosts()
      }
    } catch (error) {
      console.error("Failed to like post:", error)
    }
  }

  // Infinite scroll for posts
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver((entries) => {
      const first = entries[0]
      if (first.isIntersecting && postsHasMore && !postsLoadingMore) {
        setPostsLoadingMore(true)
        loadPosts(postCursor).finally(() => setPostsLoadingMore(false))
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [postCursor, postsHasMore, postsLoadingMore])

  const handleComment = async (postId: string, content: string) => {
    if (!user) return
    try {
      const res = await fetch(`/api/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          author: user.name,
          content,
        }),
      })
      const data = await res.json()

      if (res.ok && data.comment) {
        // Append the new comment to the specific post locally
        setPosts((prev) =>
          prev.map((p) => (p._id === postId ? { ...p, comments: [...p.comments, data.comment] } : p))
        )
      } else {
        await loadPosts()
      }
    } catch (error) {
      console.error("Failed to add comment:", error)
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })
      if (response.ok) {
        router.push("/login")
      }
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setLoggingOut(false)
    }
  }

  if (loading) {
    return <BeautifulLoader message="Loading your feed" />
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* TWO COLUMN LAYOUT */}
      <div className="container mx-auto px-4 py-8">
        {/* Header / Welcome */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-stretch">
          <Card className="lg:col-span-2 flex items-center gap-4 p-6">
            <div>
              <Avatar className="w-16 h-16">
                {user?.profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.profileImage} alt={user.name} className="object-cover w-full h-full rounded-full" />
                ) : (
                  <div className="text-lg">{user?.name?.charAt(0) || 'U'}</div>
                )}
              </Avatar>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Welcome back, {user?.name} 👋</h2>
              <p className="text-sm text-muted-foreground mt-1">Here's what's happening in your network today.</p>
              <div className="mt-3 flex gap-2 flex-wrap">
                <Badge variant="secondary">Connections: {user?.connections?.length || 0}</Badge>
                <Badge variant="secondary">Posts: {posts.length}</Badge>
                <Badge variant="secondary">Events: {events.length}</Badge>
              </div>
            </div>
            <div className="self-start">
              <Button onClick={() => window.scrollTo({ top: 1000, behavior: 'smooth' })}>Go to Feed</Button>
            </div>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={() => window.dispatchEvent(new Event('toggleMessages'))} variant="ghost">Open Messages</Button>
                <Link href="/events"><Button variant="ghost">View Events</Button></Link>
                <Link href="/jobs"><Button variant="ghost">View Jobs</Button></Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                {events.slice(0,3).length===0 ? <div className="text-sm text-muted-foreground">No upcoming events</div> : (
                  <ul className="space-y-2">
                    {events.slice(0,3).map((ev:any)=> (
                      <li key={ev._id} className="text-sm">
                        <Link href={`/events`} className="text-primary hover:underline">{ev.title || ev.name}</Link>
                        <div className="text-xs text-muted-foreground">{new Date(ev.date || ev.createdAt).toLocaleDateString()}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          <div>
            <Card className="mb-6">
              <CardContent>
                {user && (
                  <CreatePost
                    userId={user._id}
                    userName={user.name}
                    userImage={user.profileImage}
                    onPostCreated={loadPosts}
                  />
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              {posts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No posts yet. Be the first to share!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post._id}
                    id={post._id}
                    author={post.author}
                    authorImage={post.authorImage}
                    content={post.content}
                    image={post.image}
                    likes={post.likes.length}
                    comments={post.comments}
                    isLiked={post.likes.includes(user?._id)}
                    onLike={handleLike}
                    onComment={handleComment}
                    userId={user?._id}
                  />
                ))
              )}
              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} />
              {postsLoadingMore && (
                <div className="text-center py-4 text-sm text-muted-foreground">Loading more…</div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <UsersTable users={users} currentUser={user} onUpdateCurrentUser={async () => {
              try {
                const r = await fetch('/api/auth/me')
                if (r.ok) {
                  const data = await r.json()
                  setUser(data)
                }
              } catch (err) {
                console.error(err)
              }
            }} />

            <Card>
              <CardHeader>
                <CardTitle>Recent Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                {jobs.slice(0,3).length===0 ? <div className="text-sm text-muted-foreground">No jobs posted</div> : (
                  <ul className="space-y-2">
                    {jobs.slice(0,3).map((j:any)=> (
                      <li key={j._id} className="text-sm">
                        <Link href={`/jobs`} className="text-primary hover:underline">{j.title}</Link>
                        <div className="text-xs text-muted-foreground">{j.company?.name || j.company}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  )
}
