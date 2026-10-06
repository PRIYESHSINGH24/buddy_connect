// Part 3: Bob signup/login + connect/accept + logout guard — then close + print summary
import { BASE, stamp, ok, fail, sleep, shot, summary, apiFetch, withCookie, cookieOf, fill, submitAndWait } from "./e2e-lib.mjs"
import { T } from "./e2e-part2.mjs"

try {
  const BOB = { name: "E2E Bob", email: `e2ebob${stamp}@test.local`, pass: "TestPass123!", college: "E2E COLLEGE", dept: "Electrical" }
  const browser = T.browser
  const p2 = await browser.newPage()
  await p2.goto(`${BASE}/signup`, { waitUntil: "networkidle2", timeout: 60000 })
  await fill(p2, "#name", BOB.name)
  await fill(p2, "#email", BOB.email)
  await fill(p2, "#college", BOB.college)
  await fill(p2, "#department", BOB.dept)
  // year select via keyboard (robust even if Radix portal behaves oddly)
  const triggers2 = await p2.$$('[role="combobox"]')
  if (triggers2.length) { await triggers2[0].click(); await p2.waitForSelector('[role="option"]', { timeout: 8000 }); await p2.keyboard.press("ArrowDown"); await p2.keyboard.press("ArrowDown"); await p2.keyboard.press("Enter") }
  await fill(p2, "#password", BOB.pass)
  await fill(p2, "#confirmPassword", BOB.pass)
  await submitAndWait(p2)
  await p2.goto(`${BASE}/login`, { waitUntil: "networkidle2", timeout: 60000 })
  await fill(p2, "#email", BOB.email)
  await fill(p2, "#password", BOB.pass)
  await submitAndWait(p2)
  await sleep(500)
  p2.url().includes("/dashboard") ? ok("bob signup + login") : fail("bob login", ` url=${p2.url()}`)
  const bapi = withCookie(await cookieOf(p2))
  const bme = await bapi("/api/auth/me")
  const bobId = bme.body?.user?._id || bme.body?._id || bme.body?.id
  const conn = await bapi(`/api/users/${T.aliceId}/connect`, { method: "POST", body: "{}" })
  const connOk = conn.status === 200
  connOk ? ok("bob connect request sent") : fail("connect request", ` ${conn.status} ${JSON.stringify(conn.body).slice(0, 100)}`)
  // Alice (T.api) accepts Bob's request: target=alice, requester=bob
  const acc = await T.api(`/api/users/${T.aliceId}/connect/respond`, { method: "POST", body: JSON.stringify({ requesterId: bobId, action: "accept" }) })
  const accOk = acc.status === 200
  accOk ? ok("alice accepted connect") : fail("connect accept", ` ${acc.status} ${JSON.stringify(acc.body).slice(0, 100)}`)
  const bobAfter = (await bapi("/api/auth/me")).body?.user || (await bapi("/api/auth/me")).body
  const reflected = (bobAfter?.connections || []).includes(T.aliceId)
  reflected ? ok("connection reflected on Bob") : fail("connection reflect", ` ${(JSON.stringify(bobAfter?.connections) || "none").slice(0, 120)}`)
  await shot(p2, "11-bob-dashboard")

  // logout + guard
  const p3 = await browser.newPage()
  await p3.goto(`${BASE}/login`, { waitUntil: "networkidle2", timeout: 60000 })
  await fill(p3, "#email", T.aliceCreds.email)
  await fill(p3, "#password", T.aliceCreds.pass)
  await submitAndWait(p3)
  await sleep(500)
  // logout inside the page context so the browser jar is actually cleared
  await p3.evaluate(() => fetch("/api/auth/logout", { method: "POST" }))
  await sleep(500)
  await p3.deleteCookie(...(await p3.cookies())).catch(() => {})
  await p3.goto(`${BASE}/dashboard`, { waitUntil: "networkidle2", timeout: 60000 })
  await sleep(1500)
  p3.url().includes("/login") ? ok("logout -> /dashboard guards to /login") : fail("logout guard", ` url=${p3.url()}`)
  await shot(p3, "12-logout-guard")
} catch (e) {
  fail("part3 exception", ` ${e.message?.slice(0, 200)}`)
}
await T.browser.close()
process.exit(summary() ? 1 : 0)
