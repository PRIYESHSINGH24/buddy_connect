import { type NextRequest, NextResponse } from "next/server"
import { createUser, getUserByEmail } from "@/lib/auth-utils"
import type { User } from "@/lib/db-schemas"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, college, department, year } = body

    // Validate input
    if (!email || !password || !name || !college || !department || !year) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Create new user
    const userId = await createUser({
      email: email.toLowerCase(),
      password,
      name,
      college,
      department,
      year,
      skills: [],
      bio: "",
      interests: [],
    } as Omit<User, "_id" | "createdAt" | "updatedAt">)

    return NextResponse.json({ message: "User created successfully", userId }, { status: 201 })
  } catch (error) {
    console.error("Signup error:", error)

    // If the error is due to missing MONGODB_URI, return a helpful message to the developer
    if (error instanceof Error && error.message.includes("MONGODB_URI")) {
      return NextResponse.json(
        {
          error:
            "Server misconfiguration: MONGODB_URI is not set. Create a .env.local file (see .env.local.example) or set the environment variable in your deployment provider.",
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
