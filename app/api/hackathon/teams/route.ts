import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Get all hackathon teams
export async function GET() {
  try {
    const db = await getDatabase()
    const teams = await db
      .collection("hackathon_teams")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "members",
            foreignField: "_id",
            as: "memberDetails",
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray()

    return NextResponse.json({ teams }, { status: 200 })
  } catch (error) {
    console.error("Get teams error:", error)
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 })
  }
}

// Create hackathon team
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, teamLead, memberIds, skills, idea } = body

    if (!name || !teamLead || !memberIds || memberIds.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()
    const result = await db.collection("hackathon_teams").insertOne({
      name,
      teamLead: new ObjectId(teamLead),
      members: memberIds.map((id: string) => new ObjectId(id)),
      skills: skills || [],
      idea,
      createdAt: new Date(),
    })

    return NextResponse.json({ message: "Team created successfully", teamId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Create team error:", error)
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 })
  }
}
