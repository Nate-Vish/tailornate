"use client"

import { useMemo } from "react"
import { clsx } from "clsx"
import { useTasksStore } from "@/lib/tasks/store"
import {
  weekDates,
  tasksDueOn,
  undatedActive,
  todayLocalISO,
  weekdayIndex,
  ddmm,
  HE_WEEKDAYS_LONG,
} from "@/lib/tasks/calendar"
import { calcScore } from "@/lib/tasks/scoring"
import { Icon } from "./Icon"
import { PriorityPill, ColorPill, scoreColor } from "./pills"
import type { Task } from "@/lib/tasks/types"

function AgendaRow({ task, onActions }: { task: Task; onActions: (t: Task) => void }) {
  const tags = useTasksStore((s) => s.tags)
  const categories = useTasksStore((s) => s.categories)
  const weights = useTasksStore((s) => s.weights)
  const toggleComplete = useTasksStore((s) => s.toggleComplete)
  const tag = task.tagId ? tags.find((x) => x.id === task.tagId) : undefined
  const cat = categories.find((c) => c.id === task.categoryId)
  const color = tag?.color ?? cat?.color ?? "var(--muted-foreground)"
  const score = calcScore(task, weights)

  return (
    <div
      className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-2.5 py-2"
      style={{ borderInlineEndWidth: 3, borderInlineEndColor: color }}
    >
      <button
        onClick={() => toggleComplete(task.id)}
        aria-label="סמן כהושלם"
        className="h-[18px] w-[18px] shrink-0 rounded-full border-2 border-border transition-colors hover:border-[var(--success)]"
      />
      <button onClick={() => onActions(task)} className="min-w-0 flex-1 truncate text-start text-[13px] text-foreground">
        {task.title}
      </button>
      {tag ? <ColorPill label={tag.name} color={tag.color} /> : cat ? <ColorPill label={cat.name} color={cat.color} /> : null}
      <PriorityPill priority={task.priority} />
      <span className="text-[13px] font-semibold" style={{ color: scoreColor(score) }}>
        {score}
      </span>
    </div>
  )
}

export function WeekView({ onActions }: { onActions: (task: Task) => void }) {
  const tasks = useTasksStore((s) => s.tasks)
  const weights = useTasksStore((s) => s.weights)
  const today = todayLocalISO()
  const days = useMemo(() => weekDates(today), [today])
  const undated = useMemo(
    () =>
      undatedActive(tasks)
        .map((t) => ({ t, s: calcScore(t, weights) }))
        .sort((a, b) => b.s - a.s)
        .map((x) => x.t),
    [tasks, weights],
  )

  return (
    <div className="px-4 pb-4">
      <div className="space-y-3">
        {days.map((iso) => {
          const dayTasks = tasksDueOn(tasks, iso)
          const isToday = iso === today
          return (
            <div key={iso}>
              <div className="mb-1.5 flex items-center gap-2">
                <span
                  className={clsx("text-[13px] font-medium", isToday ? "text-[var(--accent)]" : "text-foreground")}
                >
                  {HE_WEEKDAYS_LONG[weekdayIndex(iso)]}
                </span>
                <span className="text-[11px] text-muted-foreground">{ddmm(iso)}</span>
                {isToday && (
                  <span
                    className="rounded-full px-2 py-[1px] text-[10px] font-medium"
                    style={{ background: "color-mix(in srgb, var(--accent) 14%, transparent)", color: "var(--accent)" }}
                  >
                    היום
                  </span>
                )}
                <div className="h-px flex-1 bg-border" />
                {dayTasks.length > 0 && (
                  <span className="text-[11px] text-muted-foreground">{dayTasks.length}</span>
                )}
              </div>
              {dayTasks.length ? (
                <div className="space-y-1.5">
                  {dayTasks.map((t) => (
                    <AgendaRow key={t.id} task={t} onActions={onActions} />
                  ))}
                </div>
              ) : (
                <p className="px-1 py-1 text-[11px] text-muted-foreground/70">— פנוי —</p>
              )}
            </div>
          )
        })}
      </div>

      {undated.length > 0 && (
        <div className="mt-6 border-t border-border pt-4">
          <div className="mb-2 flex items-center gap-1.5">
            <Icon name="calendar-clock" size={14} className="text-muted-foreground" />
            <span className="text-[13px] font-medium text-foreground">ללא תאריך ({undated.length})</span>
          </div>
          <p className="mb-2 text-[11px] leading-snug text-muted-foreground">
            משימות גמישות — גרור אותן ליום בלוח החודש, או שהתכנון החכם ישבץ.
          </p>
          <div className="space-y-1.5">
            {undated.map((t) => (
              <AgendaRow key={t.id} task={t} onActions={onActions} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
