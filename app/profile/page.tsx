"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
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
import Header from "@/components/header"
import Image from "next/image"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const [myProjects, setMyProjects] = useState<any[]>([])
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
    github: "",
    leetcode: "",
    codeforces: "",
    website: "",
    username: "",
    featuredProjectIds: [] as string[],
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
          github: userData.socials?.github || "",
          leetcode: userData.socials?.leetcode || "",
          codeforces: userData.socials?.codeforces || "",
          website: userData.socials?.website || "",
          username: userData.username || "",
          featuredProjectIds: (userData.featuredProjectIds || []),
        })
      } catch (error) {
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    const loadMine = async () => {
      if (!user?._id) return
      try {
        const r = await fetch(`/api/projects?userId=${user._id}&limit=50`)
        if (r.ok) {
          const d = await r.json()
          setMyProjects(d.projects || [])
        }
      } catch (e) {
        console.error(e)
      }
    }
    loadMine()
  }, [user?._id])

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
        socials: {
          github: (formData as any).github || '',
          leetcode: (formData as any).leetcode || '',
          codeforces: (formData as any).codeforces || '',
          website: (formData as any).website || '',
        },
        username: (formData as any).username || '',
        featuredProjectIds: (formData as any).featuredProjectIds || [],
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

  // Quick image update from avatar click (works even when not editing)
  const onAvatarClick = () => {
    imageInputRef.current?.click()
  }

  const onProfileImagePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result as string
      setSaving(true)
      try {
        const response = await fetch('/api/auth/me', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileImage: base64 }),
        })
        if (response.ok) {
          const updated = await response.json()
          setUser(updated)
          setFormData((prev: any) => ({ ...prev, profileImage: base64 }))
        }
      } catch (err) {
        console.error('Failed to update profile image', err)
      } finally {
        setSaving(false)
        // reset input so same file can be re-selected later if needed
        if (imageInputRef.current) imageInputRef.current.value = ''
      }
    }
    reader.readAsDataURL(file)
  }

  if (loading) {
    return <BeautifulLoader message="Loading profile" />
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Hidden input to pick a new profile image */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onProfileImagePicked}
          />
          {/* Profile Header */}
          <Card className="border-border/50 bg-card/50 backdrop-blur overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary to-accent"></div>
            <CardContent className="pt-0">
              <div className="flex flex-col sm:flex-row gap-4 -mt-16 mb-4">
                <div className="relative">
                  <Avatar
                    onClick={onAvatarClick}
                    className="w-32 h-32 border-4 border-background cursor-pointer"
                    title="Click to change photo"
                  >
                  {user.profileImage ? (
                    // AvatarImage from ui/avatar is not directly imported; use an img fallback
                    <img src={user.profileImage} alt={user.name} className="object-cover w-full h-full rounded-full" />
                  ) : (
                    <AvatarFallback className="text-lg">{user.name.charAt(0)}</AvatarFallback>
                  )}
                  </Avatar>
                </div>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="username">Username (vanity URL)</Label>
                      <Input id="username" name="username" value={(formData as any).username} onChange={handleChange} placeholder="e.g. priyesh" />
                      <p className="text-xs text-muted-foreground mt-1">Your public profile: /u/{(formData as any).username || 'username'}</p>
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input id="website" name="website" value={(formData as any).website} onChange={handleChange} placeholder="https://..." />
                    </div>
                    <div>
                      <Label htmlFor="github">GitHub</Label>
                      <Input id="github" name="github" value={(formData as any).github} onChange={handleChange} placeholder="github.com/username" />
                    </div>
                    <div>
                      <Label htmlFor="leetcode">LeetCode</Label>
                      <Input id="leetcode" name="leetcode" value={(formData as any).leetcode} onChange={handleChange} placeholder="leetcode.com/u/username" />
                    </div>
                    <div>
                      <Label htmlFor="codeforces">Codeforces</Label>
                      <Input id="codeforces" name="codeforces" value={(formData as any).codeforces} onChange={handleChange} placeholder="codeforces.com/profile/handle" />
                    </div>
                  </div>

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

                  {/* Featured projects selector */}
                  <div className="space-y-2">
                    <Label>Featured Projects</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-auto p-2 border rounded">
                      {myProjects.map((p:any)=> {
                        const checked = (formData as any).featuredProjectIds?.includes(p._id)
                        return (
                          <label key={p._id} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e)=> {
                                setFormData((prev:any)=>{
                                  const set = new Set(prev.featuredProjectIds || [])
                                  if (e.target.checked) set.add(p._id)
                                  else set.delete(p._id)
                                  return { ...prev, featuredProjectIds: Array.from(set) }
                                })
                              }}
                            />
                            <span className="truncate">{p.title}</span>
                          </label>
                        )
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground">Pick a few projects to feature on your public profile.</p>
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
                  {(user.username || user.socials) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {user.username && (
                        <div>
                          <p className="text-sm text-muted-foreground">Public Link</p>
                          <p className="font-medium">/u/{user.username}</p>
                        </div>
                      )}
                      {user.socials?.website && (
                        <div>
                          <p className="text-sm text-muted-foreground">Website</p>
                          <a href={user.socials.website} className="text-primary hover:underline" target="_blank">{user.socials.website}</a>
                        </div>
                      )}
                      {user.socials?.github && (
                        <div>
                          <p className="text-sm text-muted-foreground">GitHub</p>
                          <a href={`https://${user.socials.github.replace(/^https?:\/\//,'')}`} className="text-primary hover:underline" target="_blank">{user.socials.github}</a>
                        </div>
                      )}
                      {user.socials?.leetcode && (
                        <div>
                          <p className="text-sm text-muted-foreground">LeetCode</p>
                          <a href={`https://${user.socials.leetcode.replace(/^https?:\/\//,'')}`} className="text-primary hover:underline" target="_blank">{user.socials.leetcode}</a>
                        </div>
                      )}
                      {user.socials?.codeforces && (
                        <div>
                          <p className="text-sm text-muted-foreground">Codeforces</p>
                          <a href={`https://${user.socials.codeforces.replace(/^https?:\/\//,'')}`} className="text-primary hover:underline" target="_blank">{user.socials.codeforces}</a>
                        </div>
                      )}
                    </div>
                  )}
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
