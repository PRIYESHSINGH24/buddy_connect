"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

interface LinkedInImportDialogProps {
  userId: string
  onProfileImported: () => void
}

export default function LinkedInImportDialog({ userId, onProfileImported }: LinkedInImportDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [linkedinUrl, setLinkedInUrl] = useState("")
  const [error, setError] = useState("")

  const handleImport = async () => {
    if (!linkedinUrl.trim()) {
      setError("Please enter your LinkedIn profile URL")
      return
    }

    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/profile/import-linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          linkedinUrl,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to import profile")
        return
      }

      setLinkedInUrl("")
      setOpen(false)
      onProfileImported()
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Import from LinkedIn</Button>
      </DialogTrigger>
      <DialogContent className="border-border/50 bg-background/95 backdrop-blur">
        <DialogHeader>
          <DialogTitle>Import LinkedIn Profile</DialogTitle>
          <DialogDescription>Enhance your Buddy Connect profile with your LinkedIn data</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="linkedinUrl">LinkedIn Profile URL</Label>
            <Input
              id="linkedinUrl"
              type="url"
              placeholder="https://linkedin.com/in/yourprofile"
              value={linkedinUrl}
              onChange={(e) => setLinkedInUrl(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              We'll import your name, skills, and professional information
            </p>
          </div>

          <Button onClick={handleImport} disabled={loading || !linkedinUrl.trim()} className="w-full">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              "Import Profile"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
