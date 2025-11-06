"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import LinkedInImportDialog from "@/components/profile/linkedin-import-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import Image from "next/image"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    bio: "",
    skills: "",
    interests: "",
  })

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
        setFormData({
          bio: userData.bio || "",
          skills: userData.skills?.join(", ") || "",
          interests: userData.interests?.join(", ") || "",
        })
      } catch (error) {
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: formData.bio,
          skills: formData.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          interests: formData.interests
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean),
        }),
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setEditing(false)
      }
    } catch (error) {
      console.error("Failed to save profile:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <nav className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Buddy Connect" width={40} height={40} />
            <h1 className="text-xl font-bold">Buddy Connect</h1>
          </Link>
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Back to Feed</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Profile Header */}
          <Card className="border-border/50 bg-card/50 backdrop-blur overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary to-accent"></div>
            <CardContent className="pt-0">
              <div className="flex flex-col sm:flex-row gap-4 -mt-16 mb-4">
                <Avatar className="w-32 h-32 border-4 border-background">
                  <AvatarFallback className="text-lg">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 pt-8">
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  <p className="text-muted-foreground">
                    {user.department} • {user.year} Year
                  </p>
                  <p className="text-sm text-muted-foreground">{user.college}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Details */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Profile Information</CardTitle>
              <div className="flex gap-2">
                {editing ? (
                  <>
                    <Button onClick={() => setEditing(false)} variant="outline" size="sm">
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving} size="sm">
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </>
                ) : (
                  <>
                    <LinkedInImportDialog
                      userId={user._id}
                      onProfileImported={() => {
                        // Refresh user data
                        fetch("/api/auth/me")
                          .then((r) => r.json())
                          .then((data) => {
                            setUser(data)
                            setFormData({
                              bio: data.bio || "",
                              skills: data.skills?.join(", ") || "",
                              interests: data.interests?.join(", ") || "",
                            })
                          })
                      }}
                    />
                    <Button onClick={() => setEditing(true)} size="sm">
                      Edit Profile
                    </Button>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      placeholder="Tell us about yourself..."
                      value={formData.bio}
                      onChange={handleChange}
                      className="resize-none h-24"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills (comma-separated)</Label>
                    <Input
                      id="skills"
                      name="skills"
                      placeholder="React, Python, Design"
                      value={formData.skills}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interests">Interests (comma-separated)</Label>
                    <Input
                      id="interests"
                      name="interests"
                      placeholder="Web Dev, AI, Startups"
                      value={formData.interests}
                      onChange={handleChange}
                    />
                  </div>
                </>
              ) : (
                <>
                  {user.bio && (
                    <div>
                      <h3 className="font-semibold mb-2">Bio</h3>
                      <p className="text-foreground text-pretty">{user.bio}</p>
                    </div>
                  )}

                  {user.skills && user.skills.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {user.skills.map((skill: string) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {user.interests && user.interests.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Interests</h3>
                      <div className="flex flex-wrap gap-2">
                        {user.interests.map((interest: string) => (
                          <Badge key={interest} variant="outline">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium">{user.department}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Year</p>
                <p className="font-medium">{user.year}</p>
              </div>
              {user.linkedinUrl && (
                <div>
                  <p className="text-sm text-muted-foreground">LinkedIn Profile</p>
                  <a
                    href={user.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View on LinkedIn
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
