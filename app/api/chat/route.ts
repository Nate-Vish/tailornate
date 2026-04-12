import { streamText, convertToModelMessages } from "ai"
import { google } from "@ai-sdk/google"
import { NextRequest } from "next/server"
import { SYSTEM_PROMPT, RATE_LIMIT } from "@/lib/chat-config"

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

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)

  if (isRateLimited(ip)) {
    return new Response("Rate limit reached. Please try again later.", {
      status: 429,
    })
  }

  const { messages } = await req.json()

  const result = streamText({
    model: google("gemma-3-27b-it"),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 512,
  })

  return result.toUIMessageStreamResponse()
}
