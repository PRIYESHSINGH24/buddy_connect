"use client"

import React, { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Avoid hydration mismatch by deferring theme detection until mounted
  const effectiveTheme = mounted
    ? (theme === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme)
    : undefined

  const isDark = effectiveTheme === 'dark'

  const toggle = () => {
    if (!mounted) return
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <div className="fixed right-4 bottom-20 md:bottom-4 z-50" aria-hidden={!mounted}>
      <Button
        size="icon"
        variant="default"
        onClick={toggle}
        aria-label="Toggle theme"
        // Prevent interaction before mount
        disabled={!mounted}
      >
        {!mounted ? (
          // Placeholder circle to keep layout stable during SSR
          <div className="w-4 h-4 rounded-full bg-muted animate-pulse" />
        ) : isDark ? (
          <Sun className="w-4 h-4" />
        ) : (
          <Moon className="w-4 h-4" />
        )}
      </Button>
    </div>
  )
}
