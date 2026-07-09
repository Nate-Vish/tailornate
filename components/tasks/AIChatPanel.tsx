"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icon } from "./Icon"
import { ColorPill, PriorityPill, scoreColor } from "./pills"
import { useTasksStore, selectSortedActive } from "@/lib/tasks/store"
import { calcScore } from "@/lib/tasks/scoring"
import type { AIAction, AIResponse, AIRequestBody } from "@/lib/tasks/ai"
import type { Task } from "@/lib/tasks/types"

type ChatMsg =
  | { id: string; role: "user"; text: string; via?: "voice" }
  | { id: string; role: "ai"; text: string; results?: ActionResult[]; topIds?: string[] }

type ActionResult = {
  label: string
  kind: "created" | "completed" | "updated" | "deleted" | "boosted"
  taskId?: string
}

const uid = () => Math.random().toString(36).slice(2, 10)

const suggestions = [
  "מה הכי דחוף לי עכשיו?",
  "תוסיף משימה: לקנות מתנה למיטל, עד יום שישי",
  "סיימתי את הפוסט בלינקדאין",
]

// Minimal typing for the Web Speech API (not in TS DOM lib everywhere)
type SpeechRecognitionLike = {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null
  const w = window as unknown as Record<string, unknown>
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as
    | (new () => SpeechRecognitionLike)
    | null
}

