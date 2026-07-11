"use client"

import { useMemo, useState } from "react"
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import { AnimatePresence, motion } from "framer-motion"
import {
  useTasksStore,
  selectTodayList,
  selectDoneToday,
  taskXP,
  todayISO,
  isSnoozed,
} from "@/lib/tasks/store"
import { calcScore, formatRelativeDue } from "@/lib/tasks/scoring"
import { tipOfTheDay } from "@/lib/tasks/tips"
import { TaskCard } from "./TaskCard"
import { SquadStrip } from "./SquadStrip"
import { WeekView } from "./WeekView"
import { MonthView } from "./MonthView"
import { Icon } from "./Icon"
import { PriorityPill, ColorPill, scoreColor, cvar } from "./pills"
import type { Task } from "@/lib/tasks/types"

function greeting(): string {
  const h = new Date().getHours()
  if (h < 5) return "לילה טוב"
  if (h < 12) return "בוקר טוב"
  if (h < 18) return "צהריים טובים"
  return "ערב טוב"
}

function tomorrowISO(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

// The hero: the single next task, big and unmissable, with one-tap actions.
function NextTaskCard({ task, onActions }: { task: Task; onActions: (t: Task) => void }) {
  const weights = useTasksStore((s) => s.weights)
  const tags = useTasksStore((s) => s.tags)
  const categories = useTasksStore((s) => s.categories)
  const toggleComplete = useTasksStore((s) => s.toggleComplete)
  const snoozeTask = useTasksStore((s) => s.snoozeTask)
  const [dateOpen, setDateOpen] = useState(false)

  const score = calcScore(task, weights)
  const tag = task.tagId ? tags.find((t) => t.id === task.tagId) : undefined
  const category = categories.find((c) => c.id === task.categoryId)
  const stripeColor = tag?.color ?? category?.color ?? "var(--accent)"
  const due = formatRelativeDue(task.dueDate)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="cstripe rounded-2xl border border-border bg-card p-4"
      style={{ borderInlineEndWidth: 4, ...cvar(stripeColor) }}
    >
      <div className="mb-1 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--accent)]">
          <Icon name="compass" size={13} />
          הבא בתור
        </p>
        <span className="text-[18px] font-semibold leading-none" style={{ color: scoreColor(score) }}>
          {score}
        </span>
      </div>

      <div className="flex items-start gap-3">
        <button
          onClick={() => toggleComplete(task.id)}
          aria-label="סמן כהושלם"
          className="mt-1 h-[26px] w-[26px] shrink-0 rounded-full border-2 border-border transition-colors hover:border-[var(--success)]"
        />
        <div className="min-w-0 flex-1">
          <button onClick={() => onActions(task)} className="block w-full text-start">
            <p className="text-[17px] font-semibold leading-snug text-foreground">{task.title}</p>
          </button>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <PriorityPill priority={task.priority} />
            {tag && <ColorPill label={tag.name} color={tag.color} />}
            {!tag && category && <ColorPill label={category.name} color={category.color} />}
            {due && <span className="text-[11px] text-muted-foreground">· {due}</span>}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-2.5">
        <button
          onClick={() => snoozeTask(task.id, tomorrowISO())}
          className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <Icon name="clock" size={12} />
          דחה למחר
        </button>
        {dateOpen ? (
          <input
            type="date"
            autoFocus
            min={todayISO()}
            onChange={(e) => {
              if (e.target.value) snoozeTask(task.id, e.target.value)
              setDateOpen(false)
            }}
            className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-foreground outline-none"
          />
        ) : (
          <button
            onClick={() => setDateOpen(true)}
            className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <Icon name="calendar-clock" size={12} />
            לתאריך…
          </button>
        )}
        <div className="flex-1" />
        <button
          onClick={() => onActions(task)}
          aria-label="עוד פעולות"
          className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:bg-[var(--card-hover)] hover:text-foreground"
        >
          <Icon name="more" size={16} />
        </button>
      </div>
    </motion.div>
  )
}

