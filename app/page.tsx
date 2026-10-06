import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MessageCircle, Search, Briefcase, Users, Calendar } from "lucide-react"
import BrandMark from "@/components/brand-mark"

export default function Home() {
  const features = [
    { title: "Jobs", desc: "Find internships and full-time roles at top companies", href: "/jobs", icon: Briefcase },
    { title: "Events", desc: "Join hackathons, workshops, and networking sessions", href: "/events", icon: Calendar },
    { title: "Projects", desc: "Showcase your work and collaborate with peers", href: "/projects", icon: Users },
    { title: "Messages", desc: "Connect directly with alumni and recruiters", href: "/messages", icon: MessageCircle },
  ]

  return (
    <main className="min-h-screen bg-white text-black antialiased">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-white/95 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-8">
            <BrandMark href="/" showLabel={false} />
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-foreground/80">
              <a href="/jobs" className="hover:text-primary transition-colors">Jobs</a>
              <a href="/events" className="hover:text-primary transition-colors">Events</a>
              <a href="/projects" className="hover:text-primary transition-colors">Projects</a>
              <a href="/hackathon" className="hover:text-primary transition-colors">Hackathon</a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="Search" className="w-64 pl-10 pr-4 py-2 rounded-md border border-border/40 bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all" />
              </div>
            </div>
            <Link href="/login">
              <Button variant="outline" size="sm" className="border-border/40 bg-background/50 text-sm">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm px-4">Join now</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="px-4 md:px-8 py-10 md:py-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/40 px-4 py-1.5 text-xs font-medium text-muted-foreground bg-muted/30 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />New: AI team matching now live
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
            Connect with your{" "}
            <span className="text-primary">college</span> community
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Showcase your work, join hackathons, discover events, and connect with ambitious builders across your campus.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">Join now</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-border/40 bg-background text-foreground">Sign in</Button>
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm">
            {[
              { value: "15+", label: "Active students" },
              { value: "3", label: "Active hackathons" },
              { value: "12+", label: "Open projects" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-lg font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="px-4 md:px-8 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Everything you need to grow</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">One place to discover opportunities, build your portfolio, and connect with your campus community.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature) => (
              <Link key={feature.title} href={feature.href} className="rounded-lg border border-border/40 bg-card/50 p-5 hover:border-primary/50 transition-all">
                <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 md:px-8 pb-16">
        <div className="max-w-4xl mx-auto rounded-xl border border-primary/20 bg-muted/10 p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Ready to build your campus network?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">Join thousands of students already using Buddy Connect to find opportunities, collaborate on projects, and grow together.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">Get started — it's free</Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline" className="border-border/40 bg-background text-foreground">Talk to us</Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="px-4 md:px-8 py-8 border-t border-border/30">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <BrandMark href="/" showLabel={false} className="[&_svg]:w-5 [&_svg]:h-5" />
            <span className="font-medium">Buddy Connect</span>
          </div>
          <div className="flex gap-6">
            <a href="/privacy" className="hover:text-primary transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-primary transition-colors">Terms</a>
            <a href="/contact" className="hover:text-primary transition-colors">Contact</a>
          </div>
          <span>&copy; 2026 Buddy Connect. All rights reserved.</span>
        </div>
      </footer>
    </main>
  )
}
