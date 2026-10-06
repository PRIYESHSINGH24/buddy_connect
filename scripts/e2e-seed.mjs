// E2E fixture seeder (via Prisma, same DB the dev server uses).
// Creates 2 fresh users + one event (maxAttendees=2) + one job.
// Re-runnable: wipes its own e2e fixture rows first.
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import bcrypt from "bcryptjs"

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

export const E2E = {
  alice: { email: "e2ealice@test.local", password: "TestPass123!", name: "E2E Alice" },
  bob: { email: "e2ebob@test.local", password: "TestPass123!", name: "E2E Bob" },
}

async function main() {
  const emails = [E2E.alice.email, E2E.bob.email]
  // cleanup previous fixture rows
  await prisma.comment.deleteMany({ where: { user: { email: { in: emails } } } }).catch(() => {})
  await prisma.post.deleteMany({ where: { user: { email: { in: emails } } } }).catch(() => {})
  await prisma.collegeEvent.deleteMany({ where: { title: { startsWith: "[E2E]" } } }).catch(() => {})
  await prisma.job.deleteMany({ where: { title: { startsWith: "[E2E]" } } }).catch(() => {})
  await prisma.user.deleteMany({ where: { email: { in: emails } } }).catch(() => {})

  const pass = await bcrypt.hash("TestPass123!", 10)
  const mk = (u) =>
    prisma.user.create({
      data: {
        email: u.email, password: pass, name: u.name,
        username: u.email.split("@")[0] + Date.now().toString(36),
        college: "E2E COLLEGE", department: "CS", year: "3rd",
        emailVerified: true, bio: "e2e fixture",
      },
      select: { id: true, email: true, name: true },
    })
  const alice = await mk(E2E.alice)
  const bob = await mk(E2E.bob)

  const event = await prisma.collegeEvent.create({
    data: {
      title: "[E2E] Startup Pitch Night",
      description: "E2E fixture event", date: new Date(Date.now() + 7 * 864e5),
      time: "18:00", location: "Auditorium", organizer: alice.id,
      category: "Workshop", maxAttendees: 2, registrationOpen: true,
    },
    select: { id: true, title: true },
  })
  const job = await prisma.job.create({
    data: {
      title: "[E2E] Frontend Intern", companyName: "E2E Corp",
      description: "E2E fixture job", location: "Remote",
      employmentType: "Internship", createdBy: alice.id,
    },
    select: { id: true, title: true },
  })
  console.log(JSON.stringify({ alice, bob, event, job }))
  await prisma.$disconnect()
  await pool.end()
}
main().catch((e) => { console.error(e); process.exit(1) })
