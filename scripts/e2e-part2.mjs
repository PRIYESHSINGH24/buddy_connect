// Part 2: events register + jobs apply (UI) — continues browser from part1
import { BASE, ok, fail, sleep, shot, launch } from "./e2e-lib.mjs"
import { T } from "./e2e-part1.mjs"
export { T }

try {
  const p1 = T.p1
  // Fresh fixtures via API (deterministic — no dependence on stale seed rows
  // from older runs that may already be full / already-applied)
  const stamp2 = Date.now().toString(36)
  const evRes = await T.api("/api/events", { method: "POST", body: JSON.stringify({ title: `[E2E] UI Event ${stamp2}`, description: "e2e ui fixture", date: new Date(Date.now() + 864e5).toISOString().slice(0, 10), time: "18:00", location: "Hall A", organizer: T.aliceId, category: "workshop", maxAttendees: 50 }) })
  const evId = evRes.body?.eventId
  evId ? ok("e2e event fixture created") : fail("event fixture", ` ${evRes.status}`)
  const jobRes = await T.api("/api/jobs", { method: "POST", body: JSON.stringify({ companyName: "E2E Corp", title: `[E2E] UI Job ${stamp2}`, description: "e2e ui fixture", location: "Remote", employmentType: "Internship" }) })
  const jobId = jobRes.body?.job?._id || jobRes.body?.job?.id
  jobId ? ok("e2e job fixture created") : fail("job fixture", ` ${jobRes.status}`)
  // 6. events
  await p1.goto(`${BASE}/events`, { waitUntil: "networkidle2", timeout: 60000 })
  await sleep(1500)
  const evText = await p1.evaluate(() => document.body.innerText.slice(0, 2000))
  const evPageOk = new RegExp("Events|Register", "i").test(evText)
  evPageOk ? ok("events page renders") : fail("events page", ` ${evText.slice(0, 100)}`)
  await shot(p1, "7-events")
  const regResult = await p1.evaluate((eid, title) => {
    // click the Register button of OUR fresh fixture card (title match), not a stale row
    const cards = [...document.querySelectorAll("h3")]
    const card = cards.find((h) => h.textContent.includes(title))
    const scope = card ? card.closest("div[class*='rounded'], div[class*='card'], div") : document
    const btn = [...(scope?.querySelectorAll("button") || [])].find((b) => b.textContent.trim() === "Register")
      || [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Register")
    if (!btn) {
      const registered = [...document.querySelectorAll("button")].filter((b) => /Registered/.test(b.textContent)).length
      return `no-register-btn registered=${registered}`
    }
    btn.scrollIntoView(); btn.click()
    return `clicked-fixture`
  }, evId, `[E2E] UI Event ${stamp2}`)
  await sleep(2000)
  const evAfter = await p1.evaluate(() => document.body.innerText)
  const regOk = new RegExp("Registered").test(evAfter)
  regOk ? ok("event registered (UI)", ` ${regResult}`) : fail("event register", ` ${regResult}`)
  await shot(p1, "8-registered")

  // 7. jobs
  await p1.goto(`${BASE}/jobs`, { waitUntil: "networkidle2", timeout: 60000 })
  await sleep(1500)
  const jobsText = await p1.evaluate(() => document.body.innerText.slice(0, 2000))
  const jobsPageOk = new RegExp("Jobs|Apply", "i").test(jobsText)
  jobsPageOk ? ok("jobs page renders") : fail("jobs page", ` ${jobsText.slice(0, 100)}`)
  await shot(p1, "9-jobs")
  const applyResult = await p1.evaluate((title) => {
    const cards = [...document.querySelectorAll("h3")]
    const card = cards.find((h) => h.textContent.includes(title))
    const scope = card ? card.closest("div[class*='rounded'], div") : document
    const btn = [...(scope?.querySelectorAll("button") || [])].find((b) => b.textContent.trim() === "Apply Now")
      || [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Apply Now")
    if (!btn) return "no-apply-btn"
    btn.scrollIntoView(); btn.click()
    return `clicked-fixture`
  }, `[E2E] UI Job ${stamp2}`)
  await sleep(2500)
  const jobsAfter = await p1.evaluate(() => document.body.innerText)
  const appOk = new RegExp("Applied").test(jobsAfter)
  appOk ? ok("job applied (UI)", ` ${applyResult}`) : fail("job apply", ` ${applyResult}`)
  await shot(p1, "10-applied")
} catch (e) {
  fail("part2 exception", ` ${e.message?.slice(0, 200)}`)
  await shot(T.p1, "ERR-part2").catch(() => {})
}
