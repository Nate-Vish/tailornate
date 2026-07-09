"use client"

import { useMemo } from "react"
import { Icon } from "./Icon"
import { ColorPill, scoreColor } from "./pills"
import { useTasksStore, selectSortedActive } from "@/lib/tasks/store"
import { calcScore } from "@/lib/tasks/scoring"
import type { Weights } from "@/lib/tasks/types"

const rows: { key: keyof Weights; label: string; color: string; icon: string }[] = [
  { key: "priority", label: "דחיפות", color: "var(--danger)", icon: "flame" },
  { key: "deadline", label: "קרבת דדליין", color: "#2f6da8", icon: "calendar-clock" },
  { key: "status", label: "סטטוס (בונוס לבתהליך)", color: "var(--success)", icon: "zap" },
  { key: "size", label: "גודל (בונוס לקצרה)", color: "var(--warning)", icon: "sparkles" },
]

export function SettingsView() {
  const weights = useTasksStore((s) => s.weights)
  const setWeights = useTasksStore((s) => s.setWeights)
  const resetWeights = useTasksStore((s) => s.resetWeights)
  const tasks = useTasksStore((s) => s.tasks)
  const tags = useTasksStore((s) => s.tags)
  const categories = useTasksStore((s) => s.categories)

  const top3 = useMemo(
    () => selectSortedActive({ tasks, weights }).slice(0, 3),
    [tasks, weights],
  )

  const update = (key: keyof Weights, value: number) => {
    const others = rows.filter((r) => r.key !== key)
    const otherSum = others.reduce((sum, r) => sum + weights[r.key], 0)
    if (otherSum === 0) return
    const remaining = 100 - value
    const next: Weights = { ...weights, [key]: value }
    others.forEach((r) => {
      next[r.key] = Math.round((weights[r.key] / otherSum) * remaining)
    })
    const drift = 100 - (next.priority + next.deadline + next.status + next.size)
    next[others[0].key] += drift
    setWeights(next)
  }

  return (
    <div className="pb-28">
      <header className="flex items-center gap-2 px-4 py-4">
        <div className="flex-1">
          <p className="text-[11px] text-muted-foreground">הגדרות</p>
          <h1 className="text-[18px] font-semibold text-foreground">דירוג חכם</h1>
        </div>
        <button
          onClick={resetWeights}
          className="flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-[var(--card-hover)] hover:text-foreground"
        >
          <Icon name="reset" size={12} />
          איפוס
        </button>
      </header>

      <div
        className="mx-4 mb-4 flex items-start gap-2 rounded-lg px-3 py-2.5"
        style={{ background: "color-mix(in srgb, var(--accent) 10%, transparent)" }}
      >
        <Icon name="lightbulb" size={16} className="mt-0.5 shrink-0" />
        <p className="text-[12px] leading-snug text-foreground">
          הציון של כל משימה מחושב מ-4 גורמים. שנה את המשקולות לפי איך שאתה חושב — הרשימה תסתדר מחדש מיד.
        </p>
      </div>

      <div className="px-4">
        <p className="mb-3 text-[12px] text-muted-foreground">משקולות (סה&quot;כ 100%)</p>
        <div className="space-y-4">
          {rows.map((r) => (
            <div key={r.key}>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5" style={{ color: r.color }}>
                  <Icon name={r.icon} size={14} />
                  <span className="text-[13px] font-medium text-foreground">{r.label}</span>
                </div>
                <span className="text-[13px] font-semibold" style={{ color: r.color }}>
                  {weights[r.key]}%
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={70}
                step={1}
                value={weights[r.key]}
                onChange={(e) => update(r.key, Number(e.target.value))}
                className="w-full"
                style={{ accentColor: r.color }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 border-t border-border px-4 pt-4">
        <p className="mb-3 text-[13px] font-medium text-foreground">תצוגה מקדימה — הכי דחוף עכשיו</p>
        <div className="space-y-2">
          {top3.map((t) => {
            const tag = t.tagId ? tags.find((x) => x.id === t.tagId) : null
            const cat = categories.find((x) => x.id === t.categoryId)
            const stripe = tag?.color ?? cat?.color ?? "var(--muted-foreground)"
            const score = calcScore(t, weights)
            return (
              <div
                key={t.id}
                className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5"
                style={{ borderInlineEndWidth: 3, borderInlineEndColor: stripe }}
              >
                <span className="text-[16px] font-semibold" style={{ color: scoreColor(score) }}>
                  {score}
                </span>
                <span className="flex-1 text-[13px] text-foreground">{t.title}</span>
                {tag && <ColorPill label={tag.name} color={tag.color} />}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
