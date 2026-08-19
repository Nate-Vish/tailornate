"use client"

import { useMemo } from "react"
import { Icon } from "./Icon"
import { cvar } from "./pills"
import { useTasksStore } from "@/lib/tasks/store"
import { minutesOfDay } from "@/lib/tasks/planner"
import type { PlanState } from "./usePlan"
import type { Task } from "@/lib/tasks/types"

const ROW = 54 // pixels per hour
const START_HOUR = 8
const END_HOUR = 22

/**
 * The day on the clock: fixed commitments, the engine's placement of everything
 * else, and the gaps between them. This is the "depth" view — the home screen
 * stays calm, and this is one tap away when you want to see the shape of the day.
 */
export function DayTimeline({
  state,
  onActions,
}: {
  state: PlanState
  onActions: (task: Task) => void
}) {
  const tasks = useTasksStore((s) => s.tasks)
  const categories = useTasksStore((s) => s.categories)
  const tags = useTasksStore((s) => s.tags)

  const byId = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks])
  const hours = useMemo(
    () => Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i),
    [],
  )

  if (!state.ready) {
    return <div className="px-4 py-10 text-center text-[12px] text-muted-foreground">רגע…</div>
  }

  const { plan, now } = state
  const nowMin = minutesOfDay(now)
  const inWindow = nowMin >= START_HOUR * 60 && nowMin <= END_HOUR * 60
  const top = (min: number) => ((min - START_HOUR * 60) / 60) * ROW

  const colorFor = (task: Task) =>
    (task.tagId ? tags.find((x) => x.id === task.tagId)?.color : undefined) ??
    categories.find((c) => c.id === task.categoryId)?.color ??
    "var(--accent)"

  return (
    <div className="px-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[12px] text-muted-foreground">
          {Math.round(plan.plannedMinutes / 6) / 10} שעות מתוכננות · {Math.round(plan.freeMinutes / 6) / 10} פנויות
        </p>
        <p className="text-[11px] text-muted-foreground">שובץ אוטומטית</p>
      </div>

      <div className="relative" style={{ height: (END_HOUR - START_HOUR) * ROW + 16 }}>
        {/* hour grid */}
        {hours.map((h) => (
          <div
            key={h}
            className="absolute inset-x-0 flex items-start gap-2"
            style={{ top: top(h * 60) }}
          >
            <span className="w-9 shrink-0 pt-[1px] text-[10px] tabular-nums text-muted-foreground">
              {String(h).padStart(2, "0")}:00
            </span>
            <span className="mt-[7px] h-px flex-1 bg-border" />
          </div>
        ))}

        {/* placed work */}
        {plan.blocks.map((b) => {
          const task = byId.get(b.taskId)
          if (!task) return null
          const color = colorFor(task)
          const height = Math.max(22, ((b.end - b.start) / 60) * ROW - 3)
          return (
            <button
              key={b.taskId}
              onClick={() => onActions(task)}
              className="absolute overflow-hidden rounded-lg border px-2 py-1 text-start transition-transform active:scale-[0.99]"
              style={{
                top: top(b.start),
                height,
                insetInlineStart: 46,
                insetInlineEnd: 0,
                borderColor: b.fixed ? color : "var(--border)",
                background: b.fixed
                  ? `color-mix(in srgb, ${color} 18%, var(--card))`
                  : "var(--card)",
                borderInlineStartWidth: 3,
                borderInlineStartColor: color,
                ...cvar(color),
              }}
            >
              <span className="flex items-center gap-1.5">
                {b.fixed && <Icon name="lock" size={10} className="shrink-0 opacity-60" />}
                {task.habit && <Icon name="flame" size={10} className="shrink-0 opacity-70" />}
                <span className="truncate text-[12px] font-medium text-foreground">{task.title}</span>
              </span>
              {height > 34 && (
                <span className="mt-0.5 block text-[10px] tabular-nums text-muted-foreground">
                  {fmt(b.start)}–{fmt(b.end)}
                </span>
              )}
            </button>
          )
        })}

        {/* where you are right now */}
        {inWindow && (
          <div
            className="pointer-events-none absolute inset-x-0 z-10 flex items-center gap-1"
            style={{ top: top(nowMin) }}
          >
            <span className="w-9 shrink-0" />
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--danger)" }}
            />
            <span className="h-px flex-1" style={{ background: "var(--danger)" }} />
          </div>
        )}
      </div>

      {plan.unplaced.length > 0 && (
        <div className="mt-3 rounded-xl border border-dashed border-border p-3">
          <p className="mb-2 text-[11.5px] text-muted-foreground">
            לא נכנס להיום ({plan.unplaced.length}) — אפשר להזיז למחר
          </p>
          <div className="flex flex-wrap gap-1.5">
            {plan.unplaced.slice(0, 8).map((u) => {
              const task = byId.get(u.taskId)
              if (!task) return null
              return (
                <button
                  key={u.taskId}
                  onClick={() => onActions(task)}
                  className="rounded-full border border-border px-2.5 py-1 text-[11px] text-foreground"
                >
                  {task.title}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function fmt(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}
