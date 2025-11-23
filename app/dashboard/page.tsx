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
import { Sparkles, Users, CalendarDays, Briefcase, Flame } from "lucide-react"
import DashboardSkeleton from "@/components/dashboard/dashboard-skeleton"

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
  attachments?: Array<{ name: string; type: string; size: number; data: string }>
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
  const [trending, setTrending] = useState<any[]>([])

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

        await Promise.all([loadPosts(), loadUsers(), loadEvents(), loadJobs(), loadTrending()])
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
  const loadTrending = async () => {
    try {
      const r = await fetch('/api/projects?limit=12')
      if (!r.ok) return
      const d = await r.json()
      const list = (d.projects || [])
        .map((p: any) => ({...p, likeCount: (p.likes || []).length}))
        .sort((a: any, b: any) => b.likeCount - a.likeCount)
        .slice(0, 6)
      setTrending(list)
    } catch (e) {
      console.error(e)
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
    return (
      <main className="min-h-screen bg-background relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -top-24 -right-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute top-1/3 -left-20 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
        </div>
        <Header />
        <DashboardSkeleton />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-24 -right-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute top-1/3 -left-20 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
      </div>
      <Header />

      {/* TWO COLUMN LAYOUT */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header / Welcome */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8 items-stretch">
          <Card className="lg:col-span-2 flex flex-col md:flex-row items-start md:items-center gap-4 p-4 md:p-6 bg-linear-to-br from-primary/10 via-card to-accent/5 border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg">
            <div className="shrink-0">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-linear-to-br from-primary/30 to-accent/20 blur-lg"></div>
                <Avatar className="w-14 h-14 md:w-16 md:h-16 relative">
                  {user?.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.profileImage} alt={user.name} className="object-cover w-full h-full rounded-full" />
                  ) : (
                    <div className="text-lg font-bold bg-linear-to-br from-primary to-accent text-white flex items-center justify-center w-full h-full">{user?.name?.charAt(0) || 'U'}</div>
                  )}
                </Avatar>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl md:text-2xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">Welcome back, {user?.name} 👋</h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">Here's what's happening in your network today.</p>
              <div className="mt-3 flex gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">Connections: {user?.connections?.length || 0}</Badge>
                <Badge variant="secondary" className="text-xs bg-accent/10 text-accent hover:bg-accent/20 border-accent/20">Posts: {posts.length}</Badge>
                <Badge variant="secondary" className="text-xs bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-orange-500/20">Events: {events.length}</Badge>
              </div>
            </div>
            <div className="self-start hidden md:block">
              <Button size="sm" onClick={() => window.scrollTo({ top: 1000, behavior: 'smooth' })} className="bg-linear-to-r from-primary to-accent hover:shadow-lg transition-all">Go to Feed</Button>
            </div>
          </Card>

          <div className="space-y-3 md:space-y-4">
            <Card className="border-border/30 bg-linear-to-br from-card/50 to-card/80 backdrop-blur hover:border-primary/30 transition-all hover:shadow-lg">
              <CardHeader className="pb-2 md:pb-3">
                <CardTitle className="text-base md:text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 md:space-y-3">
                <Button onClick={() => window.dispatchEvent(new Event('toggleMessages'))} variant="ghost" className="w-full justify-start text-sm hover:bg-primary/10 hover:text-primary transition-colors">Open Messages</Button>
                <Link href="/events"><Button variant="ghost" className="w-full justify-start text-sm hover:bg-accent/10 hover:text-accent transition-colors">View Events</Button></Link>
                <Link href="/jobs"><Button variant="ghost" className="w-full justify-start text-sm hover:bg-primary/10 hover:text-primary transition-colors">View Jobs</Button></Link>
              </CardContent>
            </Card>

            <Card className="border-border/30 bg-linear-to-br from-card/50 to-card/80 backdrop-blur hover:border-primary/30 transition-all hover:shadow-lg">
              <CardHeader className="pb-2 md:pb-3">
                <CardTitle className="text-base md:text-lg">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                {events.slice(0,3).length===0 ? <div className="text-xs md:text-sm text-muted-foreground py-2">No upcoming events</div> : (
                  <ul className="space-y-2">
                    {events.slice(0,3).map((ev:any)=> (
                      <li key={ev._id} className="text-xs md:text-sm group">
                        <Link href={`/events`} className="text-primary hover:underline truncate group-hover:text-accent transition-colors">{ev.title || ev.name}</Link>
                        <div className="text-xs text-muted-foreground">{new Date(ev.date || ev.createdAt).toLocaleDateString()}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-6 md:mb-8">
          <div className="rounded-lg border border-primary/20 bg-linear-to-br from-primary/5 to-primary/0 hover:from-primary/10 hover:to-primary/5 hover:border-primary/40 p-3 md:p-4 flex items-center gap-2 md:gap-3 transition-all hover:shadow-lg cursor-default">
            <div className="p-2 rounded-lg bg-linear-to-br from-primary/30 to-primary/10 text-primary shrink-0"><Users className="w-4 h-4 md:w-5 md:h-5" /></div>
            <div className="min-w-0">
              <div className="text-xs md:text-sm text-muted-foreground font-medium">Connections</div>
              <div className="font-bold text-sm md:text-lg text-primary">{user?.connections?.length || 0}</div>
            </div>
          </div>
          <div className="rounded-lg border border-accent/20 bg-linear-to-br from-accent/5 to-accent/0 hover:from-accent/10 hover:to-accent/5 hover:border-accent/40 p-3 md:p-4 flex items-center gap-2 md:gap-3 transition-all hover:shadow-lg cursor-default">
            <div className="p-2 rounded-lg bg-linear-to-br from-accent/30 to-accent/10 text-accent shrink-0"><CalendarDays className="w-4 h-4 md:w-5 md:h-5" /></div>
            <div className="min-w-0">
              <div className="text-xs md:text-sm text-muted-foreground font-medium">Events</div>
              <div className="font-bold text-sm md:text-lg text-accent">{events.length}</div>
            </div>
          </div>
          <div className="rounded-lg border border-orange-500/20 bg-linear-to-br from-orange-500/5 to-orange-500/0 hover:from-orange-500/10 hover:to-orange-500/5 hover:border-orange-500/40 p-3 md:p-4 flex items-center gap-2 md:gap-3 transition-all hover:shadow-lg cursor-default">
            <div className="p-2 rounded-lg bg-linear-to-br from-orange-500/30 to-orange-500/10 text-orange-600 shrink-0"><Briefcase className="w-4 h-4 md:w-5 md:h-5" /></div>
            <div className="min-w-0">
              <div className="text-xs md:text-sm text-muted-foreground font-medium">Jobs</div>
              <div className="font-bold text-sm md:text-lg text-orange-600">{jobs.length}</div>
            </div>
          </div>
          <div className="rounded-lg border border-purple-500/20 bg-linear-to-br from-purple-500/5 to-purple-500/0 hover:from-purple-500/10 hover:to-purple-500/5 hover:border-purple-500/40 p-3 md:p-4 flex items-center gap-2 md:gap-3 transition-all hover:shadow-lg cursor-default">
            <div className="p-2 rounded-lg bg-linear-to-br from-purple-500/30 to-purple-500/10 text-purple-600 shrink-0"><Sparkles className="w-4 h-4 md:w-5 md:h-5" /></div>
            <div className="min-w-0">
              <div className="text-xs md:text-sm text-muted-foreground font-medium">Posts</div>
              <div className="font-bold text-sm md:text-lg text-purple-600">{posts.length}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 md:gap-8">
          <div>
            <Card className="mb-4 md:mb-6 border-border/30 bg-linear-to-br from-card/50 to-card/80 backdrop-blur hover:border-primary/30 transition-all hover:shadow-lg">
              <CardContent className="p-3 md:p-6">
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

            {/* Trending Projects */}
            {trending.length > 0 && (
              <div className="mb-4 md:mb-6">
                <div className="flex items-center justify-between gap-2 mb-3 md:mb-4">
                  <h3 className="text-base md:text-lg font-bold flex items-center gap-2"><Flame className="w-5 h-5 text-orange-500 animate-pulse" /> Trending Projects</h3>
                  <Link href="/projects" className="text-xs md:text-sm text-primary hover:text-accent transition-colors font-medium">View all →</Link>
                </div>
                <div className="flex gap-3 md:gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {trending.map((p:any)=>(
                    <a key={p._id} href={`/projects`} className="min-w-[180px] md:min-w-[220px] rounded-lg border border-orange-500/20 bg-linear-to-br from-card/60 to-card/40 hover:from-orange-500/10 hover:to-card/60 p-3 md:p-4 hover:border-orange-500/40 transition-all hover:shadow-lg group">
                      <div className="font-semibold text-sm md:text-base truncate group-hover:text-orange-500 transition-colors">{p.title}</div>
                      {p.description && <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{p.description}</div>}
                      <div className="text-xs mt-2 text-muted-foreground font-medium flex items-center gap-1">❤️ <span className="text-orange-600 font-bold">{(p.likes||[]).length}</span></div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 md:space-y-6">
              {posts.length === 0 ? (
                <div className="text-center py-8 md:py-12 text-muted-foreground text-sm">
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
                    attachments={post.attachments}
                    likes={post.likes.length}
                    comments={post.comments}
                    isLiked={post.likes.includes(user?._id)}
                    onLike={handleLike}
                    onComment={handleComment}
                    userId={user?._id}
                    createdAt={post.createdAt}
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

          <aside className="space-y-4 md:space-y-6 lg:sticky lg:top-24 self-start">
            <UsersTable users={users} currentUser={user} loading={loading} onUpdateCurrentUser={async () => {
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

            <Card className="border-border/30 bg-linear-to-br from-card/50 to-card/80 backdrop-blur hover:border-primary/30 transition-all hover:shadow-lg">
              <CardHeader className="pb-2 md:pb-3">
                <CardTitle className="text-base md:text-lg">Recent Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                {jobs.slice(0,3).length===0 ? <div className="text-xs md:text-sm text-muted-foreground py-2">No jobs posted</div> : (
                  <ul className="space-y-2">
                    {jobs.slice(0,3).map((j:any)=> (
                      <li key={j._id} className="text-xs md:text-sm group">
                        <Link href={`/jobs`} className="text-primary hover:text-accent hover:underline truncate transition-colors group-hover:font-semibold">{j.title}</Link>
                        <div className="text-xs text-muted-foreground truncate">{j.company?.name || j.company}</div>
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