function SnoozedStrip() {
  const tasks = useTasksStore((s) => s.tasks)
  const snoozeTask = useTasksStore((s) => s.snoozeTask)
  const [open, setOpen] = useState(false)
  const snoozed = tasks.filter((t) => t.status !== "completed" && isSnoozed(t))
  if (snoozed.length === 0) return null

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground"
      >
        <Icon name="clock" size={13} />
        נדחו ({snoozed.length})
        <Icon name={open ? "chevron-up" : "chevron-down"} size={12} />
      </button>
      {open && (
        <div className="mt-2 space-y-1.5">
          {snoozed.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2 opacity-70"
            >
              <span className="min-w-0 flex-1 truncate text-[13px] text-muted-foreground">{t.title}</span>
              <span className="text-[10px] text-muted-foreground">
                עד {t.snoozedUntil!.slice(5).split("-").reverse().join(".")}
              </span>
              <button
                onClick={() => snoozeTask(t.id, null)}
                className="shrink-0 text-[11px] text-[var(--accent)] underline"
              >
                החזר
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DoneTodayStrip() {
  const tasks = useTasksStore((s) => s.tasks)
  const toggleComplete = useTasksStore((s) => s.toggleComplete)
  const doneToday = useMemo(() => selectDoneToday({ tasks }), [tasks])
  if (doneToday.length === 0) return null
  const xp = doneToday.reduce((sum, t) => sum + taskXP(t), 0)

  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[13px] font-medium text-foreground">
          <span style={{ color: "var(--success)" }}>
            <Icon name="check-check" size={15} />
          </span>
          בוצע היום ({doneToday.length})
        </p>
        <span className="text-[11px] font-medium" style={{ color: "var(--success)" }}>
          +{xp} XP
        </span>
      </div>
      <div className="space-y-1.5">
        {doneToday.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2 opacity-55"
          >
            <button
              onClick={() => toggleComplete(t.id)}
              aria-label="בטל השלמה"
              className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-white"
              style={{ background: "var(--success)" }}
            >
              <Icon name="check" size={11} />
            </button>
            <span className="min-w-0 flex-1 truncate text-[13px] text-muted-foreground line-through">
              {t.title}
            </span>
            <span className="text-[10px] text-muted-foreground">+{taskXP(t)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// The day dashboard: hero, squad, the ranked "later" list, snoozed, done-today.
function DayBody({ onActions }: { onActions: (task: Task) => void }) {
  const tasks = useTasksStore((s) => s.tasks)
  const weights = useTasksStore((s) => s.weights)
  const boostTask = useTasksStore((s) => s.boostTask)

  const active = useMemo(() => selectTodayList({ tasks, weights }), [tasks, weights])
  const hero = active[0]
  const rest = useMemo(() => active.slice(1, 7), [active])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  function handleDragEnd(e: DragEndEvent) {
    const { active: a, over } = e
    if (!over || a.id === over.id) return
    const oldIndex = rest.findIndex((t) => t.id === a.id)
    const newIndex = rest.findIndex((t) => t.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const reordered = arrayMove(rest, oldIndex, newIndex)
    const moved = reordered[newIndex]
    const neighborAbove = reordered[newIndex - 1]
    if (neighborAbove) {
      boostTask(moved.id, "until_done", calcScore(neighborAbove, weights) + 1)
    } else if (hero) {
      boostTask(moved.id, "until_done", calcScore(hero, weights) + 1)
    }
  }

  return (
    <>
      <div className="px-4">
        {hero ? (
          <NextTaskCard task={hero} onActions={onActions} />
        ) : (
          <p className="rounded-2xl bg-[var(--muted)] px-3 py-8 text-center text-[13px] text-muted-foreground">
            אין משימות פתוחות. תיהנה מהשקט — או תוסיף אחת ב-＋
          </p>
        )}
      </div>

      <div className="py-4">
        <SquadStrip />
      </div>

      {rest.length > 0 && (
        <div className="border-t border-border px-4 pb-2 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[14px] font-medium text-foreground">אחר כך</p>
            <span className="text-[11px] text-muted-foreground">ממוין לפי ציון חכם</span>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={rest.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <AnimatePresence initial={false}>
                <div className="space-y-2">
                  {rest.map((t) => (
                    <TaskCard key={t.id} task={t} onActions={onActions} />
                  ))}
                </div>
              </AnimatePresence>
            </SortableContext>
          </DndContext>
        </div>
      )}

      <div className="px-4">
        <SnoozedStrip />
        <DoneTodayStrip />
      </div>
    </>
  )
}

export function TodayView({ onActions }: { onActions: (task: Task) => void }) {
  const [span, setSpan] = useState<"day" | "week" | "month">("day")

  return (
    <div className="pb-32">
      <header className="px-4 pb-2 pt-5">
        <p className="text-[11px] text-muted-foreground">{greeting()}, נתן</p>
        <h1 className="mt-0.5 text-[19px] font-semibold text-foreground">המצפן שלי</h1>
        <p className="mt-1.5 flex items-start gap-1.5 text-[12px] leading-snug text-muted-foreground">
          <Icon name="lightbulb" size={13} className="mt-0.5 shrink-0 text-[var(--accent)]" />
          {tipOfTheDay(todayISO())}
        </p>
      </header>

      <div className="px-4 pb-3 pt-1">
        <div className="flex rounded-lg bg-[var(--muted)] p-[3px]">
          {(["day", "week", "month"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setSpan(v)}
              className={
                span === v
                  ? "flex-1 rounded-md bg-card py-[7px] text-[13px] font-medium text-foreground shadow-sm"
                  : "flex-1 py-[7px] text-[13px] text-muted-foreground"
              }
            >
              {v === "day" ? "יום" : v === "week" ? "שבוע" : "חודש"}
            </button>
          ))}
        </div>
      </div>

      {span === "day" && <DayBody onActions={onActions} />}
      {span === "week" && <WeekView onActions={onActions} />}
      {span === "month" && <MonthView onActions={onActions} />}
    </div>
  )
}
