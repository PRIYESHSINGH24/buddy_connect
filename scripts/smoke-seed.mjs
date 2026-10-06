import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

// One-off seed for local smoke testing (safe to re-run: upserts)
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const alice = await prisma.user.upsert({
  where: { email: "alice@test.dev" },
  update: {},
  create: { email: "alice@test.dev", name: "Alice Tester", username: "alice", password: "x" },
})
const bob = await prisma.user.upsert({
  where: { email: "bob@test.dev" },
  update: {},
  create: { email: "bob@test.dev", name: "Bob Tester", username: "bob", password: "x" },
})

let post = await prisma.post.findFirst({ where: { content: "Smoke test post" } })
if (!post) {
  post = await prisma.post.create({
    data: { userId: alice.id, author: "Alice Tester", content: "Smoke test post", likes: [] },
  })
}

let event = await prisma.collegeEvent.findFirst({ where: { title: "Smoke Test Event" } })
if (!event) {
  event = await prisma.collegeEvent.create({
    data: {
      title: "Smoke Test Event",
      description: "Capacity race test",
      date: new Date(Date.now() + 86400000),
      time: "10:00",
      location: "Lab 1",
      organizer: alice.id,
      attendees: [],
      category: "tech",
      registrationOpen: true,
      maxAttendees: 1,
    },
  })
}

let job = await prisma.job.findFirst({ where: { title: "Smoke Test Job" } })
if (!job) {
  job = await prisma.job.create({
    data: {
      companyName: "TestCo",
      title: "Smoke Test Job",
      description: "Apply race test",
      applicants: [],
      createdBy: alice.id,
    },
  })
}

console.log(
  JSON.stringify({
    alice: alice.id,
    bob: bob.id,
    post: post.id,
    event: event.id,
    job: job.id,
  })
)
await prisma.$disconnect()
