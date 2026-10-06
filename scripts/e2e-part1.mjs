// Part 1: signup + login + dashboard post + like + comment (real Chrome UI)
import { BASE, stamp, ok, fail, sleep, shot, summary, launch, apiFetch, withCookie, cookieOf, fill, pickOption, submitAndWait } from "./e2e-lib.mjs"

export const T = {} // shared state across parts
const ALICE = T.aliceCreds = { name: "E2E Alice", email: `e2ealice${stamp}@test.local`, pass: "TestPass123!", college: "E2E COLLEGE", dept: "Computer Science" }

const browser = T.browser = await launch()
try {
  const s = await apiFetch("/api/stats")
  s.status === 200 ? ok("server up") : fail("server up", ` status=${s.status}`)

  // 1. signup Alice
  const p1 = T.p1 = await browser.newPage()
  await p1.goto(`${BASE}/signup`, { waitUntil: "networkidle2", timeout: 60000 })
  await fill(p1, "#name", ALICE.name)
  await fill(p1, "#email", ALICE.email)
  await fill(p1, "#college", ALICE.college)
  await fill(p1, "#department", ALICE.dept)
  await pickOption(p1, 2)
  await fill(p1, "#password", ALICE.pass)
  await fill(p1, "#confirmPassword", ALICE.pass)
  await shot(p1, "0-signup-filled")
  await submitAndWait(p1)
  p1.url().includes("/login") ? ok("signup -> /login?signup=success") : fail("signup redirect", ` url=${p1.url()}`)
  await shot(p1, "1-signup-done")

  // 2. login
  await p1.goto(`${BASE}/login`, { waitUntil: "networkidle2", timeout: 60000 })
  await fill(p1, "#email", ALICE.email)
  await fill(p1, "#password", ALICE.pass)
  await shot(p1, "2-login-filled")
  await submitAndWait(p1)
  await sleep(500)
  p1.url().includes("/dashboard") ? ok("login -> /dashboard") : fail("login redirect", ` url=${p1.url()}`)
  const dashText = await p1.evaluate(() => document.body.innerText.slice(0, 4000))
  const dashOk = new RegExp("E2E Alice|What.s on your mind|Feed").test(dashText)
  dashOk ? ok("dashboard renders feed for Alice") : fail("dashboard renders", ` text=${dashText.slice(0, 120)}`)
  await shot(p1, "3-dashboard")

  const authCookie = await cookieOf(p1)
  const api = T.api = withCookie(authCookie)
  const me = await api("/api/auth/me")
  const aliceId = T.aliceId = me.body?.user?._id || me.body?._id || me.body?.id
  aliceId ? ok("session cookie valid", ` id=${aliceId}`) : fail("session cookie", ` ${JSON.stringify(me.body).slice(0, 120)}`)
  // /api/users requires auth (middleware 401s without a cookie) — use the
  // logged-in session to verify Alice persisted; match by name (list omits email)
  const users = await api(`/api/users?search=${encodeURIComponent(ALICE.email.split("@")[0])}`).catch(() => null)
  const aliceFound = users?.body?.users?.some((u) => u.name === ALICE.name) || me.body?.email === ALICE.email
  aliceFound ? ok("alice persisted in DB") : fail("alice persisted in DB", ` users=${JSON.stringify(users?.body?.users?.map((u) => u.name)).slice(0, 120)}`)

  // 3. create post
  const POST_TEXT = T.postText = `E2E post ${stamp} hello world`
  await p1.waitForSelector('textarea[placeholder="What\'s on your mind?"]', { timeout: 20000 })
  await p1.type('textarea[placeholder="What\'s on your mind?"]', POST_TEXT)
  await p1.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === "Post" && !x.disabled); b?.click() })
  await sleep(2500)
  // dashboard loadPosts() replaced the list once; reload so the new-post cache
  // invalidation + write are both settled before asserting visibility
  await p1.reload({ waitUntil: "networkidle2", timeout: 60000 }).catch(() => {})
  await sleep(2500)
  const postVisible = (await p1.evaluate(() => document.body.innerText)).includes(POST_TEXT)
  postVisible ? ok("post created + visible in feed") : fail("post visible")
  await shot(p1, "4-post-created")
  // cursor param bypasses the posts:firstpage cache; retry for write->read settling
  let myPost = null
  for (let i = 0; i < 5 && !myPost; i++) {
    const now = new Date(Date.now() + 60000).toISOString()
    const res = await api(`/api/posts?limit=10&cursor=${encodeURIComponent(now)}`)
    myPost = res.body?.posts?.find((p) => p.content === POST_TEXT)
    if (!myPost) await sleep(1000)
  }
  myPost?._id ? ok("post persisted via API", ` id=${myPost._id}`) : fail("post persisted via API")
  T.postId = myPost?._id

  // 4. like own post (button has aria-label="Like post", bare number inside)
  if (T.postId) {
    await p1.evaluate((pid) => {
      const btn = [...document.getElementById(`post-${pid}`)?.querySelectorAll("button") || []].find((b) => b.getAttribute("aria-label") === "Like post")
      btn?.click()
    }, T.postId)
    await sleep(1500)
    const n = await p1.evaluate((pid) => {
      const btn = [...document.getElementById(`post-${pid}`)?.querySelectorAll("button") || []].find((b) => b.getAttribute("aria-label") === "Like post")
      const m = btn ? btn.textContent.trim().match(/^(\d+)/) : null
      return m ? m[1] : "gone"
    }, T.postId)
    n === "1" ? ok("like count 0 -> 1 in UI") : fail("like count", ` after=${n}`)
    await shot(p1, "5-liked")
  }

  // 5. comment (comment box only renders after expanding; wait for it)
  if (T.postId) {
    const COMMENT = T.commentText = `E2E comment ${stamp}`
    await p1.evaluate((pid) => {
      const card = document.getElementById(`post-${pid}`)
      ;[...card?.querySelectorAll("button") || []].find((b) => b.textContent.trim().startsWith("Comment"))?.click()
    }, T.postId)
    await p1.waitForFunction((pid) => !!document.getElementById(`post-${pid}`)?.querySelector('input[placeholder="Write a comment..."]'), { timeout: 8000 }, T.postId).catch(() => {})
    await sleep(400)
    await p1.evaluate((pid, text) => {
      // React controlled input: set value via native setter + input event
      const input = document.getElementById(`post-${pid}`)?.querySelector('input[placeholder="Write a comment..."]')
      if (input) {
        input.focus()
        const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), "value")?.set
          || Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set
        setter ? setter.call(input, text) : (input.value = text)
        input.dispatchEvent(new Event("input", { bubbles: true }))
        input.dispatchEvent(new Event("change", { bubbles: true }))
      }
    }, T.postId, COMMENT)
    await p1.evaluate((pid) => {
      const card = document.getElementById(`post-${pid}`)
      ;[...card?.querySelectorAll("button") || []].find((b) => b.textContent.trim() === "Post")?.click()
    }, T.postId)
    await sleep(2000)
    const cmtVisible = (await p1.evaluate(() => document.body.innerText)).includes(COMMENT)
    cmtVisible ? ok("comment posted + visible") : fail("comment visible")
    await shot(p1, "6-commented")
  }
} catch (e) {
  fail("part1 exception", ` ${e.message?.slice(0, 200)}`)
  await shot(T.p1, "ERR-part1").catch(() => {})
}
