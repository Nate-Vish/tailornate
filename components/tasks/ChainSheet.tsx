"use client"

import { useState } from "react"
import { Icon } from "./Icon"
import { cvar } from "./pills"
import { Sheet } from "./Sheet"
import { useTasksStore, type ChainStepInput } from "@/lib/tasks/store"
import type { Task } from "@/lib/tasks/types"

type StepItem = { key: string; existingId?: string; title?: string; label: string }

// Build an ordered chain: mix existing tasks and new steps. Steps unlock one
// at a time — only the current step shows up in "Today".
export function ChainSheet({ fromTask, onClose }: { fromTask?: Task; onClose: () => void }) {
  const createChain = useTasksStore((s) => s.createChain)
  const tasks = useTasksStore((s) => s.tasks)
  const categories = useTasksStore((s) => s.categories)

  const [title, setTitle] = useState("")
  const [steps, setSteps] = useState<StepItem[]>(
    fromTask ? [{ key: fromTask.id, existingId: fromTask.id, label: fromTask.title }] : [],
  )
  const [newStep, setNewStep] = useState("")
  const [categoryId, setCategoryId] = useState(fromTask?.categoryId ?? categories[0]?.id ?? "")

  const usedIds = new Set(steps.filter((s) => s.existingId).map((s) => s.existingId))
  const addable = tasks.filter(
    (t) =>
      !usedIds.has(t.id) &&
      !t.chainId &&
      !t.parentId &&
      t.status !== "completed" &&
      !tasks.some((x) => x.parentId === t.id),
  )

  const addExisting = (id: string) => {
    const t = tasks.find((x) => x.id === id)
    if (!t) return
    setSteps((prev) => [...prev, { key: t.id, existingId: t.id, label: t.title }])
  }

  const addNew = () => {
    const text = newStep.trim()
    if (!text) return
    setSteps((prev) => [...prev, { key: `new_${Date.now()}_${prev.length}`, title: text, label: text }])
    setNewStep("")
  }

  const move = (i: number, dir: -1 | 1) => {
    setSteps((prev) => {
      const j = i + dir
      if (j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }

  const submit = () => {
    const inputs: ChainStepInput[] = steps.map((s) =>
      s.existingId ? { existingId: s.existingId } : { title: s.title },
    )
    const first = steps.find((s) => s.existingId)
    const firstTask = first ? tasks.find((t) => t.id === first.existingId) : undefined
    const id = createChain(title, inputs, {
      categoryId: firstTask?.categoryId ?? categoryId,
      tagId: firstTask?.tagId,
      priority: firstTask?.priority ?? "medium",
    })
    if (id) onClose()
  }

  return (
    <Sheet title={fromTask ? `שרשרת מ: ${fromTask.title}` : "שרשרת חדשה"} onClose={onClose}>
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="שם השרשרת (למשל: מכירת הרכב)"
        className="w-full rounded-lg border border-border bg-background px-3 py-3 text-[14px] text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-[var(--accent)]"
      />

      <p className="mb-1.5 mt-4 text-[11px] text-muted-foreground">
        שלבים לפי סדר — שלב נפתח רק אחרי שהקודם הושלם
      </p>

      <div className="space-y-1.5">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-2">
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
              style={{ background: "var(--accent)" }}
            >
              {i + 1}
            </span>
            <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">
              {s.label}
              {!s.existingId && <span className="ms-1 text-[10px] text-muted-foreground">(חדשה)</span>}
            </span>
            <button aria-label="הזז למעלה" onClick={() => move(i, -1)} disabled={i === 0} className="text-muted-foreground/60 disabled:opacity-30">
              <Icon name="chevron-up" size={14} />
            </button>
            <button aria-label="הזז למטה" onClick={() => move(i, 1)} disabled={i === steps.length - 1} className="text-muted-foreground/60 disabled:opacity-30">
              <Icon name="chevron-down" size={14} />
            </button>
            <button
              aria-label="הסר שלב"
              onClick={() => setSteps((prev) => prev.filter((_, j) => j !== i))}
              className="text-muted-foreground/60 hover:text-foreground"
            >
              <Icon name="x" size={14} />
            </button>
          </div>
        ))}
        {steps.length === 0 && (
          <p className="rounded-lg bg-[var(--muted)] px-3 py-3 text-center text-[12px] text-muted-foreground">
            הוסף לפחות שני שלבים
          </p>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          value={newStep}
          onChange={(e) => setNewStep(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addNew()}
          placeholder="שלב חדש…"
          className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-[13px] text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-[var(--accent)]"
        />
        <button
          onClick={addNew}
          disabled={!newStep.trim()}
          aria-label="הוסף שלב"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-[var(--card-hover)] disabled:opacity-40"
        >
          <Icon name="plus" size={16} />
        </button>
      </div>

      {addable.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-[11px] text-muted-foreground">או צרף משימה קיימת:</p>
          <div className="flex flex-wrap gap-1.5">
            {addable.slice(0, 12).map((t) => (
              <button
                key={t.id}
                onClick={() => addExisting(t.id)}
                className="max-w-full truncate rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground transition-colors hover:border-[var(--accent)] hover:text-foreground"
              >
                + {t.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {steps.every((s) => !s.existingId) && steps.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-[11px] text-muted-foreground">תחום לשלבים החדשים</p>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryId(c.id)}
                className={`shrink-0 rounded-full border px-3 py-1 text-[12px] transition-colors ${categoryId === c.id ? "cchip-on" : "cchip"}`}
                style={cvar(c.color)}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={submit}
        disabled={steps.length < 2 || !title.trim()}
        className="mt-5 w-full rounded-lg py-3 text-[14px] font-medium text-[var(--background)] transition-opacity hover:opacity-90 disabled:opacity-40"
        style={{ background: "var(--accent)" }}
      >
        צור שרשרת ({steps.length} שלבים)
      </button>
    </Sheet>
  )
}
