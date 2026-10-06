import React, { Suspense } from "react"
import LoginForm from "@/components/auth/login-form"
import BeautifulLoader from "@/components/ui/beautiful-loader"
import BuddyEyes from "@/components/buddy-eyes"
import Link from "next/link"
import { Sparkles, Users, Code2, Rocket } from "lucide-react"

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col lg:flex-row">
      {/* Left — Branding Panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-accent items-center justify-center animate-gradient">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-56 h-56 rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-40 h-40 rounded-full bg-white/5 blur-2xl animate-float" />

        <div className="relative z-10 max-w-md px-12 text-white space-y-8 page-enter">
          <Link href="/" className="inline-flex items-center gap-3">
            <BuddyEyes href={null} showLabel={false} size={56} />
            <span className="text-2xl font-bold tracking-tight">Buddy Connect</span>
          </Link>

          <h1 className="text-4xl font-extrabold leading-tight">
            Your campus{" "}
            <span className="text-white/80">super network</span>,{" "}
            reimagined.
          </h1>
          <p className="text-white/70 text-lg leading-relaxed">
            Showcase projects, discover hackathons, join events, and connect with ambitious builders — all in one beautifully crafted space.
          </p>

          {/* Feature pills */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            {[
              { icon: Sparkles, label: "AI Matches" },
              { icon: Users, label: "Community" },
              { icon: Code2, label: "Projects" },
              { icon: Rocket, label: "Opportunities" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 rounded-lg bg-white/10 backdrop-blur px-3 py-2.5 text-sm font-medium">
                <item.icon className="w-4 h-4" />
                {item.label}
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-white/15">
            <p className="text-sm text-white/50 italic">
              "Found my entire hackathon team here. We still ship side projects together!"
            </p>
            <p className="text-xs text-white/40 mt-1">— Riya, IIIT Hyderabad</p>
          </div>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-primary/5 via-background to-accent/5">
        {/* Mobile branding header */}
        <div className="lg:hidden flex items-center gap-3 px-6 pt-6 pb-2 animate-fade-in">
          <BuddyEyes href={null} showLabel={false} size={40} />
          <span className="text-lg font-bold text-foreground">Buddy Connect</span>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md animate-scale-in">
            <Suspense
              fallback={
                <div className="w-full max-w-md flex items-center justify-center p-6">
                  <BeautifulLoader message="Preparing login" />
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  )
}
