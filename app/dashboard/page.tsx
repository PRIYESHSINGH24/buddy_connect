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
import { Sparkles, Users, CalendarDays, Briefcase, Flame, Target, TrendingUp, Zap, Award } from "lucide-react"
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
        router.push("/")
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
      <div className="container mx-auto px-4 md:px-8 lg:px-12 py-6 md:py-8 max-w-7xl">
        {/* Header / Welcome */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6 mb-4 md:mb-6">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-linear-to-r from-primary/8 to-accent/8 rounded-lg border border-primary/15 hover:border-primary/30 transition-all">
              <div className="shrink-0">
                <Avatar className="w-11 h-11 md:w-12 md:h-12 ring-2 ring-primary/25">
                  {user?.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.profileImage} alt={user.name} className="object-cover w-full h-full rounded-full" />
                  ) : (
                    <div className="text-xs md:text-sm font-bold bg-linear-to-br from-primary to-accent text-white flex items-center justify-center w-full h-full">{user?.name?.charAt(0) || 'U'}</div>
                  )}
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm md:text-base font-bold text-foreground leading-tight">Welcome back, {user?.name}</h2>
                <p className="text-xs text-muted-foreground leading-tight">What's happening in your network.</p>
              </div>
              <Button size="sm" onClick={() => window.scrollTo({ top: 1000, behavior: 'smooth' })} className="bg-linear-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/30 transition-all font-semibold text-xs shrink-0 h-9">Feed</Button>
            </div>

            {/* Highlights row - small status tiles to add useful content */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-card/60 border border-border/20 flex items-center gap-3">
                <div className="p-2 rounded bg-primary/15 text-primary"><Users className="w-4 h-4" /></div>
                <div>
                  <div className="text-xs text-muted-foreground">Connections</div>
                  <div className="text-sm font-semibold">{user?.connections?.length || 0}</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-card/60 border border-border/20 flex items-center gap-3">
                <div className="p-2 rounded bg-accent/15 text-accent"><CalendarDays className="w-4 h-4" /></div>
                <div>
                  <div className="text-xs text-muted-foreground">Upcoming</div>
                  <div className="text-sm font-semibold">{events.length} events</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-card/60 border border-border/20 flex items-center gap-3">
                <div className="p-2 rounded bg-purple-100 text-purple-600"><Sparkles className="w-4 h-4" /></div>
                <div>
                  <div className="text-xs text-muted-foreground">Posts</div>
                  <div className="text-sm font-semibold">{posts.length}</div>
                </div>
              </div>
            </div>

            {/* Additional info cards below highlights */}
            <div className="grid grid-cols-2 gap-3">
              {/* Recommended for you */}
                  <Card className="border-border/20 bg-card/40 backdrop-blur hover:border-accent/40 transition-all">
                <CardHeader className="pb-2 px-3 pt-3">
                  <CardTitle className="text-xs md:text-sm font-semibold flex items-center gap-2"><Zap className="w-4 h-4" /> Quick Tip</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Complete your profile to get better recommendations and visibility in the community.
                  </p>
                </CardContent>
              </Card>

              {/* Engagement stats */}
              <Card className="border-border/20 bg-card/40 backdrop-blur hover:border-primary/40 transition-all">
                <CardHeader className="pb-2 px-3 pt-3">
                  <CardTitle className="text-xs md:text-sm font-semibold flex items-center gap-2"><Award className="w-4 h-4" /> This Week</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3">
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Profile views</span>
                      <span className="font-semibold">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Interactions</span>
                      <span className="font-semibold">{posts.length * 2}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Featured Opportunities Section */}
            <Card className="border-border/20 bg-linear-to-r from-primary/10 via-card/50 to-accent/10 backdrop-blur hover:border-primary/40 transition-all">
              <CardHeader className="pb-3 px-4 pt-4">
                <CardTitle className="text-sm md:text-base font-bold flex items-center gap-2">
                  <Zap className="w-5 h-5" /> Featured Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Link href="/events" className="p-3 rounded-lg border border-accent/30 bg-accent/5 hover:bg-accent/15 hover:border-accent/50 transition-all group">
                    <div className="flex items-start gap-2">
                      <div className="p-2 rounded bg-accent/15 text-accent"><CalendarDays className="w-4 h-4" /></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors">Join Events</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">Meet like-minded professionals</p>
                      </div>
                    </div>
                  </Link>

                  <Link href="/projects" className="p-3 rounded-lg border border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/15 hover:border-orange-500/50 transition-all group">
                    <div className="flex items-start gap-2">
                      <div className="p-2 rounded bg-orange-500/15 text-orange-600"><Briefcase className="w-4 h-4" /></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-foreground group-hover:text-orange-600 transition-colors">Explore Projects</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">Collaborate on trending ideas</p>
                      </div>
                    </div>
                  </Link>

                  <Link href="/profile" className="p-3 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/15 hover:border-primary/50 transition-all group">
                    <div className="flex items-start gap-2">
                      <div className="p-2 rounded bg-primary/15 text-primary"><Users className="w-4 h-4" /></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">Grow Your Network</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">Build meaningful connections</p>
                      </div>
                    </div>
                  </Link>

                  <Link href="/dashboard" className="p-3 rounded-lg border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/15 hover:border-purple-500/50 transition-all group">
                    <div className="flex items-start gap-2">
                      <div className="p-2 rounded bg-purple-500/15 text-purple-600"><Target className="w-4 h-4" /></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-foreground group-hover:text-purple-600 transition-colors">Get Recommendations</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">Personalized suggestions for you</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3 md:space-y-4">
            <Card className="border-border/40 md:border-border/30 bg-linear-to-br from-card/60 md:from-card/50 to-card/90 md:to-card/80 backdrop-blur hover:border-primary/40 md:hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/10">
              <CardHeader className="pb-2 md:pb-3 px-4 md:px-6 pt-4 md:pt-6">
                <CardTitle className="text-base md:text-lg font-bold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 md:space-y-3 px-4 md:px-6 pb-4 md:pb-6">
                <Link href="/profile" className="flex items-center gap-2 p-2 rounded-lg border border-transparent hover:border-primary/30 hover:bg-primary/10 transition-all group">
                  <div className="p-2 rounded-lg bg-primary/15 text-primary"><Users className="w-4 h-4" /></div>
                  <div>
                    <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">View Profile</div>
                    <div className="text-xs text-muted-foreground">Update your info</div>
                  </div>
                </Link>
                <Link href="/events" className="flex items-center gap-2 p-2 rounded-lg border border-transparent hover:border-accent/30 hover:bg-accent/10 transition-all group">
                  <div className="p-2 rounded-lg bg-accent/15 text-accent"><CalendarDays className="w-4 h-4" /></div>
                  <div>
                    <div className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors">Browse Events</div>
                    <div className="text-xs text-muted-foreground">{events.length} events</div>
                  </div>
                </Link>
                <Link href="/projects" className="flex items-center gap-2 p-2 rounded-lg border border-transparent hover:border-orange-500/30 hover:bg-orange-500/10 transition-all group">
                  <div className="p-2 rounded-lg bg-orange-500/15 text-orange-600"><Briefcase className="w-4 h-4" /></div>
                  <div>
                    <div className="text-xs font-semibold text-foreground group-hover:text-orange-600 transition-colors">View Projects</div>
                    <div className="text-xs text-muted-foreground">Check trending</div>
                  </div>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-border/40 md:border-border/30 bg-linear-to-br from-card/60 md:from-card/50 to-card/90 md:to-card/80 backdrop-blur hover:border-primary/40 md:hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/10">
              <CardHeader className="pb-2 md:pb-3 px-4 md:px-6 pt-4 md:pt-6">
                <CardTitle className="text-base md:text-lg font-bold flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-accent" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
                {events.slice(0,3).length===0 ? (
                  <div className="text-center py-4">
                    <CalendarDays className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                    <div className="text-xs text-muted-foreground">No events coming up</div>
                    <Link href="/events" className="text-xs text-primary hover:text-accent font-semibold mt-2 inline-block hover:underline">Explore events →</Link>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {events.slice(0,3).map((ev:any, idx:number)=> (
                      <li key={ev._id} className="text-xs group">
                        <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-accent/10 transition-colors">
                          <div className="text-sm font-bold text-accent shrink-0">{idx + 1}</div>
                          <div className="min-w-0 flex-1">
                            <Link href={`/events`} className="text-primary hover:text-accent font-semibold hover:underline truncate block group-hover:font-bold transition-all">{ev.title || ev.name}</Link>
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <CalendarDays className="w-3 h-3" /> {new Date(ev.date || ev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Content Cards - Today's Focus, Network Activity, Skill Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8 mt-4 md:mt-6">
          {/* Today's Focus */}
          <Card className="border-border/30 bg-linear-to-br from-primary/5 to-primary/0 backdrop-blur hover:border-primary/40 transition-all hover:shadow-lg">
            <CardHeader className="pb-2 md:pb-3 px-4 md:px-6 pt-4 md:pt-6">
              <CardTitle className="text-sm md:text-base font-bold flex items-center gap-2">
                <Target className="w-4 h-4" /> Today's Focus
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
              <ul className="space-y-2 text-xs">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">→</span>
                  <span>Build your network with <strong>{Math.max(3 - (user?.connections?.length || 0), 0)}</strong> new connections</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">→</span>
                  <span>Explore <strong>{events.length}</strong> upcoming community events</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">→</span>
                  <span>Share your latest <strong>project or achievement</strong></span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Network Activity */}
          <Card className="border-border/30 bg-linear-to-br from-accent/5 to-accent/0 backdrop-blur hover:border-accent/40 transition-all hover:shadow-lg">
            <CardHeader className="pb-2 md:pb-3 px-4 md:px-6 pt-4 md:pt-6">
              <CardTitle className="text-sm md:text-base font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Network Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6 pb-4 md:pb-6 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Posts shared</span>
                <span className="font-semibold text-accent">{posts.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Active events</span>
                <span className="font-semibold text-accent">{events.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Connections</span>
                <span className="font-semibold text-accent">{user?.connections?.length || 0}</span>
              </div>
              <Button size="sm" asChild className="w-full mt-3 text-xs h-8 bg-accent/20 text-accent hover:bg-accent/30">
                <Link href="/dashboard">View Details →</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Skill Showcase */}
          <Card className="border-border/30 bg-linear-to-br from-purple-500/5 to-purple-500/0 backdrop-blur hover:border-purple-500/40 transition-all hover:shadow-lg">
            <CardHeader className="pb-2 md:pb-3 px-4 md:px-6 pt-4 md:pt-6">
              <CardTitle className="text-sm md:text-base font-bold flex items-center gap-2">
                <Award className="w-4 h-4" /> Profile Strength
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6 pb-4 md:pb-6 space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">Profile Completion</span>
                  <span className="text-xs font-semibold text-purple-600">75%</span>
                </div>
                <div className="w-full bg-border/30 rounded-full h-1.5">
                  <div className="bg-linear-to-r from-purple-500 to-purple-400 h-1.5 rounded-full" style={{width: '75%'}}></div>
                </div>
              </div>
              <Button size="sm" asChild className="w-full text-xs h-8 bg-purple-500/20 text-purple-600 hover:bg-purple-500/30">
                <Link href="/profile">Complete Profile →</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-6 md:mb-8">
          <div className="rounded-lg border-2 md:border border-primary/30 md:border-primary/20 bg-linear-to-br from-primary/10 md:from-primary/5 to-primary/0 hover:from-primary/15 md:hover:from-primary/10 hover:to-primary/5 hover:border-primary/50 md:hover:border-primary/40 p-3 md:p-4 flex items-center gap-2 md:gap-3 transition-all hover:shadow-lg cursor-default shadow-sm md:shadow-none">
            <div className="p-2 rounded-lg bg-linear-to-br from-primary/40 md:from-primary/30 to-primary/20 md:to-primary/10 text-primary shrink-0"><Users className="w-5 h-5 md:w-5 md:h-5" /></div>
            <div className="min-w-0">
              <div className="text-xs md:text-sm text-muted-foreground font-bold md:font-medium">Connections</div>
              <div className="font-bold text-base md:text-lg text-primary">{user?.connections?.length || 0}</div>
            </div>
          </div>
          <div className="rounded-lg border-2 md:border border-accent/30 md:border-accent/20 bg-linear-to-br from-accent/10 md:from-accent/5 to-accent/0 hover:from-accent/15 md:hover:from-accent/10 hover:to-accent/5 hover:border-accent/50 md:hover:border-accent/40 p-3 md:p-4 flex items-center gap-2 md:gap-3 transition-all hover:shadow-lg cursor-default shadow-sm md:shadow-none">
            <div className="p-2 rounded-lg bg-linear-to-br from-accent/40 md:from-accent/30 to-accent/20 md:to-accent/10 text-accent shrink-0"><CalendarDays className="w-5 h-5 md:w-5 md:h-5" /></div>
            <div className="min-w-0">
              <div className="text-xs md:text-sm text-muted-foreground font-bold md:font-medium">Events</div>
              <div className="font-bold text-base md:text-lg text-accent">{events.length}</div>
            </div>
          </div>
          <div className="rounded-lg border-2 md:border border-orange-500/30 md:border-orange-500/20 bg-linear-to-br from-orange-500/10 md:from-orange-500/5 to-orange-500/0 hover:from-orange-500/15 md:hover:from-orange-500/10 hover:to-orange-500/5 hover:border-orange-500/50 md:hover:border-orange-500/40 p-3 md:p-4 flex items-center gap-2 md:gap-3 transition-all hover:shadow-lg cursor-default shadow-sm md:shadow-none">
            <div className="p-2 rounded-lg bg-linear-to-br from-orange-500/40 md:from-orange-500/30 to-orange-500/20 md:to-orange-500/10 text-orange-600 shrink-0"><Briefcase className="w-5 h-5 md:w-5 md:h-5" /></div>
            <div className="min-w-0">
              <div className="text-xs md:text-sm text-muted-foreground font-bold md:font-medium">Jobs</div>
              <div className="font-bold text-base md:text-lg text-orange-600">{jobs.length}</div>
            </div>
          </div>
          <div className="rounded-lg border-2 md:border border-purple-500/30 md:border-purple-500/20 bg-linear-to-br from-purple-500/10 md:from-purple-500/5 to-purple-500/0 hover:from-purple-500/15 md:hover:from-purple-500/10 hover:to-purple-500/5 hover:border-purple-500/50 md:hover:border-purple-500/40 p-3 md:p-4 flex items-center gap-2 md:gap-3 transition-all hover:shadow-lg cursor-default shadow-sm md:shadow-none">
            <div className="p-2 rounded-lg bg-linear-to-br from-purple-500/40 md:from-purple-500/30 to-purple-500/20 md:to-purple-500/10 text-purple-600 shrink-0"><Sparkles className="w-5 h-5 md:w-5 md:h-5" /></div>
            <div className="min-w-0">
              <div className="text-xs md:text-sm text-muted-foreground font-bold md:font-medium">Posts</div>
              <div className="font-bold text-base md:text-lg text-purple-600">{posts.length}</div>
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
                <div className="flex items-center justify-between gap-2 mb-3 md:mb-4 px-1">
                  <h3 className="text-base md:text-lg font-bold flex items-center gap-2 md:gap-3"><Flame className="w-5 h-5 md:w-5 md:h-5 text-orange-500 animate-pulse" /> Trending Projects</h3>
                  <Link href="/projects" className="text-xs md:text-sm text-primary hover:text-accent transition-colors font-bold md:font-semibold">View all →</Link>
                </div>
                <div className="flex gap-2 md:gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-1">
                  {trending.map((p:any)=>(
                    <a key={p._id} href={`/projects`} className="min-w-40 md:min-w-56 rounded-lg border-2 md:border border-orange-500/40 md:border-orange-500/20 bg-linear-to-br from-card/70 md:from-card/60 to-card/90 hover:from-orange-500/20 md:hover:from-orange-500/10 hover:to-card/70 p-3 md:p-4 hover:border-orange-500/60 md:hover:border-orange-500/40 transition-all hover:shadow-lg hover:shadow-orange-500/20 group">
                      <div className="font-bold text-sm md:text-base truncate group-hover:text-orange-500 transition-colors">{p.title}</div>
                      {p.description && <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{p.description}</div>}
                      <div className="text-xs mt-2 text-muted-foreground font-bold flex items-center gap-1"><Flame className="w-3 h-3 text-orange-600" /> <span className="text-orange-600 font-bold">{(p.likes||[]).length}</span></div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 md:space-y-6">
              {posts.length === 0 ? (
                <Card className="border-border/40 bg-linear-to-br from-primary/5 via-card to-accent/5 backdrop-blur hover:border-primary/30 transition-all border-dashed border-2">
                  <CardContent className="p-8 md:p-12 text-center space-y-4">
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-linear-to-br from-primary/30 to-accent/20 blur-xl opacity-60 animate-pulse"></div>
                        <div className="relative p-6 rounded-full bg-linear-to-br from-primary/20 to-accent/10 border border-primary/30">
                          <Sparkles className="w-8 h-8 text-primary" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">No posts yet</h3>
                      <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto mb-4">
                        Share your first post and start connecting with others in the community!
                      </p>
                    </div>
                    <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="bg-linear-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/30 transition-all font-semibold">
                      Create Your First Post
                    </Button>
                  </CardContent>
                </Card>
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
                <div className="flex justify-center py-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: "0s"}}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: "0.4s"}}></div>
                    <span className="ml-2">Loading more posts…</span>
                  </div>
                </div>
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

            {/* People you may know - small suggestions to fill the sidebar */}
            <Card className="border-border/30 bg-linear-to-br from-card/50 to-card/80 backdrop-blur hover:border-primary/30 transition-all hover:shadow-lg">
              <CardHeader className="pb-2 md:pb-3 px-4 md:px-6 pt-4 md:pt-6">
                <CardTitle className="text-base md:text-lg">People you may know</CardTitle>
              </CardHeader>
              <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
                {users.slice(0,3).length===0 ? (
                  <div className="text-xs text-muted-foreground">No suggestions yet</div>
                ) : (
                  <ul className="space-y-2">
                    {users.slice(0,3).map((u:any)=> (
                      <li key={u._id} className="flex items-center gap-2 text-sm">
                        <Avatar className="w-7 h-7">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={u.profileImage || '/placeholder.svg'} alt={u.name} className="object-cover w-full h-full rounded-full" />
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-medium text-primary truncate">{u.name}</div>
                          <div className="text-xs text-muted-foreground">{u.title || u.role || 'Member'}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/30 bg-linear-to-br from-card/50 to-card/80 backdrop-blur hover:border-primary/30 transition-all hover:shadow-lg">
              <CardHeader className="pb-2 md:pb-3 px-4 md:px-6 pt-4 md:pt-6">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-orange-600" />
                  Recent Jobs
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
                {jobs.slice(0,3).length===0 ? (
                  <div className="text-center py-4">
                    <Briefcase className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                    <div className="text-xs text-muted-foreground">No jobs available</div>
                    <Link href="/projects" className="text-xs text-primary hover:text-accent font-semibold mt-2 inline-block hover:underline">View opportunities →</Link>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {jobs.slice(0,3).map((j:any, idx:number)=> (
                      <li key={j._id} className="text-xs group">
                        <Link href={`/projects`} className="flex items-start gap-2 p-2 rounded-lg hover:bg-orange-500/10 transition-colors group">
                          <div className="text-sm font-bold text-orange-600 shrink-0">{idx + 1}</div>
                          <div className="min-w-0 flex-1">
                            <div className="text-primary hover:text-accent hover:underline truncate font-semibold transition-colors group-hover:font-bold">{j.title}</div>
                            <div className="text-xs text-muted-foreground truncate mt-0.5">{j.company?.name || j.company}</div>
                          </div>
                        </Link>
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
