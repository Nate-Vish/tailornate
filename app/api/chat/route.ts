import { streamText, convertToModelMessages } from "ai"
import { google } from "@ai-sdk/google"
import { NextRequest } from "next/server"
import {
  SYSTEM_PROMPT,
  RATE_LIMIT,
  INJECTION,
  detectInjection,
} from "@/lib/chat-config"

const MAX_MESSAGES = 40 // hard cap on what a client may send
const HISTORY_WINDOW = 16 // turns the model actually sees
const MAX_MESSAGE_LENGTH = 2000

// In-memory rate limiter (resets on cold start — fine for portfolio scale)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

// Prompt-injection tracker: strikes and (once locked) an expiry timestamp.
const injectionMap = new Map<string, { strikes: number; lockedUntil: number }>()

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  )
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()

  // Purge expired entries to prevent unbounded growth
  if (rateLimitMap.size > 500) {
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(key)
    }
  }

  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT.windowMs })
    return false
  }

  if (entry.count >= RATE_LIMIT.maxMessages) {
    return true
  }

  entry.count++
  return false
}

// Returns "locked" if this IP is currently serving a lockout, "warn" if this
// is a first injection attempt (one warning given), "clear" otherwise.
function injectionGate(ip: string, latestUserText: string): "locked" | "warn" | "clear" {
  const now = Date.now()

  // Housekeeping so the map cannot grow without bound.
  if (injectionMap.size > 500) {
    for (const [key, entry] of injectionMap) {
      if (entry.lockedUntil && now > entry.lockedUntil && entry.strikes === 0) {
        injectionMap.delete(key)
      }
    }
  }

  const entry = injectionMap.get(ip) ?? { strikes: 0, lockedUntil: 0 }

  // Already locked and still within the window.
  if (entry.lockedUntil && now < entry.lockedUntil) {
    return "locked"
  }

  // Lock expired: reset so the visitor gets a clean slate.
  if (entry.lockedUntil && now >= entry.lockedUntil) {
    injectionMap.delete(ip)
    // fall through with a fresh entry below
  }

  if (!detectInjection(latestUserText)) {
    return "clear"
  }

  // An injection attempt was detected.
  const fresh = injectionMap.get(ip) ?? { strikes: 0, lockedUntil: 0 }
  fresh.strikes += 1

  if (fresh.strikes >= INJECTION.strikesBeforeLock) {
    fresh.lockedUntil = now + INJECTION.lockMs
    injectionMap.set(ip, fresh)
    return "locked"
  }

  injectionMap.set(ip, fresh)
  return "warn"
}

function extractText(msg: unknown): string {
  if (typeof msg !== "object" || msg === null) return ""
  const m = msg as Record<string, unknown>
  if (Array.isArray(m.parts)) {
    return (m.parts as unknown[])
      .map((part) => {
        if (typeof part !== "object" || part === null) return ""
        const p = part as Record<string, unknown>
        return p.type === "text" && typeof p.text === "string" ? p.text : ""
      })
      .join("")
  }
  if (typeof m.content === "string") return m.content
  return ""
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)

  if (isRateLimited(ip)) {
    return new Response("Rate limit reached. Please try again later.", {
      status: 429,
    })
  }

  let body: { messages?: unknown }
  try {
    body = await req.json()
  } catch (err) {
    console.error("[chat] JSON parse error:", err)
    return new Response("Invalid request", { status: 400 })
  }

  const rawMessages = body?.messages
  if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
    return new Response("Invalid request", { status: 400 })
  }

  if (rawMessages.length > MAX_MESSAGES) {
    return new Response("Invalid request", { status: 400 })
  }

  for (const msg of rawMessages) {
    const text = extractText(msg)
    if (text.length > MAX_MESSAGE_LENGTH) {
      return new Response("Message too long", { status: 400 })
    }
  }

  // Rebuild the history from plain text only. Assistant turns are kept so the
  // bot remembers what it already said; anything else a client might inject
  // (system roles, tool parts, files) is dropped.
  const history = rawMessages
    .filter((m: unknown) => {
      const role = typeof m === "object" && m !== null ? (m as Record<string, unknown>).role : null
      return role === "user" || role === "assistant"
    })
    .map((m: unknown, i: number) => {
      const r = m as Record<string, unknown>
      return {
        id: typeof r.id === "string" ? r.id : String(i),
        role: r.role as "user" | "assistant",
        parts: [{ type: "text" as const, text: extractText(m) }],
      }
    })
    .filter((m) => m.parts[0].text.trim().length > 0)
    .slice(-HISTORY_WINDOW)

  // The model must see a user turn first and last.
  while (history.length && history[0].role !== "user") history.shift()
  const userMessages = history.filter((m) => m.role === "user")

  if (userMessages.length === 0 || history[history.length - 1].role !== "user") {
    return new Response("Invalid request", { status: 400 })
  }

  // Prompt-injection defense: check the visitor's latest message only.
  const latest = extractText(userMessages[userMessages.length - 1])
  const gate = injectionGate(ip, latest)
  if (gate === "warn") {
    // 403 -> the client shows a one-time warning. Another attempt locks the chat.
    return new Response("INJECTION_WARNING", { status: 403 })
  }
  if (gate === "locked") {
    // 423 Locked -> the client disables the chat. Server keeps it 24h by IP.
    return new Response("CHAT_LOCKED", { status: 423 })
  }

  try {
    const result = streamText({
      model: google("gemini-flash-lite-latest"),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(history),
      maxOutputTokens: 400,
      temperature: 0.6,
    })

    return result.toUIMessageStreamResponse()
  } catch (err) {
    console.error("[chat] streamText error:", err)
    return new Response("Something went wrong", { status: 500 })
  }
}
