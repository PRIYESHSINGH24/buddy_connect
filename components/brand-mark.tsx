import BuddyEyes from "@/components/buddy-eyes"
import { cn } from "@/lib/utils"

interface BrandMarkProps {
  href?: string | null
  showLabel?: boolean
  className?: string
  useImage?: boolean
}

// Single source of truth for the brand mark — cursor-tracking eyes everywhere.
export default function BrandMark({ href = "/dashboard", showLabel = true, className }: BrandMarkProps) {
  return <BuddyEyes href={href} showLabel={showLabel} size={44} className={className} />
}
