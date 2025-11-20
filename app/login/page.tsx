import React, { Suspense } from "react"
import LoginForm from "@/components/auth/login-form"
import { Spinner } from "@/components/ui/spinner"
import BeautifulLoader from "@/components/ui/beautiful-loader"
import Link from "next/link"
import BrandMark from "@/components/brand-mark"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border/50 backdrop-blur-sm">
        <BrandMark href="/" />
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
