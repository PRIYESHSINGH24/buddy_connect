"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function CreateJobDialog({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<any>({
    companyName: "",
    title: "",
    description: "",
    location: "",
    employmentType: "",
    salaryRange: "",
    hiringBatch: "",
    applyLink: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((p: any) => ({ ...p, [e.target.name]: e.target.value }))
  }

  const handleCreate = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        console.error(await res.json())
        return
      }
      setOpen(false)
      if (onCreated) onCreated()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Create Job</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Job / Campus Drive</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Input name="companyName" placeholder="Company Name" value={form.companyName} onChange={handleChange} />
          <Input name="title" placeholder="Job Title" value={form.title} onChange={handleChange} />
          <Textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input name="location" placeholder="Location" value={form.location} onChange={handleChange} />
            <Input name="employmentType" placeholder="Employment Type (Full-time/Intern)" value={form.employmentType} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input name="salaryRange" placeholder="Salary Range" value={form.salaryRange} onChange={handleChange} />
            <Input name="hiringBatch" placeholder="Hiring Batch (e.g., 2026)" value={form.hiringBatch} onChange={handleChange} />
          </div>
          <Input name="applyLink" placeholder="External Apply Link (optional)" value={form.applyLink} onChange={handleChange} />

          <div className="flex justify-end">
            <Button onClick={handleCreate} disabled={loading || !form.companyName || !form.title || !form.description}>
              {loading ? "Creating..." : "Create Job"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
