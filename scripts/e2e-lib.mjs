// Shared E2E helpers (puppeteer-core + system Chrome)
import puppeteer from "puppeteer-core"

export const BASE = process.env.BASE || "http://localhost:3000"
export const stamp = Date.now().toString(36)

let passed = 0, failed = 0
const results = []
export function ok(name, extra = "") { passed++; results.push(`  OK  ${name}${extra}`) }
export function fail(name, extra = "") { failed++; results.push(`  FAIL ${name}${extra}`) }
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
export const shot = async (page, n) => { try { await page.screenshot({ path: `/tmp/e2e-${n}.png` }) } catch {} }
export const summary = () => { console.log("\n" + results.join("\n")); console.log(`\n=== E2E RESULT: ${passed} passed, ${failed} failed ===`); return failed }

export async function launch() {
  return puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--window-size=1280,900"],
  })
}

export const apiFetch = (path, opts = {}) =>
  fetch(BASE + path, opts).then(async (r) => ({
    status: r.status,
    body: await r.text().then((t) => { try { return JSON.parse(t) } catch { return t } }),
  }))

export const withCookie = (cookie) => (path, opts = {}) =>
  apiFetch(path, { ...opts, headers: { cookie, "Content-Type": "application/json", ...(opts.headers || {}) } })

export const cookieOf = async (page) => (await page.cookies()).map((c) => `${c.name}=${c.value}`).join("; ")

// Fill a text input reliably (React controlled inputs need native setter)
export async function fill(page, selector, text) {
  await page.waitForSelector(selector, { timeout: 20000 })
  await page.evaluate((sel, val) => {
    const el = document.querySelector(sel)
    if (!el) return
    el.focus()
    const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value")?.set
      || Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set
    setter ? setter.call(el, val) : (el.value = val)
    el.dispatchEvent(new Event("input", { bubbles: true }))
    el.dispatchEvent(new Event("change", { bubbles: true }))
  }, selector, text)
}

// Radix Select: click trigger, pick option by index
export async function pickOption(page, idx = 2) {
  const triggers = await page.$$('[role="combobox"]')
  if (!triggers.length) return false
  await triggers[0].click()
  await page.waitForSelector('[role="option"]', { timeout: 8000 })
  const opts = await page.$$('[role="option"]')
  if (opts[idx]) await opts[idx].click()
  return true
}

export async function submitAndWait(page, btnSelector = 'button[type="submit"]') {
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }).catch(() => {}),
    page.click(btnSelector),
  ])
  await sleep(1500)
}
