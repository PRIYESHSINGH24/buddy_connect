"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomeGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          router.push("/dashboard")
        }
      } catch {}
    }
    checkAuth()
  }, [router])

  return <>{children}</>
}
