import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Sparkles, Users, Code2, Rocket } from "lucide-react"
import BrandMark from "@/components/brand-mark"
import StatsBar from "@/components/home/stats-bar"

export default function Home() {
  const highlights = [
    { icon: Sparkles, title: "AI Matches", desc: "Smart team recommendations" },
    { icon: Users, title: "Community", desc: "Clubs, events, and peers" },
    { icon: Code2, title: "Projects", desc: "Showcase and collaborate" },
    { icon: Rocket, title: "Opportunities", desc: "Internships & hackathons" },
  ]

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-32 -right-16 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 left-[-10%] h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
      </div>
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border/50 backdrop-blur-sm">
        <BrandMark href="/" showLabel={false} />
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/signup">
            <Button>Sign Up</Button>
          </Link>
        </div>
      </nav>

      <section className="container mx-auto px-6 pt-16 pb-12 grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-6 relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-1 text-sm text-muted-foreground bg-background/70 backdrop-blur">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>New: AI team matching now live</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight text-balance">
            Build your campus {" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-accent to-primary">
              super network
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Showcase your work, join hackathons, discover events, and connect with ambitious builders across your college — all in one beautifully crafted space.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/signup">
              <Button size="lg" className="px-8">Join Buddy Connect</Button>
            </Link>
          </div>
          <div className="pt-4 border-t border-border/40">
            <StatsBar />
          </div>
        </div>
        <div className="relative">
          <div className="rounded-3xl border border-border/40 bg-card/80 backdrop-blur shadow-2xl p-6 space-y-4">
            <div className="h-6 w-32 rounded-full bg-primary/20" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/15" />
                  <div className="flex-1">
                    <div className="h-3 w-3/4 rounded-full bg-border/70" />
                    <div className="h-3 w-2/4 rounded-full bg-border/40 mt-1" />
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-border/50 bg-background/60 p-4">
              <p className="text-sm text-muted-foreground">“Found my entire hackathon team here. We still ship side projects together!”</p>
              <p className="text-xs text-right mt-2 text-primary">— Riya, IIIT Hyderabad</p>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-4 rounded-xl border border-border/60 bg-background/80 px-4 py-3 shadow-lg">
            <p className="text-sm font-medium">Live collab rooms</p>
            <p className="text-xs text-muted-foreground">Spin up breakout spaces in seconds</p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {highlights.map((item) => (
          <div
            key={item.title}
            className="p-5 rounded-2xl border border-border/50 bg-card/70 backdrop-blur hover:border-primary/50 transition flex flex-col gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center">
              <item.icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-foreground">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
