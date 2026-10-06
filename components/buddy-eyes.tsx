// Buddy Connect — cursor-tracking brand mark.
// Two pupils follow the pointer; occasional blink. Pure SVG + CSS, no assets,
// so it can never 404 like the old /buddy-logo.svg <img>.
"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface BuddyEyesProps {
  href?: string | null
  showLabel?: boolean
  size?: number
  className?: string
}

export default function BuddyEyes({ href = "/dashboard", showLabel = true, size = 44, className }: BuddyEyesProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const leftPupil = useRef<SVGCircleElement>(null)
  const rightPupil = useRef<SVGCircleElement>(null)
  const eyesRef = useRef<SVGGElement>(null)

  useEffect(() => {
    const MAX = 5 // px pupils can travel from center
    const onMove = (e: PointerEvent) => {
      const box = wrapRef.current?.getBoundingClientRect()
      if (!box) return
      // vector from logo center -> cursor, clamped to a radius
      const cx = box.left + box.width / 2
      const cy = box.top + box.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const len = Math.hypot(dx, dy) || 1
      const r = Math.min(len / 60, 1) * MAX
      const ox = (dx / len) * r
      const oy = (dy / len) * r
      leftPupil.current?.setAttribute("transform", `translate(${ox} ${oy})`)
      rightPupil.current?.setAttribute("transform", `translate(${ox} ${oy})`)
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => window.removeEventListener("pointermove", onMove)
  }, [])

  const mark = (
    <div ref={wrapRef} className={cn("flex items-center gap-3", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        role="img"
        aria-label="Buddy Connect logo — two eyes following your cursor"
        className="rounded-2xl shadow-lg shadow-primary/30"
      >
        <defs>
          <linearGradient id="buddy-eyes-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="64" height="64" rx="14" fill="url(#buddy-eyes-bg)" />
        {/* face */}
        <circle cx="32" cy="34" r="20" fill="rgba(255,255,255,0.95)" />
        {/* eye whites */}
        <g ref={eyesRef} className="buddy-blink">
          <circle cx="24.5" cy="32" r="6.5" fill="#fff" stroke="#6366f1" strokeWidth="1.5" />
          <circle cx="39.5" cy="32" r="6.5" fill="#fff" stroke="#6366f1" strokeWidth="1.5" />
          {/* pupils (move with cursor) */}
          <circle ref={leftPupil} cx="24.5" cy="32" r="3" fill="#1e1b4b" />
          <circle ref={rightPupil} cx="39.5" cy="32" r="3" fill="#1e1b4b" />
          <circle cx="25.5" cy="31" r="1" fill="#fff" opacity="0.9" />
          <circle cx="40.5" cy="31" r="1" fill="#fff" opacity="0.9" />
        </g>
        {/* smile */}
        <path d="M24 42 Q32 48 40 42" stroke="#6366f1" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <style>{`.buddy-blink{transform-origin:32px 32px;animation:buddy-blink 5s infinite}@keyframes buddy-blink{0%,93%,100%{transform:scaleY(1)}95%,97%{transform:scaleY(0.08)}}`}</style>
      </svg>
      {showLabel && (
        <div className="leading-tight">
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">buddy</p>
          <p className="text-lg font-bold text-transparent bg-clip-text bg-linear-to-r from-primary via-accent to-primary">connect</p>
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center" aria-label="Buddy Connect home">
        {mark}
      </Link>
    )
  }
  return mark
}
