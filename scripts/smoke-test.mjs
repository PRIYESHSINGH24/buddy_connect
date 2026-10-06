// One-off smoke test for the optimized backend. Run while `next dev` is up.
import crypto from "node:crypto"

const BASE = process.env.BASE_URL || "http://localhost:3000"
const SECRET = "smoke-test-secret"

const IDS = {
  alice: "cmuvwspow0000mdswlo52s5ma",
  bob: "cmuvwspp40001mdsw6c0j7w3z",
  post: "cmuvwsppb0002mdsw2jjok847",
  event: "cmuvwsppg0003mdswqy2d9iyb",
  job: "cmuvwsppk0004mdswwjytu10z",
}

const b64 = (s) => Buffer.from(s).toString("base64url")
function signToken(userId) {
  const h = b64(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const p = b64(JSON.stringify({ userId, exp: Math.floor(Date.now() / 1000) + 3600 }))
  const sig = crypto.createHmac("sha256", SECRET).update(`${h}.${p}`).digest("base64url")
  return `${h}.${p}.${sig}`
}
const cookieFor = (userId) => ({ cookie: `auth_token=${signToken(userId)}` })

// middleware.ts requires a valid auth_token on every non-public route —
// default every request to Alice's cookie unless one was set explicitly
const rawFetch = globalThis.fetch
globalThis.fetch = (url, opts = {}) => {
  const headers = new Headers(opts.headers || {})
  if (!headers.has("cookie")) headers.set("cookie", `auth_token=${signToken(IDS.alice)}`)
  return rawFetch(url, { ...opts, headers })
}

let pass = 0
let fail = 0
const check = (name, cond, extra = "") => {
  if (cond) {
    pass++
    console.log(`  OK  ${name}`)
  } else {
    fail++
    console.log(`  FAIL ${name} ${extra}`)
  }
}

// [1] Feed: first page + Redis cache hit
console.log("\n[1] Feed caching")
let t0 = performance.now()
let r = await fetch(`${BASE}/api/posts`)
let j = await r.json()
const cold = performance.now() - t0
check("GET /api/posts 200", r.status === 200, `status=${r.status}`)
check("posts array present", Array.isArray(j.posts), JSON.stringify(j).slice(0, 120))

t0 = performance.now()
r = await fetch(`${BASE}/api/posts`)
await r.json()
const warm = performance.now() - t0
console.log(`      cold=${cold.toFixed(1)}ms warm=${warm.toFixed(1)}ms`)

// [2] 50 concurrent feed requests
console.log("\n[2] Concurrency: 50 parallel GET /api/posts")
t0 = performance.now()
const results = await Promise.all(
  Array.from({ length: 50 }, () => fetch(`${BASE}/api/posts`).then((res) => res.status))
)
const wall = performance.now() - t0
const okCount = results.filter((s) => s === 200).length
check("all 50 returned 200", okCount === 50, `ok=${okCount}/50 wall=${wall.toFixed(0)}ms`)

// [3] Like toggle race: 10 different users in parallel
console.log("\n[3] Atomic like: 10 parallel toggles (distinct users)")
const likeUsers = Array.from({ length: 10 }, (_, i) => `likeuser${i}`)
await Promise.all(
  likeUsers.map((u) =>
    fetch(`${BASE}/api/posts/${IDS.post}/like`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId: u }),
    }).then((res) => res.json())
  )
)
await new Promise((res) => setTimeout(res, 300))
r = await fetch(`${BASE}/api/posts`)
j = await r.json()
const feedPost = (j.posts || []).find((p) => p._id === IDS.post)
const finalLikes = feedPost?.likes || []
check(
  "no like lost (10/10 present after race)",
  finalLikes.length === 10,
  `finalLikes=${finalLikes.length}`
)

// [4] Event capacity race: 10 users, 1 seat
console.log("\n[4] Event capacity race: 10 parallel registers, maxAttendees=1")
const regUsers = Array.from({ length: 10 }, (_, i) => `reguser${i}`)
const regResults = await Promise.all(
  regUsers.map((u) =>
    fetch(`${BASE}/api/events/${IDS.event}/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId: u }),
    }).then(async (res) => ({ status: res.status, body: await res.json() }))
  )
)
const winners = regResults.filter((x) => x.body?.registered === true)
check("exactly 1 winner", winners.length === 1, `winners=${winners.length}`)
const fullCount = regResults.filter((x) => x.body?.error === "Event is full").length
check("others got 'Event is full'", fullCount === 9, `full=${fullCount}`)

// [5] Job apply: duplicate applies stay idempotent (JWT auth)
console.log("\n[5] Job apply: double-apply stays idempotent")
r = await fetch(`${BASE}/api/jobs/${IDS.job}/apply`, {
  method: "POST",
  headers: { "content-type": "application/json", ...cookieFor(IDS.bob) },
})
j = await r.json()
check("first apply 200", r.status === 200, `status=${r.status} ${JSON.stringify(j).slice(0, 120)}`)
const firstCount = (j.job?.applicants || []).filter((x) => x === IDS.bob).length
check("bob in applicants exactly once", firstCount === 1, `count=${firstCount}`)

r = await fetch(`${BASE}/api/jobs/${IDS.job}/apply`, {
  method: "POST",
  headers: { "content-type": "application/json", ...cookieFor(IDS.bob) },
})
j = await r.json()
const secondCount = (j.job?.applicants || []).filter((x) => x === IDS.bob).length
check("re-apply still exactly once", secondCount === 1, `count=${secondCount}`)

// [6] Connect + accept flow (JWT auth, atomic arrays)
console.log("\n[6] Connect request + accept")
r = await fetch(`${BASE}/api/users/${IDS.bob}/connect`, {
  method: "POST",
  headers: { "content-type": "application/json", ...cookieFor(IDS.alice) },
})
check("connect request 200", r.status === 200, `status=${r.status}`)

r = await fetch(`${BASE}/api/users/${IDS.bob}/connect/respond`, {
  method: "POST",
  headers: { "content-type": "application/json", ...cookieFor(IDS.bob) },
  body: JSON.stringify({ requesterId: IDS.alice, action: "accept" }),
})
check("accept 200", r.status === 200, `status=${r.status}`)

// [7] Comment create (cache invalidation path)
console.log("\n[7] Comment create")
r = await fetch(`${BASE}/api/posts/${IDS.post}/comment`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ userId: IDS.bob, author: "Bob Tester", content: "nice post" }),
})
check("comment 201", r.status === 201, `status=${r.status}`)

// [8] Basic listings
console.log("\n[8] Listing endpoints")
for (const [name, path] of [
  ["users", "/api/users"],
  ["stats", "/api/stats"],
  ["events", "/api/events"],
  ["jobs", "/api/jobs"],
  ["projects", "/api/projects"],
]) {
  const res = await fetch(`${BASE}${path}`)
  check(`GET ${path} 200`, res.status === 200, `status=${res.status}`)
  await res.json().catch(() => {})
}

console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`)
process.exit(fail > 0 ? 1 : 0)
