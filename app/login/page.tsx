import React, { Suspense } from "react"
import LoginForm from "@/components/auth/login-form"
import { Spinner } from "@/components/ui/spinner"
import BeautifulLoader from "@/components/ui/beautiful-loader"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-linear-to-br from-primary/5 via-background to-accent/5 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md group">
          <div className="transition-all duration-500 ease-out transform group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-primary/20">
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
