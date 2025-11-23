import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface BrandMarkProps {
  href?: string
  showLabel?: boolean
  className?: string
  useImage?: boolean
}

export default function BrandMark({ href = "/dashboard", showLabel = true, className, useImage = true }: BrandMarkProps) {
  const mark = (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative">
        {useImage ? (
          <Image src="/buddy-logo.svg" alt="Buddy Connect" width={44} height={44} className="rounded-2xl" />
        ) : (
          <>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-primary via-purple-500 to-accent text-base font-semibold text-white shadow-lg shadow-primary/30">
              BC
            </span>
            <span className="pointer-events-none absolute inset-0 rounded-2xl border border-white/30" aria-hidden />
          </>
        )}
      </div>
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
      <Link href={href} className="inline-flex items-center">
        {mark}
      </Link>
    )
  }

  return mark
}
