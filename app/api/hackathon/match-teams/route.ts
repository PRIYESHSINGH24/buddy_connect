import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { generateText } from "ai"
// Use Google's Generative SDK when available
import { TextGenerationClient } from "@google-ai/generativelanguage"

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

    // Try provider-specific call (Google Generative/Gemini API) when an API key is provided.
    let text = ""
    const apiKey = process.env.AI_GATEWAY_API_KEY
    if (apiKey) {
      const modelsToTry = [
        "models/gemini-pro-1",
        "models/gemini-1.5",
        "models/gemini-1.0",
        "models/text-bison-001",
      ]
      // Try SDK first (preferred). If SDK fails, fall back to REST attempts below.
      try {
        const client = new TextGenerationClient({ apiKey })
        for (const model of modelsToTry) {
          try {
            const response: any = await (client as any).generateText?.({
              model,
              prompt: { text: prompt },
              temperature: 0.2,
              maxOutputTokens: 512,
            })

            // SDK may return an array or object; try common shapes
            const candidate = (response?.candidates && response.candidates[0]) || (Array.isArray(response?.output) && response.output[0]) || response
            const content = candidate?.content || candidate?.text || candidate?.generatedText || (typeof candidate === 'string' ? candidate : undefined)
            if (content && content.toString().trim()) {
              text = content.toString()
              console.info('Generative SDK succeeded using model', model)
              break
            }
          } catch (sdkErr) {
            console.warn('Generative SDK call failed for model', model, sdkErr?.message || sdkErr)
            // try next model
          }
        }
      } catch (sdkInitErr) {
        console.warn('Generative SDK initialization failed, will fallback to REST fetch attempts', sdkInitErr?.message || sdkInitErr)
        // fall through to REST loop below
      }

      // If SDK didn't produce text, try REST endpoints for models (older fallback)
      if (!text) {
        for (const model of modelsToTry) {
          try {
            const url = `https://generativelanguage.googleapis.com/v1/${model}:generate?key=${apiKey}`
            const gRes = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt: { text: prompt }, temperature: 0.2, maxOutputTokens: 512 }),
            })

            const raw = await gRes.text()
            if (!gRes.ok) {
              console.warn("Generative API (model) returned non-OK status", { model, status: gRes.status, preview: raw?.slice?.(0, 800) })
              // try next model
              continue
            }

            // Try to parse JSON safely
            let gJson: any = null
            try {
              gJson = raw ? JSON.parse(raw) : null
            } catch (pe) {
              console.warn("Failed to parse JSON from Generative API response; using raw text", { model, parseError: pe, rawPreview: raw?.slice?.(0, 2000) })
              // if raw contains something useful, use it
              if (raw && raw.trim()) {
                text = raw
                break
              }
              continue
            }

            // Prefer typical response shapes
            if (gJson?.candidates && gJson.candidates.length > 0) {
              text = gJson.candidates[0].content || gJson.candidates[0].output || ""
            } else if (gJson?.output) {
              if (Array.isArray(gJson.output) && gJson.output.length > 0) text = gJson.output[0]?.content || ""
              else if (typeof gJson.output === "string") text = gJson.output
            } else if (typeof gJson?.generatedText === "string") {
              text = gJson.generatedText
            }

            if (text && text.trim()) {
              console.info("Generative API succeeded using model", model)
              break
            }
          } catch (e) {
            console.error("Error calling Generative API for model", model, e)
            // try next model
          }
        }
      }
    }

    // Fallback to Vercel AI SDK if provider call didn't return text
    if (!text) {
      try {
        const gen = await generateText({ model: "openai/gpt-4-turbo", prompt })
        // `generateText` may return `{ text }` or other shapes depending on provider
        text = (gen as any).text || (gen as any).output?.[0]?.content || ""
      } catch (genErr: any) {
        // Log the gateway/provider error details for local debugging (no secrets)
        console.error("Vercel AI Gateway call failed:", genErr?.message || genErr)
        if (genErr?.data?.error) console.error("Provider error:", JSON.stringify(genErr.data.error).slice(0, 1000))
        return NextResponse.json({ error: "AI provider error. Check server logs for details." }, { status: 502 })
      }
    }

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
