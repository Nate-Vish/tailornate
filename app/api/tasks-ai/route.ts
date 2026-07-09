import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { NextRequest } from "next/server"
import { aiResponseSchema, type AIRequestBody } from "@/lib/tasks/ai"

const MAX_MESSAGES = 16
const MAX_MESSAGE_LENGTH = 1000
const MAX_TASKS = 400
const RATE = { windowMs: 10 * 60 * 1000, maxRequests: 25 }

// Ordered by capability; first model the key supports wins. Set TASKS_AI_MODEL
// in Vercel env (e.g. gemini-2.5-pro on a paid key) to try a stronger model
// first — the chain below stays as fallback, so a bad value can't break chat.
const MODELS = [
  ...(process.env.TASKS_AI_MODEL ? [process.env.TASKS_AI_MODEL] : []),
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemma-3-27b-it",
]

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
  const { state, messages, mode, calendar } = body
  const history = messages
    .map((m) => `${m.role === "user" ? "USER" : "ASSISTANT"}: ${m.content}`)
    .join("\n")

  const calendarSection = calendar
    ? calendar.connected
      ? `
## The user's calendar (read-only feed, window: last 7 days to next 21 days)
Events: ${JSON.stringify(calendar.events ?? [])}
Calendar rules:
- "תוסיף משימות מהיומן / לשבוע" → create_task for each relevant UPCOMING event that has no matching existing task (match by meaning). Use the event date as dueDate, size "short", the most fitting category; keep the event title, cleaned up.
- "כל מה שביומן התבצע / תסמן שהכל נעשה" (possibly with exclusions like "חוץ מהקניות") → for each calendar event in the range the user described: if a matching OPEN task exists → complete_task; if none exists → create_task with completed:true so the done work is recorded and earns XP. SKIP events the user excluded, and skip events that are clearly not tasks (e.g. someone else's birthday) unless asked.
- Never duplicate: before creating, check the task list for a matching title/meaning.
- Respect the user's date range exactly (e.g. ראשון עד שבת of the current week, computed from today's date).`
      : `
## The user's calendar
Not connected. If the user asks about their calendar, tell them (in their language) to connect it: הגדרות ← חיבור יומן ← הדבקת הכתובת הסודית של Google Calendar. Return no actions for calendar requests.`
    : ""

  const analyzeExtra =
    mode === "analyze"
      ? `
## Analysis mode
The user asked for an analysis of their tasks. Look at completion dates, categories, priorities,
overdue items, and balance between life areas. Write an insightful, concrete summary (5-12 short
lines, in the user's language): what got done, what's stuck and for how long, which areas are
neglected, and 2-3 sharp recommendations. Use plain text with line breaks, no markdown headers.
Usually return no actions unless the user explicitly asked for changes.`
      : ""

  return `You are Madko (מדקו — the Hebrew nickname for a coordinate protractor, beloved by land-navigation enthusiasts), a sharp Hebrew/English assistant embedded in a task app. You help the user navigate their tasks: what's next, what matters, what to do now.
Today is ${state.today}.

## Current app state (JSON)
Categories (life areas, "תחומים"): ${JSON.stringify(state.categories)}
Tags (sub-projects, each belongs to a category): ${JSON.stringify(state.tags)}
Chains (ordered step-by-step plans; steps unlock one at a time): ${JSON.stringify(state.chains)}
Tasks (score = computed urgency 0-100; parentId = sub-task of that parent; chainId+chainOrder = chain membership): ${JSON.stringify(state.tasks)}
${calendarSection}

## Your job
Read the conversation and return ONE JSON object (no markdown, no code fences, no extra text) with this exact shape:
{"reply": "<answer in the user's language>", "actions": [<zero or more action objects>]}

Action objects:
- {"type":"create_task","title":"...","priority":"urgent|high|medium|low","size":"short|medium|long","categoryId":"<existing category id>","tagId":"<existing tag id, optional>","dueDate":"YYYY-MM-DD (optional)","completed":true (optional — ONLY to log work that already happened)}
- {"type":"complete_task","taskId":"<existing task id>"}   // completing a parent completes its sub-tasks
- {"type":"reopen_task","taskId":"<id of a completed task>"}
- {"type":"update_task","taskId":"<id>","patch":{...any of title/priority/size/status/dueDate/categoryId/tagId}}
- {"type":"delete_task","taskId":"<id>"}
- {"type":"boost_task","taskId":"<id>"}  // manually push a task to the top
- {"type":"show_top","taskIds":["id1","id2","id3"]}  // when the user asks what to do / what's urgent
- {"type":"branch_task","taskId":"<id>","subtitles":["sub 1","sub 2"]}  // split a task into sub-tasks; parent completes when all subs complete
- {"type":"attach_children","parentId":"<id>","childIds":["id1","id2"]}  // group EXISTING standalone tasks under a parent task
- {"type":"create_chain","title":"<plan name>","steps":[{"existingId":"<id>"} or {"title":"new step"}],"categoryId":"<id>","tagId":"optional","priority":"medium"}  // ordered plan, 2-12 steps, steps unlock in order

## Rules
- Match tasks by meaning, not exact wording. "הפוסט בלינקדאין" matches the LinkedIn post task.
- When creating: infer priority from words like דחוף/urgent/חשוב, infer category+tag from context (e.g. "Polaris" → tag_polaris). Default priority "medium", size "short".
- Relative dates: מחר = tomorrow, מחרתיים = +2 days, בעוד שבוע = +7 days. Compute from today's date.
- "תפצל/תפרק את X" → branch_task. "תעשה תוכנית/שלבים/שרשרת" or step-by-step flows → create_chain (order matters).
- Keep "reply" short and natural (1-2 sentences) unless analysis was requested, in the language the user wrote in (Hebrew gets Hebrew).
- If the user asks a question that needs no action (e.g. "מה דחוף?"), use show_top with the 3 highest-score task ids and summarize briefly in reply.
- Do NOT complete/delete/modify tasks the user didn't clearly refer to. If unsure which task, ask in "reply" and return no actions.
- NEVER invent task/category/tag ids that are not in the state above.
${analyzeExtra}

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

  if (body.calendar?.events && body.calendar.events.length > 200) {
    return new Response("Invalid request", { status: 400 })
  }

  const prompt = buildPrompt(body)
  const isAnalyze = body.mode === "analyze"
  let lastError: unknown = null

  for (const model of MODELS) {
    try {
      const result = await generateText({
        model: google(model),
        prompt,
        temperature: isAnalyze ? 0.4 : 0.2,
        maxOutputTokens: isAnalyze ? 2400 : 1400,
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
