import React, { Suspense } from "react"
import LoginForm from "@/components/auth/login-form"
import { Spinner } from "@/components/ui/spinner"
import BeautifulLoader from "@/components/ui/beautiful-loader"
import Link from "next/link"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-linear-to-br from-primary/5 via-background to-accent/5 flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border/50 backdrop-blur-sm">
        <Link href="/" className="inline-flex items-center" aria-label="Buddy Connect home">
          <img src="/buddy-logo.svg" alt="Buddy Connect" className="w-14 h-14 object-contain" />
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
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
    </main>
  )
}
