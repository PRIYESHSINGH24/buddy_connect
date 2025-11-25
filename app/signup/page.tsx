import SignupForm from "@/components/auth/signup-form"

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-linear-to-br from-primary/5 via-background to-accent/5 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md group">
          <div className="transition-all duration-500 ease-out transform group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-primary/20">
            <SignupForm />
          </div>
        </div>
      </div>
    </main>
  )
}
