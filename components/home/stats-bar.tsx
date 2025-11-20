"use client";
import { useEffect, useState } from "react";

type Stats = {
  users: number
  projects: number
  posts: number
  events: number
  jobs: number
}

function useStats(pollMs = 15000) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      const r = await fetch("/api/stats", { cache: "no-store" })
      if (!r.ok) throw new Error("Failed to fetch stats")
      const data = await r.json()
      setStats(data)
      setError(null)
    } catch (e: any) {
      setError(e.message || "Failed to fetch stats")
    }
  }

  useEffect(() => {
    load()
    const id = setInterval(load, pollMs)
    return () => clearInterval(id)
  }, [pollMs])

  return { stats, error }
}

function format(n: number) {
  return new Intl.NumberFormat(undefined, { notation: "compact" }).format(n)
}

export default function StatsBar() {
  const { stats, error } = useStats()

  const items = [
    { label: "Users", value: stats?.users ?? 0 },
    { label: "Projects", value: stats?.projects ?? 0 },
    { label: "Posts", value: stats?.posts ?? 0 },
    { label: "Events", value: stats?.events ?? 0 },
    { label: "Jobs", value: stats?.jobs ?? 0 },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
      {items.map((it) => (
        <div key={it.label} className="rounded-lg border border-border/50 bg-card/60 p-4">
          <div className="text-xs text-muted-foreground">{it.label}</div>
          <div className="font-semibold text-lg">{format(it.value)}</div>
        </div>
      ))}
      {error && (
        <div className="col-span-full text-xs text-destructive">{error}</div>
      )}
    </div>
  )
}
