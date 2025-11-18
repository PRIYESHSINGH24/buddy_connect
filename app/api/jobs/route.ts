import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")

async function verifyAuth(request: Request) {
  try {
    // NextRequest cookies not available here so read from headers cookie
    const cookie = request.headers.get("cookie") || ""
    const match = cookie.match(/auth_token=([^;]+)/)
    const token = match ? match[1] : null
    if (!token) return null
    const decoded = await jwtVerify(token, JWT_SECRET)
    return decoded.payload.userId as string
  } catch (err) {
    return null
  }
}

export async function GET(request: Request) {
  const db = await getDatabase()
  const jobs = await db.collection("jobs").find({}).sort({ createdAt: -1 }).toArray()
  const serialized = jobs.map((j: any) => ({
    ...j,
    _id: j._id.toString(),
    companyId: j.companyId?.toString(),
    applicants: (j.applicants || []).map((a: any) => a.toString()),
    createdAt: j.createdAt?.toISOString(),
    updatedAt: j.updatedAt?.toISOString(),
  }))
  return NextResponse.json({ jobs: serialized })
}

export async function POST(request: Request) {
  const userId = await verifyAuth(request)
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  try {
    const body = await request.json()
    const { companyName, title, description, location, employmentType, salaryRange, hiringBatch, applyLink } = body
    if (!companyName || !title || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()
    const now = new Date()
    const result = await db.collection("jobs").insertOne({
      companyName,
      title,
      description,
      location: location || "",
      employmentType: employmentType || "",
      salaryRange: salaryRange || "",
      hiringBatch: hiringBatch || "",
      applyLink: applyLink || "",
      applicants: [],
      createdBy: new (require("mongodb").ObjectId)(userId),
      createdAt: now,
      updatedAt: now,
    })

    const job = await db.collection("jobs").findOne({ _id: result.insertedId })
    const serialized = {
      ...job,
      _id: job._id.toString(),
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
      applicants: [],
    }

    return NextResponse.json({ job: serialized }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 })
  }
}
