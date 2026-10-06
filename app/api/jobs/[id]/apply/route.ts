import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"
import { getUserById } from "@/lib/auth-utils"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await verifyAuth(request)
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  try {
    const { id: jobId } = await params

    const job = await prisma.job.findUnique({ where: { id: jobId } })
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 })

    // Conditional update (append only if missing) is atomic at the SQL level —
    // parallel applies from different users can't duplicate or lose entries.
    // applicant lookup runs in parallel with the update.
    const [updatedJob, applicant] = await Promise.all([
      prisma.job
        .update({
          where: { id: jobId, NOT: { applicants: { has: userId } } },
          data: { applicants: { push: userId } },
        })
        .catch(async (e: { code?: string }) => {
          // P2025: already applied (or job deleted) — return current state
          if (e?.code === "P2025") return prisma.job.findUnique({ where: { id: jobId } })
          throw e
        }),
      getUserById(userId),
    ])
    if (!updatedJob) return NextResponse.json({ error: "Job not found" }, { status: 404 })

    // Create a notification for the job creator
    try {
      const applicantName = applicant?.name || "Someone"
      const message = `${applicantName} applied to your job "${job.title}"`
      await prisma.notification.create({
        data: {
          recipient: job.createdBy,
          sender: userId,
          type: "job_application",
          message,
          jobId,
          read: false,
        },
      })
    } catch (notifErr) {
      console.error("Failed to create notification:", notifErr)
    }

    const serialized = {
      ...updatedJob,
      _id: updatedJob.id,
      id: undefined,
      applicants: updatedJob.applicants || [],
      createdAt: updatedJob.createdAt?.toISOString(),
      updatedAt: updatedJob.updatedAt?.toISOString(),
    }

    return NextResponse.json({ job: serialized })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to apply" }, { status: 500 })
  }
}
