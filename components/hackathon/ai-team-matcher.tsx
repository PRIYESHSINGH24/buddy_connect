"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"

interface TeamMember {
  _id: string
  name: string
  skills: string[]
  department: string
  year: string
  reason: string
}

interface AITeamMatcherProps {
  userId: string
  userName: string
  userSkills: string[]
}

export default function AITeamMatcher({ userId, userName, userSkills }: AITeamMatcherProps) {
  const [loading, setLoading] = useState(false)
  const [matchedTeam, setMatchedTeam] = useState<TeamMember[]>([])
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    skills: userSkills.join(", "),
    interests: "",
    preferredRole: "",
    teamSize: "4",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleMatch = async () => {
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/hackathon/match-teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          skills: formData.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          interests: formData.interests
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean),
          preferredRole: formData.preferredRole,
          teamSize: Number.parseInt(formData.teamSize),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to match teams")
        return
      }

      setMatchedTeam(data.teamMembers)
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle>AI Team Matcher</CardTitle>
        <CardDescription>Find the perfect team members for your hackathon journey</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skills">Your Skills (comma-separated)</Label>
            <Input
              id="skills"
              name="skills"
              placeholder="React, Python, Machine Learning"
              value={formData.skills}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interests">Interests (comma-separated)</Label>
            <Input
              id="interests"
              name="interests"
              placeholder="AI, Web Dev, Mobile Apps"
              value={formData.interests}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Preferred Role</Label>
              <Select
                value={formData.preferredRole}
                onValueChange={(value) => handleSelectChange("preferredRole", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="frontend">Frontend Developer</SelectItem>
                  <SelectItem value="backend">Backend Developer</SelectItem>
                  <SelectItem value="fullstack">Full Stack Developer</SelectItem>
                  <SelectItem value="designer">UI/UX Designer</SelectItem>
                  <SelectItem value="ml">ML Engineer</SelectItem>
                  <SelectItem value="devops">DevOps/Infrastructure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamSize">Team Size</Label>
              <Select value={formData.teamSize} onValueChange={(value) => handleSelectChange("teamSize", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 members</SelectItem>
                  <SelectItem value="3">3 members</SelectItem>
                  <SelectItem value="4">4 members</SelectItem>
                  <SelectItem value="5">5 members</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleMatch} disabled={loading} className="w-full" size="lg">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Finding Perfect Team...
              </>
            ) : (
              "Find Team Members with AI"
            )}
          </Button>
        </div>

        {matchedTeam.length > 0 && (
          <div className="border-t border-border/50 pt-6 space-y-4">
            <h3 className="font-semibold text-lg">Your Matched Team</h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/30">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">You (Team Lead)</p>
                </div>
              </div>

              {matchedTeam.map((member) => (
                <div
                  key={member._id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/30 transition"
                >
                  <Avatar className="w-10 h-10 mt-1">
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.year}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{member.department}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {member.skills.slice(0, 2).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {member.skills.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{member.skills.length - 2}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-foreground italic">"{member.reason}"</p>
                  </div>
                </div>
              ))}
            </div>

            <Button className="w-full bg-transparent" variant="outline">
              Create Team
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
