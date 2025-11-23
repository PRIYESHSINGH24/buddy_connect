"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Home, SquareStack, Zap, CalendarDays, Briefcase, MessageCircle, LogOut } from "lucide-react"

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

  const logoHref = user ? "/dashboard" : "/"

  return (
    <nav className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href={logoHref} className="inline-flex items-center" aria-label="Buddy Connect home">
          <img src="/buddy-logo.svg" alt="Buddy Connect" className="w-10 h-10 md:w-12 md:h-12 object-contain" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-4 items-center">
          <Link href="/dashboard"><Button variant="ghost" className="gap-2"><Home className="w-4 h-4" />Feed</Button></Link>
          <Link href="/projects"><Button variant="ghost" className="gap-2"><SquareStack className="w-4 h-4" />Projects</Button></Link>
          <Link href="/hackathon"><Button variant="ghost" className="gap-2"><Zap className="w-4 h-4" />Hackathon</Button></Link>
          <Link href="/events"><Button variant="ghost" className="gap-2"><CalendarDays className="w-4 h-4" />Events</Button></Link>
          <Link href="/jobs"><Button variant="ghost" className="gap-2"><Briefcase className="w-4 h-4" />Jobs</Button></Link>

          <Button size="sm" variant="ghost" className="gap-2" onClick={() => window.dispatchEvent(new Event('toggleMessages'))}>
            <MessageCircle className="w-4 h-4" />Messages
          </Button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button aria-label="Notifications" className="relative inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-accent transition-colors">
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
              <Button variant="outline" onClick={handleLogout} className="gap-2"><LogOut className="w-4 h-4" />Logout</Button>
            </>
          ) : (
            <Link href="/login"><Button variant="outline">Login</Button></Link>
          )}
        </div>

        {/* Mobile nav */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button aria-label="Open menu" className="inline-flex items-center justify-center w-10 h-10 rounded-md hover:bg-accent">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="p-4">
              <Link href={logoHref} className="inline-flex items-center mb-4" aria-label="Buddy Connect home">
                <img src="/buddy-logo.svg" alt="Buddy Connect" className="w-10 h-10 object-contain" />
              </Link>
              <div className="flex flex-col gap-2">
                <Link href="/dashboard"><Button variant="ghost" className="justify-start gap-2"><Home className="w-4 h-4" />Feed</Button></Link>
                <Link href="/projects"><Button variant="ghost" className="justify-start gap-2"><SquareStack className="w-4 h-4" />Projects</Button></Link>
                <Link href="/hackathon"><Button variant="ghost" className="justify-start gap-2"><Zap className="w-4 h-4" />Hackathon</Button></Link>
                <Link href="/events"><Button variant="ghost" className="justify-start gap-2"><CalendarDays className="w-4 h-4" />Events</Button></Link>
                <Link href="/jobs"><Button variant="ghost" className="justify-start gap-2"><Briefcase className="w-4 h-4" />Jobs</Button></Link>
                <Button size="sm" variant="ghost" className="justify-start gap-2" onClick={() => window.dispatchEvent(new Event('toggleMessages'))}>
                  <MessageCircle className="w-4 h-4" />Messages
                </Button>
              </div>
              {user && (
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">Notifications {unreadCount>0 && (<span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-destructive text-destructive-foreground text-[10px]">{unreadCount}</span>)}</div>
                  <div className="max-h-48 overflow-y-auto border rounded">
                    {(user.notifications||[]).length===0 ? (
                      <div className="text-sm text-muted-foreground p-3">No notifications</div>
                    ) : (
                      <ul className="divide-y">
                        {(user.notifications||[]).map((n:any)=> (
                          <li key={n._id} className="p-3 text-sm flex items-start gap-2">
                            <div className={`mt-1 w-2 h-2 rounded-full ${n.read ? 'bg-muted' : 'bg-primary'}`} />
                            <div className="flex-1">
                              <div>{n.message}</div>
                              <div className="text-xs text-muted-foreground">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</div>
                            </div>
                            {!n.read && (
                              <button onClick={() => markRead(n._id)} className="text-xs text-primary">Mark</button>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {unreadCount>0 && (
                    <div className="mt-2"><button onClick={markAllRead} className="text-xs text-primary hover:underline">Mark all read</button></div>
                  )}
                </div>
              )}

              <div className="mt-6">
                {user ? (
                  <div className="flex items-center justify-between">
                    <Link href="/profile" className="flex items-center gap-2">
                      {user.profileImage ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                          <img src={user.profileImage} alt={user.name} className="object-cover w-full h-full" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">{user.name?.charAt(0) || 'U'}</div>
                      )}
                      <span className="font-medium">{user.name}</span>
                    </Link>
                    <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2"><LogOut className="w-4 h-4" />Logout</Button>
                  </div>
                ) : (
                  <Link href="/login"><Button className="w-full">Login</Button></Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