export function AIChatPanel() {
  const aiOpen = useTasksStore((s) => s.aiOpen)
  const setAIOpen = useTasksStore((s) => s.setAIOpen)

  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: "welcome",
      role: "ai",
      text: "דבר חופשי — הוסף משימות, סמן שסיימת, שאל מה דחוף. אני מבין עברית ואנגלית.",
    },
  ])
  const [input, setInput] = useState("")
  const [thinking, setThinking] = useState(false)
  const [listening, setListening] = useState(false)
  const [speechAvailable, setSpeechAvailable] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  useEffect(() => {
    setSpeechAvailable(getSpeechRecognition() !== null)
  }, [])

  useEffect(() => {
    if (aiOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, aiOpen, thinking])

  const applyActions = useCallback((actions: AIAction[]): { results: ActionResult[]; topIds: string[] } => {
    const store = useTasksStore.getState()
    const results: ActionResult[] = []
    let topIds: string[] = []

    for (const action of actions) {
      switch (action.type) {
        case "create_task": {
          const validCategory = store.categories.some((c) => c.id === action.categoryId)
          const tag = action.tagId ? store.tags.find((t) => t.id === action.tagId) : undefined
          const task = store.addTask({
            title: action.title,
            priority: action.priority,
            size: action.size,
            status: "not_started",
            categoryId: validCategory
              ? action.categoryId
              : (tag?.categoryId ?? store.categories[0].id),
            tagId: tag?.id,
            dueDate: action.dueDate,
          })
          results.push({ label: task.title, kind: "created", taskId: task.id })
          break
        }
        case "complete_task": {
          const t = store.tasks.find((x) => x.id === action.taskId)
          if (t && t.status !== "completed") {
            store.toggleComplete(t.id)
            results.push({ label: t.title, kind: "completed", taskId: t.id })
          }
          break
        }
        case "update_task": {
          const t = store.tasks.find((x) => x.id === action.taskId)
          if (t) {
            const patch: Partial<Task> = {}
            if (action.patch.title) patch.title = action.patch.title
            if (action.patch.priority) patch.priority = action.patch.priority
            if (action.patch.size) patch.size = action.patch.size
            if (action.patch.status) patch.status = action.patch.status
            if (action.patch.dueDate !== undefined) patch.dueDate = action.patch.dueDate ?? undefined
            if (action.patch.categoryId) patch.categoryId = action.patch.categoryId
            if (action.patch.tagId !== undefined) patch.tagId = action.patch.tagId ?? undefined
            store.updateTask(t.id, patch)
            results.push({ label: t.title, kind: "updated", taskId: t.id })
          }
          break
        }
        case "delete_task": {
          const t = store.tasks.find((x) => x.id === action.taskId)
          if (t) {
            store.deleteTask(t.id)
            results.push({ label: t.title, kind: "deleted" })
          }
          break
        }
        case "boost_task": {
          const t = store.tasks.find((x) => x.id === action.taskId)
          if (t) {
            store.boostTask(t.id, "until_done", 100)
            results.push({ label: t.title, kind: "boosted", taskId: t.id })
          }
          break
        }
        case "show_top": {
          topIds = action.taskIds.filter((id) => store.tasks.some((t) => t.id === id))
          break
        }
      }
    }
    return { results, topIds }
  }, [])

  const send = useCallback(
    async (raw: string, via?: "voice") => {
      const text = raw.trim()
      if (!text || thinking) return

      const userMsg: ChatMsg = { id: uid(), role: "user", text, via }
      setMessages((prev) => [...prev, userMsg])
      setInput("")
      setThinking(true)

      try {
        const store = useTasksStore.getState()
        const sorted = selectSortedActive({ tasks: store.tasks, weights: store.weights })
        const recentDone = store.tasks
          .filter((t) => t.status === "completed")
          .slice(0, 10)

        const statePayload: AIRequestBody["state"] = {
          today: new Date().toISOString().slice(0, 10),
          categories: store.categories.map((c) => ({ id: c.id, name: `${c.name} / ${c.nameEn}` })),
          tags: store.tags.map((t) => ({ id: t.id, name: t.name, categoryId: t.categoryId })),
          tasks: [...sorted, ...recentDone].slice(0, 100).map((t) => ({
            id: t.id,
            title: t.title,
            priority: t.priority,
            size: t.size,
            status: t.status,
            categoryId: t.categoryId,
            tagId: t.tagId,
            dueDate: t.dueDate,
            score: calcScore(t, store.weights),
          })),
        }

        const history = [...messages, userMsg]
          .filter((m) => m.id !== "welcome")
          .slice(-10)
          .map((m) => ({ role: m.role === "user" ? ("user" as const) : ("assistant" as const), content: m.text }))

        const res = await fetch("/api/tasks-ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history, state: statePayload }),
        })

        const data = (await res.json()) as AIResponse
        const { results, topIds } = applyActions(data.actions ?? [])
        setMessages((prev) => [
          ...prev,
          { id: uid(), role: "ai", text: data.reply, results, topIds },
        ])
      } catch {
        setMessages((prev) => [
          ...prev,
          { id: uid(), role: "ai", text: "לא הצלחתי להתחבר. בדוק חיבור ונסה שוב." },
        ])
      } finally {
        setThinking(false)
      }
    },
    [messages, thinking, applyActions],
  )

  const toggleVoice = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop()
      return
    }
    const SR = getSpeechRecognition()
    if (!SR) return
    const rec = new SR()
    rec.lang = "he-IL"
    rec.interimResults = false
    rec.maxAlternatives = 1
    rec.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript
      if (transcript) send(transcript, "voice")
    }
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    recognitionRef.current = rec
    setListening(true)
    rec.start()
  }, [listening, send])

  return (
    <AnimatePresence>
      {aiOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 bg-black/25"
            onClick={() => setAIOpen(false)}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-40 flex max-h-[85%] flex-col overflow-hidden rounded-t-2xl border-t border-border bg-card"
          >
            <div className="flex justify-center py-2">
              <div className="h-1 w-9 rounded-full bg-border" />
            </div>
            <div className="flex items-center justify-between px-4 pb-2">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full"
                  style={{
                    background: "color-mix(in srgb, var(--accent) 14%, transparent)",
                    color: "var(--accent)",
                  }}
                >
                  <Icon name="sparkles" size={15} />
                </div>
                <div>
                  <p className="text-[14px] font-semibold leading-tight text-foreground">מה לעשות?</p>
                  <p className="text-[10px] leading-tight text-muted-foreground">
                    דבר חופשי. אני אטפל.
                  </p>
                </div>
              </div>
              <button
                aria-label="סגור"
                onClick={() => setAIOpen(false)}
                className="text-muted-foreground"
              >
                <Icon name="x" size={16} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
              {messages.map((m) => (
                <MessageBubble key={m.id} msg={m} />
              ))}
              {thinking && (
                <div className="flex justify-end">
                  <div className="flex items-center gap-1.5 rounded-2xl bg-[var(--muted)] px-3 py-2 text-[13px] text-muted-foreground">
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                    >
                      חושב…
                    </motion.span>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border bg-[var(--muted)] px-3 py-2.5">
              <div className="mb-2 flex gap-1.5 overflow-x-auto pb-0.5">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="shrink-0 rounded-full bg-card px-3 py-1 text-[11px] text-foreground transition-colors hover:bg-[var(--card-hover)]"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send(input)}
                  placeholder={listening ? "מקשיב…" : "כתוב או דבר…"}
                  className="min-w-0 flex-1 rounded-full border border-border bg-card px-3 py-2 text-[13px] text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-[var(--accent)]"
                />
                {speechAvailable && (
                  <button
                    aria-label={listening ? "עצור הקלטה" : "דבר"}
                    onClick={toggleVoice}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-transform active:scale-95"
                    style={{ background: listening ? "var(--danger)" : "var(--accent)" }}
                  >
                    {listening ? (
                      <motion.div
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ repeat: Infinity, duration: 0.9 }}
                      >
                        <Icon name="mic" size={18} />
                      </motion.div>
                    ) : (
                      <Icon name="mic" size={18} />
                    )}
                  </button>
                )}
                <button
                  aria-label="שלח"
                  onClick={() => send(input)}
                  disabled={!input.trim() || thinking}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-[var(--card-hover)] disabled:opacity-40"
                >
                  <Icon name="send" size={16} className="-scale-x-100" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

const kindLabel: Record<ActionResult["kind"], string> = {
  created: "נוסף",
  completed: "הושלם",
  updated: "עודכן",
  deleted: "נמחק",
  boosted: "הוקפץ",
}

const kindColor: Record<ActionResult["kind"], string> = {
  created: "var(--success)",
  completed: "var(--success)",
  updated: "var(--accent)",
  deleted: "var(--danger)",
  boosted: "var(--warning)",
}

function MessageBubble({ msg }: { msg: ChatMsg }) {
  const tasks = useTasksStore((s) => s.tasks)
  const tags = useTasksStore((s) => s.tags)
  const categories = useTasksStore((s) => s.categories)
  const weights = useTasksStore((s) => s.weights)

  if (msg.role === "user") {
    return (
      <div className="flex justify-start">
        <div
          className="flex max-w-[80%] items-center gap-2 rounded-2xl rounded-bl-md px-3 py-2 text-[13px] leading-relaxed"
          style={{
            background: "color-mix(in srgb, var(--accent) 14%, transparent)",
            color: "var(--foreground)",
          }}
        >
          {msg.via === "voice" && <Icon name="mic" size={13} className="shrink-0 opacity-60" />}
          <span>{msg.text}</span>
        </div>
      </div>
    )
  }

  const topTasks = (msg.topIds ?? [])
    .map((id) => tasks.find((t) => t.id === id))
    .filter((t): t is Task => !!t)

  return (
    <div className="flex justify-end">
      <div className="max-w-[90%] space-y-2 rounded-2xl rounded-br-md bg-[var(--muted)] px-3 py-2.5">
        <p className="text-[13px] leading-relaxed text-foreground">{msg.text}</p>

        {msg.results && msg.results.length > 0 && (
          <div className="space-y-1.5">
            {msg.results.map((r, i) => {
              const t = r.taskId ? tasks.find((x) => x.id === r.taskId) : undefined
              const tag = t?.tagId ? tags.find((x) => x.id === t.tagId) : undefined
              const cat = t ? categories.find((x) => x.id === t.categoryId) : undefined
              return (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-2"
                  style={
                    t
                      ? {
                          borderInlineEndWidth: 3,
                          borderInlineEndColor: tag?.color ?? cat?.color ?? "var(--border)",
                        }
                      : undefined
                  }
                >
                  <span
                    className="rounded-full px-2 py-[1px] text-[10px] font-medium"
                    style={{
                      background: `color-mix(in srgb, ${kindColor[r.kind]} 14%, transparent)`,
                      color: kindColor[r.kind],
                    }}
                  >
                    {kindLabel[r.kind]}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[12px] text-foreground">{r.label}</span>
                  {t && <PriorityPill priority={t.priority} />}
                </div>
              )
            })}
          </div>
        )}

        {topTasks.length > 0 && (
          <div className="space-y-1.5">
            {topTasks.map((t) => {
              const tag = t.tagId ? tags.find((x) => x.id === t.tagId) : undefined
              const cat = categories.find((x) => x.id === t.categoryId)
              const score = calcScore(t, weights)
              return (
                <div
                  key={t.id}
                  className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-2"
                  style={{
                    borderInlineEndWidth: 3,
                    borderInlineEndColor: tag?.color ?? cat?.color ?? "var(--border)",
                  }}
                >
                  <span className="text-[14px] font-semibold" style={{ color: scoreColor(score) }}>
                    {score}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[12px] text-foreground">{t.title}</span>
                  {tag ? (
                    <ColorPill label={tag.name} color={tag.color} />
                  ) : cat ? (
                    <ColorPill label={cat.name} color={cat.color} />
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
