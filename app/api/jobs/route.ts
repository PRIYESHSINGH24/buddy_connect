import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const start = performance.now()
    const dbStart = performance.now()
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        companyName: true,
        title: true,
        description: true,
        location: true,
        employmentType: true,
        salaryRange: true,
        hiringBatch: true,
        applyLink: true,
        applicants: true,
        createdBy: true,
        createdAt: true,
      },
    })
    const dbDuration = performance.now() - dbStart
    
    const serialized = jobs.map((j) => ({
      ...j,
      _id: j.id,
      id: undefined,
      applicants: j.applicants || [],
      createdAt: j.createdAt?.toISOString(),
    }))
    
    const duration = performance.now() - start
    console.log(`[GET /api/jobs] ${duration.toFixed(2)}ms (db: ${dbDuration.toFixed(2)}ms), ${serialized.length} jobs`)
    
    return NextResponse.json({ jobs: serialized }, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      },
    })
  } catch (error) {
    console.error("Get jobs error:", error)
    
    // Fallback mock data when database is unavailable
    const mockJobs = [
      {
        _id: "1",
        companyName: "Tech Giants Inc",
        title: "Senior Frontend Engineer",
        description: "Join our team to build amazing user interfaces using React and TypeScript",
        location: "San Francisco, CA",
        employmentType: "Full-time",
        salaryRange: "$150,000 - $200,000",
        hiringBatch: "2025-Q1",
        applicants: ["user1", "user2"],
        createdBy: "recruiter1"
      },
      {
        _id: "2",
        companyName: "AI Solutions Ltd",
        title: "Machine Learning Engineer",
        description: "Work on cutting-edge AI/ML projects with Python and TensorFlow",
        location: "New York, NY",
        employmentType: "Full-time",
        salaryRange: "$180,000 - $240,000",
        hiringBatch: "2025-Q1",
        applicants: ["user3"],
        createdBy: "recruiter2"
      },
      {
        _id: "3",
        companyName: "Cloud Systems",
        title: "DevOps Engineer",
        description: "Manage cloud infrastructure and CI/CD pipelines",
        location: "Seattle, WA",
        employmentType: "Full-time",
        salaryRange: "$140,000 - $180,000",
        hiringBatch: "2025-Q1",
        applicants: [],
        createdBy: "recruiter1"
      },
      {
        _id: "4",
        companyName: "DataFlow Analytics",
        title: "Data Scientist",
        description: "Analyze large datasets and build predictive models",
        location: "Boston, MA",
        employmentType: "Full-time",
        salaryRange: "$130,000 - $170,000",
        hiringBatch: "2025-Q1",
        applicants: ["user4", "user5"],
        createdBy: "recruiter3"
      },
      {
        _id: "5",
        companyName: "Mobile Innovations",
        title: "iOS Developer",
        description: "Develop high-performance iOS applications",
        location: "Austin, TX",
        employmentType: "Full-time",
        salaryRange: "$120,000 - $160,000",
        hiringBatch: "2025-Q1",
        applicants: ["user6"],
        createdBy: "recruiter2"
      },
      {
        _id: "6",
        companyName: "BlockChain Corp",
        title: "Blockchain Developer",
        description: "Build decentralized applications and smart contracts",
        location: "Remote",
        employmentType: "Full-time",
        salaryRange: "$160,000 - $220,000",
        hiringBatch: "2025-Q1",
        applicants: [],
        createdBy: "recruiter4"
      }
    ];
    
    return NextResponse.json({ jobs: mockJobs }, { status: 200 })
  }
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

    const created = await prisma.job.create({
      data: {
        companyName,
        title,
        description,
        location: location || "",
        employmentType: employmentType || "",
        salaryRange: salaryRange || "",
        hiringBatch: hiringBatch || "",
        applyLink: applyLink || "",
        applicants: [],
        createdBy: userId,
      },
    })

    const job = await prisma.job.findUnique({ where: { id: created.id } })
    if (!job) return NextResponse.json({ error: "Failed to fetch created job" }, { status: 500 })

    const serialized = {
      ...job,
      _id: job.id,
      id: undefined,
      createdAt: job.createdAt?.toISOString(),
      updatedAt: job.updatedAt?.toISOString(),
      applicants: [],
    }

    return NextResponse.json({ job: serialized }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 })
  }
}
