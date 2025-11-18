import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { jwtVerify } from "jose"
import { getUserById } from "@/lib/auth-utils"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")

async function verifyAuth(request: Request) {
  try {
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

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const userId = await verifyAuth(request)
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  try {
    const db = await getDatabase()
    const jobId = params.id
    const applicantId = new (require("mongodb").ObjectId)(userId)

    // Add applicant if not present
    await db.collection("jobs").updateOne({ _id: new (require("mongodb").ObjectId)(jobId) }, { $addToSet: { applicants: applicantId } })

    const job = await db.collection("jobs").findOne({ _id: new (require("mongodb").ObjectId)(jobId) })
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 })

    // Create a notification for the job creator
    try {
      const applicant = await getUserById(userId)
      const applicantName = applicant?.name || "Someone"
      const message = `${applicantName} applied to your job "${job.title}"`
      await db.collection("notifications").insertOne({
        recipient: job.createdBy,
        sender: new (require("mongodb").ObjectId)(userId),
        type: "job_application",
        message,
        jobId: new (require("mongodb").ObjectId)(jobId),
        read: false,
        createdAt: new Date(),
      })
    } catch (notifErr) {
      console.error("Failed to create notification:", notifErr)
    }

    const updatedJob = await db.collection("jobs").findOne({ _id: new (require("mongodb").ObjectId)(jobId) })
    const serialized = {
      ...updatedJob,
      _id: updatedJob._id.toString(),
      applicants: (updatedJob.applicants || []).map((a: any) => a.toString()),
      createdAt: updatedJob.createdAt?.toISOString(),
      updatedAt: updatedJob.updatedAt?.toISOString(),
    }

    return NextResponse.json({ job: serialized })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to apply" }, { status: 500 })
  }
}
