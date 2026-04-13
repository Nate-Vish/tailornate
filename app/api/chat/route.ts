import { streamText, convertToModelMessages } from "ai"
import { google } from "@ai-sdk/google"
import { NextRequest } from "next/server"
import { SYSTEM_PROMPT, RATE_LIMIT } from "@/lib/chat-config"

const MAX_MESSAGES = 20
const MAX_MESSAGE_LENGTH = 2000

// In-memory rate limiter (resets on cold start — fine for portfolio scale)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

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

function extractText(msg: unknown): string {
  if (typeof msg !== "object" || msg === null) return ""
  const m = msg as Record<string, unknown>
  if (Array.isArray(m.parts)) {
    const part = (m.parts as unknown[])[0]
    if (typeof part === "object" && part !== null) {
      const p = part as Record<string, unknown>
      if (typeof p.text === "string") return p.text
    }
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

  // Strip fabricated assistant messages — only trust user turns from the client
  const userMessages = rawMessages.filter(
    (m: unknown) =>
      typeof m === "object" && m !== null && (m as Record<string, unknown>).role === "user"
  )

  if (userMessages.length === 0) {
    return new Response("Invalid request", { status: 400 })
  }

  try {
    const result = streamText({
      model: google("gemma-3-27b-it"),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(userMessages),
      maxOutputTokens: 512,
    })

    return result.toUIMessageStreamResponse()
  } catch (err) {
    console.error("[chat] streamText error:", err)
    return new Response("Something went wrong", { status: 500 })
  }
}
