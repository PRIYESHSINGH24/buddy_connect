import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, skills, interests, preferredRole, teamSize = 4 } = body

    if (!userId || !skills || skills.length === 0) {
      return NextResponse.json({ error: "User ID and skills are required" }, { status: 400 })
    }

    const db = await getDatabase()

    // Get current user
    const currentUser = await db.collection("users").findOne({ _id: new ObjectId(userId) })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get other users for matching
    const otherUsers = await db
      .collection("users")
      .find({ _id: { $ne: new ObjectId(userId) } })
      .limit(50)
      .toArray()

    // Create AI prompt for team matching
    const prompt = `You are a hackathon team matching expert. Match the following user with the best team members from the available pool.

Current User:
- Name: ${currentUser.name}
- Skills: ${skills.join(", ")}
- Interests: ${interests?.join(", ") || "Not specified"}
- Preferred Role: ${preferredRole || "Flexible"}
- College: ${currentUser.college}

Available Users:
${otherUsers
  .map(
    (u, i) => `
${i + 1}. Name: ${u.name}
   Skills: ${u.skills?.join(", ") || "Not specified"}
   Interests: ${u.interests?.join(", ") || "Not specified"}
   Department: ${u.department}
   Year: ${u.year}
`,
  )
  .join("\n")}

Please select the best ${Math.min(teamSize - 1, otherUsers.length)} users to form a well-rounded hackathon team. 
Consider skill diversity, complementary expertise, and shared interests.

Return a JSON array with user names and a brief reason for each selection in this format:
[
  { "name": "User Name", "reason": "Why they'd be a good fit" },
  ...
]`

    const { text } = await generateText({
      model: "openai/gpt-4-turbo",
      prompt,
    })

    // Parse AI response
    let matchedUsers: Array<{ name: string; reason: string }> = []
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        matchedUsers = JSON.parse(jsonMatch[0])
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
    }

    // Enrich matched users with full user data
    const enrichedMatches = matchedUsers
      .map((match) => {
        const userMatch = otherUsers.find((u) => u.name.toLowerCase() === match.name.toLowerCase())
        return userMatch
          ? {
              _id: userMatch._id?.toString(),
              name: userMatch.name,
              email: userMatch.email,
              skills: userMatch.skills,
              department: userMatch.department,
              year: userMatch.year,
              reason: match.reason,
            }
          : null
      })
      .filter(Boolean)

    return NextResponse.json(
      {
        message: "Teams matched successfully",
        teamMembers: enrichedMatches,
        currentUser: {
          _id: currentUser._id?.toString(),
          name: currentUser.name,
          skills: currentUser.skills,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Team matching error:", error)
    return NextResponse.json({ error: "Failed to match teams" }, { status: 500 })
  }
}
