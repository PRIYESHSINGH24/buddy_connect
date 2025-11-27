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
  try {
    const start = performance.now()
    const db = await getDatabase()
    const dbStart = performance.now()
    const jobs = await db.collection("jobs").find({}, {
      projection: {
        companyName: 1,
        title: 1,
        description: 1,
        location: 1,
        employmentType: 1,
        salaryRange: 1,
        hiringBatch: 1,
        applyLink: 1,
        applicants: 1,
        createdBy: 1,
        createdAt: 1,
      },
    }).sort({ createdAt: -1 }).limit(100).toArray()
    const dbDuration = performance.now() - dbStart
    
    const serialized = jobs.map((j: any) => ({
      ...j,
      _id: j._id.toString(),
      companyId: j.companyId?.toString(),
      applicants: (j.applicants || []).map((a: any) => a.toString()),
      createdBy: j.createdBy?.toString(),
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
