import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { NextRequest } from "next/server"

// Server-side speech-to-text fallback for browsers without the Web Speech API
// (Chrome iOS, Firefox). Receives a short base64 audio clip, returns the text.
const MAX_BASE64_LENGTH = 6_000_000 // ~4.5MB audio, plenty for a voice command
const RATE = { windowMs: 10 * 60 * 1000, maxRequests: 30 }
const ALLOWED_MIME = ["audio/webm", "audio/mp4", "audio/mpeg", "audio/ogg", "audio/wav", "audio/aac"]

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

  let audio = ""
  let mimeType = ""
  try {
    const body = (await req.json()) as { audio?: unknown; mimeType?: unknown }
    if (typeof body.audio === "string") audio = body.audio
    if (typeof body.mimeType === "string") mimeType = body.mimeType
  } catch {
    return Response.json({ error: "invalid" }, { status: 400 })
  }

  const baseMime = mimeType.split(";")[0]?.trim()
  if (!audio || audio.length > MAX_BASE64_LENGTH || !ALLOWED_MIME.includes(baseMime)) {
    return Response.json({ error: "invalid" }, { status: 400 })
  }

  try {
    const result = await generateText({
      // Transcription stays on flash regardless of TASKS_AI_MODEL: it's a
      // fixed, cheap task where a pro model adds cost without accuracy. Keep
      // this a current model name (Google retires old aliases for new keys).
      model: google(process.env.TASKS_TRANSCRIBE_MODEL ?? "gemini-3.5-flash"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Transcribe this audio exactly as spoken. It is likely Hebrew, possibly English or mixed. Return ONLY the transcription text, nothing else.",
            },
            { type: "file", data: audio, mediaType: baseMime },
          ],
        },
      ],
      temperature: 0,
      maxOutputTokens: 400,
    })
    const text = result.text.trim()
    if (!text) return Response.json({ error: "empty" }, { status: 422 })
    return Response.json({ text })
  } catch (err) {
    console.error("[tasks-transcribe] failed:", err)
    return Response.json({ error: "transcription failed" }, { status: 502 })
  }
}
