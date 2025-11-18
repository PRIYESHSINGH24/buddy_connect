"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import CreatePost from "@/components/feed/create-post"
import PostCard from "@/components/feed/post-card"
import { Button } from "@/components/ui/button"
import BeautifulLoader from "@/components/ui/beautiful-loader"
import Link from "next/link"
import Image from "next/image"
import UsersTable from "@/components/users/users-table"

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
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)

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

        await Promise.all([loadPosts(), loadUsers()])
      } catch (error) {
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const loadPosts = async () => {
    try {
      const response = await fetch("/api/posts")
      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error("Failed to load posts:", error)
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
      {/* NAVBAR */}
      <nav className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Buddy Connect" width={40} height={40} />
            <h1 className="text-xl font-bold">Buddy Connect</h1>
          </Link>

          <div className="flex gap-4">
            <Link href="/projects">
              <Button variant="ghost">Projects</Button>
            </Link>
            <Link href="/hackathon">
              <Button variant="ghost">Hackathon</Button>
            </Link>
            <Link href="/events">
              <Button variant="ghost">Events</Button>
            </Link>
            <Link href="/jobs">
              <Button variant="ghost">Jobs</Button>
            </Link>
            <Button size="sm" variant="ghost" onClick={() => window.dispatchEvent(new Event("toggleMessages"))}>
              Messages
            </Button>
            {user && (
              <Link href="/profile" aria-label="Your profile">
                {user.profileImage ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img src={user.profileImage} alt={user.name} className="object-cover w-full h-full" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                )}
              </Link>
            )}
            <Button variant="outline" onClick={handleLogout} disabled={loggingOut}>
              {loggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </nav>

      {/* TWO COLUMN LAYOUT */}
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[70%_30%] gap-8">

        {/* LEFT: POST FEED */}
        <div className="space-y-6 max-w-2xl mx-auto w-full">
          {user && (
            <CreatePost
              userId={user._id}
              userName={user.name}
              userImage={user.profileImage}
              onPostCreated={loadPosts}
            />
          )}

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
        </div>

        {/* RIGHT: USERS TABLE */}
        <div className="hidden lg:block">
          <UsersTable users={users} currentUser={user} onUpdateCurrentUser={async () => {
            // Refresh current user data
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
        </div>
      </div>
    </main>
  )
}
