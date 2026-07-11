import { NextRequest } from "next/server"
import { parseICS } from "@/lib/tasks/ics-parse"

// Fetches the user's read-only calendar feed (Google "secret address" /
// Outlook published ICS) server-side, because browsers can't due to CORS.
// The URL lives only in the user's device storage and passes through here
// per-request — it is never persisted server-side.

const MAX_BYTES = 3_000_000
const FETCH_TIMEOUT_MS = 10_000
const RATE = { windowMs: 10 * 60 * 1000, maxRequests: 30 }

// SSRF guard: only well-known calendar export hosts.
const ALLOWED_HOSTS = [
  "calendar.google.com",
  "outlook.live.com",
  "outlook.office365.com",
]

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  if (rateLimitMap.size > 500) {
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(key)
    }
  }
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE.windowMs })
    return false
  }
  if (entry.count >= RATE.maxRequests) return true
  entry.count++
  return false
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  if (isRateLimited(ip)) {
    return Response.json({ error: "rate limited" }, { status: 429 })
  }

  let raw = ""
  try {
    const body = (await req.json()) as { url?: unknown }
    if (typeof body.url === "string") raw = body.url.trim()
  } catch {
    return Response.json({ error: "invalid" }, { status: 400 })
  }

  // Accept webcal:// as users often copy it that way
  raw = raw.replace(/^webcal:\/\//i, "https://")

  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return Response.json({ error: "כתובת לא תקינה" }, { status: 400 })
  }
  if (url.protocol !== "https:" || !ALLOWED_HOSTS.includes(url.hostname)) {
    return Response.json(
      { error: "נתמכות כתובות ICS של Google Calendar או Outlook בלבד" },
      { status: 400 },
    )
  }

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { "User-Agent": "Madko-Calendar/1.0" },
      // A redirect could point anywhere (SSRF); the allowlist only checked
      // the first hop, so refuse to follow.
      redirect: "manual",
    })
    if (res.status >= 300 && res.status < 400) {
      return Response.json(
        { error: "הכתובת מפנה למקום אחר — העתק את הכתובת הסודית הישירה מההגדרות של Google Calendar" },
        { status: 400 },
      )
    }
    if (!res.ok) {
      return Response.json(
        { error: `היומן החזיר שגיאה (${res.status}) — בדוק שהכתובת הסודית עדיין בתוקף` },
        { status: 502 },
      )
    }
    const text = await res.text()
    if (text.length > MAX_BYTES) {
      return Response.json({ error: "היומן גדול מדי" }, { status: 413 })
    }

    const now = new Date()
    const windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
    const windowEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 21)
    const events = parseICS(text, windowStart, windowEnd).slice(0, 200)

    return Response.json({ events, count: events.length })
  } catch (err) {
    console.error("[calendar-feed] fetch failed:", err)
    return Response.json({ error: "לא הצלחתי להגיע ליומן — נסה שוב" }, { status: 502 })
  }
}
