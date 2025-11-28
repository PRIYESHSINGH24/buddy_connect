"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, SquareStack, Zap, MessageCircle, User } from "lucide-react"

export default function BottomNav() {
  const pathname = usePathname()

  const Item = ({ href, label, icon: Icon }: { href: string; label: string; icon: any }) => {
    const active = pathname === href
    return (
      <Link
        href={href}
        className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 px-1 ${
          active ? "text-primary" : "text-muted-foreground"
        }`}
        aria-current={active ? "page" : undefined}
      >
        <Icon className="w-5 h-5" />
        <span className="text-[10px] leading-tight text-center truncate">{label}</span>
      </Link>
    )
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/60 md:hidden">
      <div className="mx-auto w-full grid grid-cols-5 gap-0">
        <Item href="/dashboard" label="Feed" icon={Home} />
        <Item href="/projects" label="Projects" icon={SquareStack} />
        <Item href="/hackathon" label="Hackathon" icon={Zap} />
        <button
          onClick={() => window.dispatchEvent(new Event("toggleMessages"))}
          className="flex flex-col items-center justify-center gap-1 flex-1 py-2 px-1 text-muted-foreground"
          aria-label="Messages"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-[10px] leading-tight text-center truncate">Messages</span>
        </button>
        <Item href="/profile" label="Profile" icon={User} />
      </div>
    </nav>
  )
}
