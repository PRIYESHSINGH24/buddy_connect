// Part 2: events register + jobs apply (UI) — continues browser from part1
import { BASE, ok, fail, sleep, shot, launch } from "./e2e-lib.mjs"
import { T } from "./e2e-part1.mjs"
export { T }

try {
  const p1 = T.p1
  // 6. events
  await p1.goto(`${BASE}/events`, { waitUntil: "networkidle2", timeout: 60000 })
  await sleep(1500)
  const evText = await p1.evaluate(() => document.body.innerText.slice(0, 2000))
  const evPageOk = new RegExp("Events|Register", "i").test(evText)
  evPageOk ? ok("events page renders") : fail("events page", ` ${evText.slice(0, 100)}`)
  await shot(p1, "7-events")
  const regResult = await p1.evaluate(() => {
    const btns = [...document.querySelectorAll("button")].filter((b) => b.textContent.trim() === "Register")
    if (!btns.length) return "no-register-btn"
    btns[0].click()
    return `clicked-of-${btns.length}`
  })
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
  const applyResult = await p1.evaluate(() => {
    const btns = [...document.querySelectorAll("button")].filter((b) => b.textContent.trim() === "Apply Now")
    if (!btns.length) return "no-apply-btn"
    btns[0].scrollIntoView(); btns[0].click()
    return `clicked-of-${btns.length}`
  })
  await sleep(2500)
  const jobsAfter = await p1.evaluate(() => document.body.innerText)
  const appOk = new RegExp("Applied").test(jobsAfter)
  appOk ? ok("job applied (UI)", ` ${applyResult}`) : fail("job apply", ` ${applyResult}`)
  await shot(p1, "10-applied")
} catch (e) {
  fail("part2 exception", ` ${e.message?.slice(0, 200)}`)
  await shot(T.p1, "ERR-part2").catch(() => {})
}
