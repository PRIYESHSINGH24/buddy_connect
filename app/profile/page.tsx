"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import LinkedInImportDialog from "@/components/profile/linkedin-import-dialog"
import { Button } from "@/components/ui/button"
import BeautifulLoader from "@/components/ui/beautiful-loader"
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
  const [formData, setFormData] = useState<any>({
    bio: "",
    skills: "",
    interests: "",
    experience: "",
    education: "",
    projects: "",
    certifications: "",
    contactPhone: "",
    contactWebsite: "",
    resumeUrl: "",
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
          experience: (userData.experience || []).map((e: any) => `${e.title || e.role || ''} at ${e.company || ''} (${e.start || ''} - ${e.end || ''})`).join('\n'),
          education: (userData.education || []).map((ed: any) => `${ed.degree || ''} • ${ed.institution || ''} (${ed.start || ''} - ${ed.end || ''})`).join('\n'),
          projects: (userData.projects || []).map((p: any) => `${p.name || ''}: ${p.description || ''}`).join('\n'),
          certifications: (userData.certifications || []).join('\n') || "",
          contactPhone: userData.contact?.phone || "",
          contactWebsite: userData.contact?.website || "",
          resumeUrl: userData.resumeUrl || "",
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
      // build payload from formData (parse multiline fields)
      const experience = (formData as any).experience
        ? (formData as any).experience
            .split('\n')
            .map((l: string) => l.trim())
            .filter(Boolean)
            .map((line: string) => {
              const atIdx = line.indexOf(' at ')
              const parenIdx = line.indexOf('(')
              let title = line
              let company = ''
              let start = ''
              let end = ''
              if (atIdx !== -1) {
                title = line.slice(0, atIdx).trim()
                const rest = line.slice(atIdx + 4).trim()
                if (parenIdx !== -1) {
                  company = rest.slice(0, parenIdx - (atIdx + 4) + 1).trim()
                } else {
                  company = rest
                }
              }
              if (parenIdx !== -1) {
                const paren = line.slice(parenIdx + 1, line.indexOf(')', parenIdx))
                if (paren) {
                  const parts = paren.split('-').map((p) => p.trim())
                  start = parts[0] || ''
                  end = parts[1] || ''
                }
              }
              return { title, company, start, end }
            })
        : []

      const education = (formData as any).education
        ? (formData as any).education
            .split('\n')
            .map((l: string) => l.trim())
            .filter(Boolean)
            .map((line: string) => {
              const parts = line.split('•')
              const degree = parts[0]?.trim() || ''
              const instAndYears = parts[1]?.trim() || ''
              let institution = instAndYears
              let start = ''
              let end = ''
              const parenIdx2 = instAndYears.indexOf('(')
              if (parenIdx2 !== -1) {
                institution = instAndYears.slice(0, parenIdx2).trim()
                const paren = instAndYears.slice(parenIdx2 + 1, instAndYears.indexOf(')', parenIdx2))
                if (paren) {
                  const partsY = paren.split('-').map((p) => p.trim())
                  start = partsY[0] || ''
                  end = partsY[1] || ''
                }
              }
              return { degree, institution, start, end }
            })
        : []

      const projects = (formData as any).projects
        ? (formData as any).projects
            .split('\n')
            .map((l: string) => l.trim())
            .filter(Boolean)
            .map((line: string) => {
              const idx = line.indexOf(':')
              if (idx !== -1) {
                return { name: line.slice(0, idx).trim(), description: line.slice(idx + 1).trim() }
              }
              return { name: line, description: '' }
            })
        : []

      const certifications = (formData as any).certifications
        ? (formData as any).certifications.split('\n').map((s: string) => s.trim()).filter(Boolean)
        : []

      const payload = {
        bio: formData.bio,
        skills: formData.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        interests: formData.interests
          .split(',')
          .map((i) => i.trim())
          .filter(Boolean),
        experience,
        education,
        projects,
        certifications,
        contact: {
          phone: (formData as any).contactPhone || '',
          website: (formData as any).contactWebsite || '',
        },
        resumeUrl: (formData as any).resumeUrl || '',
        profileImage: (formData as any).profileImage || user.profileImage || '',
      }

      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
    return <BeautifulLoader message="Loading profile" />
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
                  {user.profileImage ? (
                    // AvatarImage from ui/avatar is not directly imported; use an img fallback
                    <img src={user.profileImage} alt={user.name} className="object-cover w-full h-full rounded-full" />
                  ) : (
                    <AvatarFallback className="text-lg">{user.name.charAt(0)}</AvatarFallback>
                  )}
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
                              experience: (data.experience || []).map((e: any) => `${e.title || e.role || ''} at ${e.company || ''} (${e.start || ''} - ${e.end || ''})`).join('\n'),
                              education: (data.education || []).map((ed: any) => `${ed.degree || ''} • ${ed.institution || ''} (${ed.start || ''} - ${ed.end || ''})`).join('\n'),
                              projects: (data.projects || []).map((p: any) => `${p.name || ''}: ${p.description || ''}`).join('\n'),
                              certifications: (data.certifications || []).join('\n') || "",
                              contactPhone: data.contact?.phone || "",
                              contactWebsite: data.contact?.website || "",
                              resumeUrl: data.resumeUrl || "",
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

                  <div className="space-y-2">
                    <Label htmlFor="profileImage">Profile Photo</Label>
                    <input
                      id="profileImage"
                      name="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0]
                        if (!file) return
                        const reader = new FileReader()
                        reader.onload = () => {
                          const result = reader.result as string
                          setFormData((prev: any) => ({ ...prev, profileImage: result }))
                        }
                        reader.readAsDataURL(file)
                      }}
                    />
                    {(formData as any).profileImage && (
                      <div className="w-24 h-24 rounded-md overflow-hidden mt-2">
                        <img src={(formData as any).profileImage} alt="preview" className="object-cover w-full h-full" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience (one per line – e.g. "Software Engineer at Acme (2021 - 2023)")</Label>
                    <Textarea
                      id="experience"
                      name="experience"
                      placeholder="Role at Company (start - end)"
                      value={(formData as any).experience || ""}
                      onChange={handleChange}
                      className="resize-none h-28"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="education">Education (one per line – e.g. "B.Tech • Institute (2018 - 2022)")</Label>
                    <Textarea
                      id="education"
                      name="education"
                      placeholder="Degree • Institution (start - end)"
                      value={(formData as any).education || ""}
                      onChange={handleChange}
                      className="resize-none h-24"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="projects">Projects (one per line – e.g. "ProjectName: Short description")</Label>
                    <Textarea
                      id="projects"
                      name="projects"
                      placeholder="ProjectName: Description"
                      value={(formData as any).projects || ""}
                      onChange={handleChange}
                      className="resize-none h-24"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="certifications">Certifications (one per line)</Label>
                    <Textarea
                      id="certifications"
                      name="certifications"
                      placeholder="Certification 1\nCertification 2"
                      value={(formData as any).certifications || ""}
                      onChange={handleChange}
                      className="resize-none h-20"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactPhone">Phone</Label>
                      <Input id="contactPhone" name="contactPhone" value={(formData as any).contactPhone || ""} onChange={handleChange} />
                    </div>
                    <div>
                      <Label htmlFor="contactWebsite">Website</Label>
                      <Input id="contactWebsite" name="contactWebsite" value={(formData as any).contactWebsite || ""} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resumeUrl">Resume URL</Label>
                    <Input id="resumeUrl" name="resumeUrl" placeholder="https://..." value={(formData as any).resumeUrl || ""} onChange={handleChange} />
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
                  {user.experience && user.experience.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Experience</h3>
                      <div className="space-y-2">
                        {user.experience.map((e: any, idx: number) => (
                          <div key={idx}>
                            <div className="font-medium">{e.title}{e.company?` at ${e.company}`:''}</div>
                            <div className="text-sm text-muted-foreground">{e.start || ''}{e.end?` - ${e.end}`:''}</div>
                            {e.description && <div className="text-sm mt-1">{e.description}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {user.education && user.education.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Education</h3>
                      <div className="space-y-2">
                        {user.education.map((ed: any, idx: number) => (
                          <div key={idx}>
                            <div className="font-medium">{ed.degree} • {ed.institution}</div>
                            <div className="text-sm text-muted-foreground">{ed.start || ''}{ed.end?` - ${ed.end}`:''}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {user.projects && user.projects.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Projects</h3>
                      <div className="space-y-2">
                        {user.projects.map((p: any, idx: number) => (
                          <div key={idx}>
                            <div className="font-medium">{p.name}</div>
                            {p.description && <div className="text-sm text-muted-foreground">{p.description}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {user.certifications && user.certifications.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Certifications</h3>
                      <ul className="list-disc pl-5">
                        {user.certifications.map((c: string, idx: number) => (
                          <li key={idx}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(user.contact && (user.contact.phone || user.contact.website)) && (
                    <div>
                      <h3 className="font-semibold mb-2">Contact</h3>
                      {user.contact.phone && <div>Phone: {user.contact.phone}</div>}
                      {user.contact.website && (
                        <div>
                          Website: <a href={user.contact.website} className="text-primary hover:underline">{user.contact.website}</a>
                        </div>
                      )}
                    </div>
                  )}

                  {user.resumeUrl && (
                    <div>
                      <h3 className="font-semibold mb-2">Resume</h3>
                      <a href={user.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View / Download Resume</a>
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
