"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

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
