import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { NextRequest } from "next/server"
import { aiResponseSchema, type AIRequestBody } from "@/lib/tasks/ai"

const MAX_MESSAGES = 16
const MAX_MESSAGE_LENGTH = 1000
const MAX_TASKS = 120
const RATE = { windowMs: 10 * 60 * 1000, maxRequests: 20 }

// Ordered by capability; first model the key supports wins.
const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemma-3-27b-it"]

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

function buildPrompt(body: AIRequestBody): string {
  const { state, messages } = body
  const history = messages
    .map((m) => `${m.role === "user" ? "USER" : "ASSISTANT"}: ${m.content}`)
    .join("\n")

  return `You are Sidra, a sharp Hebrew/English task-management assistant embedded in a task app.
Today is ${state.today}.

## Current app state (JSON)
Categories: ${JSON.stringify(state.categories)}
Tags (sub-projects, each belongs to a category): ${JSON.stringify(state.tags)}
Tasks (score = computed urgency 0-100, higher = more urgent): ${JSON.stringify(state.tasks)}

## Your job
Read the conversation and return ONE JSON object (no markdown, no code fences, no extra text) with this exact shape:
{"reply": "<short answer in the user's language>", "actions": [<zero or more action objects>]}

Action objects:
- {"type":"create_task","title":"...","priority":"urgent|high|medium|low","size":"short|medium|long","categoryId":"<existing category id>","tagId":"<existing tag id, optional>","dueDate":"YYYY-MM-DD (optional)"}
- {"type":"complete_task","taskId":"<existing task id>"}
- {"type":"update_task","taskId":"<id>","patch":{...any of title/priority/size/status/dueDate/categoryId/tagId}}
- {"type":"delete_task","taskId":"<id>"}
- {"type":"boost_task","taskId":"<id>"}  // manually push a task to the top
- {"type":"show_top","taskIds":["id1","id2","id3"]}  // when the user asks what to do / what's urgent

## Rules
- Match tasks by meaning, not exact wording. "הפוסט בלינקדאין" matches the LinkedIn post task.
- When creating: infer priority from words like דחוף/urgent/חשוב, infer category+tag from context (e.g. "Polaris" → tag_polaris). Default priority "medium", size "short".
- Relative dates: מחר = tomorrow, מחרתיים = +2 days, בעוד שבוע = +7 days. Compute from today's date.
- Keep "reply" short and natural (1-2 sentences), in the language the user wrote in (Hebrew gets Hebrew).
- If the user asks a question that needs no action (e.g. "מה דחוף?"), use show_top with the 3 highest-score task ids and summarize briefly in reply.
- If you're not sure which task the user means, ask in "reply" and return no actions.
- NEVER invent task/category/tag ids that are not in the state above.

## Conversation
${history}

JSON response:`
}

function extractJson(text: string): unknown {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim()
  const start = cleaned.indexOf("{")
  if (start === -1) throw new Error("no JSON object in model output")
  // Walk balanced braces to find the end of the first object.
  let depth = 0
  let inString = false
  let escape = false
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i]
    if (escape) {
      escape = false
      continue
    }
    if (ch === "\\") {
      escape = true
      continue
    }
    if (ch === '"') inString = !inString
    if (inString) continue
    if (ch === "{") depth++
    if (ch === "}") {
      depth--
      if (depth === 0) return JSON.parse(cleaned.slice(start, i + 1))
    }
  }
  throw new Error("unbalanced JSON in model output")
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (isRateLimited(ip)) {
    return Response.json(
      { reply: "הגעת למכסת הבקשות. נסה שוב בעוד כמה דקות.", actions: [] },
      { status: 429 },
    )
  }

  let body: AIRequestBody
  try {
    body = (await req.json()) as AIRequestBody
  } catch {
    return new Response("Invalid request", { status: 400 })
  }

  if (
    !Array.isArray(body?.messages) ||
    body.messages.length === 0 ||
    body.messages.length > MAX_MESSAGES ||
    !body?.state ||
    !Array.isArray(body.state.tasks) ||
    body.state.tasks.length > MAX_TASKS
  ) {
    return new Response("Invalid request", { status: 400 })
  }

  for (const m of body.messages) {
    if (
      (m.role !== "user" && m.role !== "assistant") ||
      typeof m.content !== "string" ||
      m.content.length > MAX_MESSAGE_LENGTH
    ) {
      return new Response("Invalid request", { status: 400 })
    }
  }

  const prompt = buildPrompt(body)
  let lastError: unknown = null

  for (const model of MODELS) {
    try {
      const result = await generateText({
        model: google(model),
        prompt,
        temperature: 0.2,
        maxOutputTokens: 1200,
      })
      const parsed = aiResponseSchema.safeParse(extractJson(result.text))
      if (!parsed.success) {
        lastError = parsed.error
        continue
      }
      return Response.json(parsed.data)
    } catch (err) {
      lastError = err
      continue
    }
  }

  console.error("[tasks-ai] all models failed:", lastError)
  return Response.json(
    { reply: "משהו השתבש אצלי. נסה לנסח שוב או נסה עוד רגע.", actions: [] },
    { status: 502 },
  )
}
