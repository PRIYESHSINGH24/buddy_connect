import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Get all hackathon teams
export async function GET() {
  try {
    const teams = await prisma.hackathonTeam.findMany({
      orderBy: { createdAt: "desc" },
    })

    // Resolve member details (equivalent of the old $lookup on users)
    const memberIds = Array.from(new Set(teams.flatMap((t) => t.members)))
    const users = memberIds.length
      ? await prisma.user.findMany({
          where: { id: { in: memberIds } },
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            department: true,
            year: true,
            skills: true,
            interests: true,
          },
        })
      : []
    const userMap = new Map(
      users.map((u) => [u.id, { ...u, _id: u.id, id: undefined }])
    )

    const serialized = teams.map((t) => ({
      ...t,
      _id: t.id,
      id: undefined,
      memberDetails: t.members.map((m) => userMap.get(m)).filter(Boolean),
    }))

    return NextResponse.json({ teams: serialized }, { status: 200 })
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

    const team = await prisma.hackathonTeam.create({
      data: {
        hackathonId: body.hackathonId || "",
        name,
        teamLead,
        members: memberIds.map((id: string) => String(id)),
        skills: skills || [],
        idea,
      },
    })

    return NextResponse.json({ message: "Team created successfully", teamId: team.id }, { status: 201 })
  } catch (error) {
    console.error("Create team error:", error)
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 })
  }
}
