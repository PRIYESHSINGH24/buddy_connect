"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (!res.ok) return
        const data = await res.json()
        setUser(data)
      } catch (err) {
        // not logged in
      }
    }
    load()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (err) {
      console.error(err)
    }
  }

  const unreadCount = (user?.notifications || []).filter((n: any) => !n.read).length

  const markRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' })
      // refresh notifications
      const res = await fetch('/api/auth/me')
      if (res.ok) setUser(await res.json())
    } catch (e) {
      console.error(e)
    }
  }

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' })
      const res = await fetch('/api/auth/me')
      if (res.ok) setUser(await res.json())
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <nav className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Buddy Connect" width={40} height={40} />
          <h1 className="text-xl font-bold">Buddy Connect</h1>
        </Link>

        <div className="flex gap-4 items-center">
          <Link href="/dashboard"><Button variant="ghost">Feed</Button></Link>
          <Link href="/projects"><Button variant="ghost">Projects</Button></Link>
          <Link href="/hackathon"><Button variant="ghost">Hackathon</Button></Link>
          <Link href="/events"><Button variant="ghost">Events</Button></Link>
          <Link href="/jobs"><Button variant="ghost">Jobs</Button></Link>

          <Button size="sm" variant="ghost" onClick={() => window.dispatchEvent(new Event('toggleMessages'))}>
            Messages
          </Button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button aria-label="Notifications" className="relative inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-accent transition-colors">
                  {/* Bell icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 1 0-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] leading-none px-1.5 py-1 rounded-full font-medium">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-primary hover:underline">Mark all read</button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(user?.notifications || []).length === 0 ? (
                  <div className="px-2 py-6 text-sm text-muted-foreground">No notifications</div>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    {(user.notifications || []).map((n: any) => (
                      <DropdownMenuItem key={n._id} className="items-start gap-2">
                        <div className={`mt-1 w-2 h-2 rounded-full ${n.read ? 'bg-muted' : 'bg-primary'}`} />
                        <div className="flex-1">
                          <div className="text-sm">{n.message}</div>
                          <div className="text-xs text-muted-foreground">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</div>
                        </div>
                        {!n.read && (
                          <button onClick={(e)=>{ e.stopPropagation(); markRead(n._id) }} className="text-xs text-primary hover:underline">Mark read</button>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {user ? (
            <>
              <Link href="/profile" aria-label="Your profile">
                {user.profileImage ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img src={user.profileImage} alt={user.name} className="object-cover w-full h-full" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">{user.name?.charAt(0) || 'U'}</div>
                )}
              </Link>
              <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <Link href="/login"><Button variant="outline">Login</Button></Link>
          )}
        </div>
      </div>
    </nav>
  )
}
