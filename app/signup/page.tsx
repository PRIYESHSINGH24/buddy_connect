import SignupForm from "@/components/auth/signup-form"
import Link from "next/link"
import Image from "next/image"

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border/50 backdrop-blur-sm">
        <Link href="/" className="inline-flex items-center" aria-label="Buddy Connect home">
          <Image src="/newlogo.png" alt="Buddy Connect" width={56} height={56} priority />
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <SignupForm />
        </div>
      </div>
    </main>
  )
}
