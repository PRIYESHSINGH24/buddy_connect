"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AITeamMatcher from "@/components/hackathon/ai-team-matcher"
import { Button } from "@/components/ui/button"
import BeautifulLoader from "@/components/ui/beautiful-loader"
import Link from "next/link"
import Header from "@/components/header"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HackathonPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
      } catch (error) {
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return <BeautifulLoader message="Loading hackathon" />
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Hackathon Teams</h2>
            <p className="text-muted-foreground">Use AI to find the perfect team members for your hackathon project</p>
          </div>

          {user && <AITeamMatcher userId={user._id} userName={user.name} userSkills={user.skills || []} />}

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  {
                    step: "1",
                    title: "Share Your Skills",
                    desc: "Tell us about your technical skills and interests",
                  },
                  {
                    step: "2",
                    title: "AI Analysis",
                    desc: "Our AI analyzes available candidates for skill diversity",
                  },
                  {
                    step: "3",
                    title: "Perfect Match",
                    desc: "Get recommended team members with complementary skills",
                  },
                  {
                    step: "4",
                    title: "Build Together",
                    desc: "Connect with your team and start building your project",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
