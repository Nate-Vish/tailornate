import { NextRequest, NextResponse } from "next/server"

const COOKIE_NAME = "sidra_gate"
const DEFAULT_PASSCODE_SHA256 =
  "801a9340d50aba5b4ffae619bba5c60235b96806518b217eed6bf2385e6d1a11"
const RATE = { windowMs: 10 * 60 * 1000, maxAttempts: 12 }

const attempts = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  if (attempts.size > 500) {
    for (const [key, entry] of attempts) {
      if (now > entry.resetAt) attempts.delete(key)
    }
  }
  const entry = attempts.get(ip)
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + RATE.windowMs })
    return false
  }
  if (entry.count >= RATE.maxAttempts) return true
  entry.count++
  return false
}

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "too many attempts" }, { status: 429 })
  }

  let passcode = ""
  try {
    const body = (await req.json()) as { passcode?: unknown }
    if (typeof body.passcode === "string") passcode = body.passcode
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 })
  }

  if (!passcode || passcode.length > 128) {
    return NextResponse.json({ error: "invalid" }, { status: 400 })
  }

  const expected = process.env.TASKS_PASSCODE_SHA256 ?? DEFAULT_PASSCODE_SHA256
  const hash = await sha256Hex(passcode)

  if (hash !== expected) {
    return NextResponse.json({ error: "wrong passcode" }, { status: 401 })
  }

  const res = new NextResponse(null, { status: 204 })
  res.cookies.set(COOKIE_NAME, hash, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  })
  return res
}
