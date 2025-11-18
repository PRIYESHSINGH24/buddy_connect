"use client"

import React from "react"

export default function BeautifulLoader({ message = "Loading" }: { message?: string }) {
  return (
    <div className="min-h-[240px] w-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <path d="M12 2L15.5 8.5H8.5L12 2Z" fill="currentColor" />
            </svg>
          </div>
          <div className="text-left">
            <div className="text-lg font-semibold">{message}...</div>
            <div className="text-sm text-muted-foreground">Hang tight — we're getting things ready.</div>
          </div>
        </div>

        <div className="flex items-end gap-2">
          <span
            className="w-3 h-3 bg-primary rounded-full"
            style={{ animation: "bounce 0.9s infinite", animationDelay: "0s" }}
          />
          <span
            className="w-3 h-3 bg-primary rounded-full"
            style={{ animation: "bounce 0.9s infinite", animationDelay: "0.15s" }}
          />
          <span
            className="w-3 h-3 bg-primary rounded-full"
            style={{ animation: "bounce 0.9s infinite", animationDelay: "0.3s" }}
          />
        </div>

        <div className="w-[340px]">
          <div className="h-3 bg-muted/60 rounded-full mb-2 animate-pulse" />
          <div className="h-3 bg-muted/50 rounded-full mb-2 animate-pulse" />
          <div className="h-3 bg-muted/40 rounded-full animate-pulse" />
        </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.6 }
          40% { transform: translateY(-8px); opacity: 1 }
        }
      `}</style>
      </div>
    </div>
  )
}
