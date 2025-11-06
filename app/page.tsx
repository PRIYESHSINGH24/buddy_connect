import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border/50 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Buddy Connect" width={40} height={40} />
          <h1 className="text-xl font-bold text-foreground">Buddy Connect</h1>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/signup">
            <Button>Sign Up</Button>
          </Link>
        </div>
      </nav>

      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-5xl md:text-6xl font-bold text-balance leading-tight">
            Your College Network{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Starts Here</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Connect with peers, share projects, collaborate on hackathons, and discover college events - all in one
            place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-base px-8">
                Get Started
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-base px-8 bg-transparent">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 container mx-auto px-6 py-16">
        {[
          { title: "Share Posts", desc: "Connect with your college community" },
          { title: "Showcase Projects", desc: "Share your GitHub projects and innovations" },
          { title: "Find Hackathon Teams", desc: "AI-powered team matching for hackathons" },
          { title: "Discover Events", desc: "Stay updated on college activities" },
          { title: "Build Your Profile", desc: "LinkedIn-powered profile creation" },
          { title: "Network", desc: "Connect with students and industry" },
        ].map((item, i) => (
          <div
            key={i}
            className="p-6 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition"
          >
            <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
