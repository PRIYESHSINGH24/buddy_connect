"use client"

import React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const isDark = theme === "dark" || (theme === "system" && typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const toggle = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <div className="fixed right-4 bottom-4 z-50">
      <Button size="icon" variant="default" onClick={toggle} aria-label="Toggle theme">
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </Button>
    </div>
  )
}
