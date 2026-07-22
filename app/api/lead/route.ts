import { NextRequest } from "next/server"
import { LEAD_LIMIT } from "@/lib/chat-config"

// In-memory limiter (resets on cold start). Portfolio scale.
const ipMap = new Map<string, { count: number; resetAt: number }>()
let globalCount = { count: 0, resetAt: 0 }

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,24}$/

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  )
}

function limited(ip: string): boolean {
  const now = Date.now()
  if (now > globalCount.resetAt) {
    globalCount = { count: 0, resetAt: now + 24 * 60 * 60 * 1000 }
  }
  if (globalCount.count >= LEAD_LIMIT.maxGlobalPerDay) return true

  if (ipMap.size > 500) {
    for (const [k, v] of ipMap) if (now > v.resetAt) ipMap.delete(k)
  }
  const entry = ipMap.get(ip)
  if (!entry || now > entry.resetAt) {
    ipMap.set(ip, { count: 1, resetAt: now + LEAD_LIMIT.windowMs })
    globalCount.count++
    return false
  }
  if (entry.count >= LEAD_LIMIT.maxPerIp) return true
  entry.count++
  globalCount.count++
  return false
}

const clean = (s: unknown, max: number) =>
  typeof s === "string" ? s.replace(/[\r\n<>]/g, " ").trim().slice(0, max) : ""

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return Response.json({ ok: false, error: "invalid" }, { status: 400 })
  }

  // Honeypot: real users never fill this hidden field.
  if (typeof body.website === "string" && body.website.length > 0) {
    return Response.json({ ok: true })
  }

  const name = clean(body.name, 80)
  const email = clean(body.email, 254)
  const note = clean(body.note, 600)

  if (name.length < 2 || !EMAIL_RE.test(email)) {
    return Response.json({ ok: false, error: "invalid" }, { status: 400 })
  }

  if (limited(clientIp(req))) {
    return Response.json({ ok: false, error: "limit" }, { status: 429 })
  }

  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.LEAD_TO_EMAIL ?? "natan.vish100+lead@gmail.com"
  if (!apiKey) {
    console.error("[lead] RESEND_API_KEY missing; lead not delivered:", { name, email })
    return Response.json({ ok: false, error: "unavailable" }, { status: 503 })
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.LEAD_FROM_EMAIL ?? "Portfolio Bot <onboarding@resend.dev>",
      to: [to],
      reply_to: email,
      subject: `[הצעה עסקית] ${name}`,
      text: `New lead from the portfolio bot\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${note || "(none)"}\n`,
    }),
  })

  if (!res.ok) {
    console.error("[lead] send failed:", res.status, await res.text().catch(() => ""))
    return Response.json({ ok: false, error: "unavailable" }, { status: 502 })
  }

  return Response.json({ ok: true })
}
