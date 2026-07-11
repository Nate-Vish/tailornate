"use client"

import { useMemo, useState } from "react"
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { useTasksStore } from "@/lib/tasks/store"
import {
  monthCells,
  tasksDueOn,
  todayLocalISO,
  isoOf,
  HE_WEEKDAYS_SHORT,
  HE_MONTHS,
} from "@/lib/tasks/calendar"
import { Icon } from "./Icon"
import { PriorityPill } from "./pills"
import type { Task } from "@/lib/tasks/types"

// tag color if present, else category color — same rule as TaskCard.
function useColorOf() {
  const tags = useTasksStore((s) => s.tags)
  const categories = useTasksStore((s) => s.categories)
  return (t: Task): string => {
    const tag = t.tagId ? tags.find((x) => x.id === t.tagId) : undefined
    if (tag) return tag.color
    return categories.find((c) => c.id === t.categoryId)?.color ?? "var(--muted-foreground)"
  }
}

function distinctColors(tasks: Task[], colorOf: (t: Task) => string): string[] {
  const seen: string[] = []
  for (const t of tasks) {
    const c = colorOf(t)
    if (!seen.includes(c)) seen.push(c)
  }
  return seen
}

function DayCell({
  iso,
  day,
  colors,
  count,
  isToday,
  selected,
  onSelect,
}: {
  iso: string
  day: number
  colors: string[]
  count: number
  isToday: boolean
  selected: boolean
  onSelect: (iso: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: iso })
  return (
    <button
      ref={setNodeRef}
      onClick={() => onSelect(iso)}
      className="relative rounded-md border bg-[var(--muted)] p-0"
      style={{
        aspectRatio: "1 / 1",
        borderColor: isOver ? "var(--accent)" : "var(--border)",
        boxShadow: isOver
          ? "0 0 0 2px var(--accent) inset"
          : selected
            ? "0 0 0 2px var(--foreground) inset"
            : "none",
      }}
    >
      <span
        className="absolute right-1.5 top-1 text-[10px]"
        style={{
          color: isToday ? "var(--accent)" : "var(--muted-foreground)",
          fontWeight: isToday ? 700 : 400,
        }}
      >
        {day}
      </span>
      {count > 3 && (
        <span className="absolute left-1 top-1 text-[8px] leading-none text-muted-foreground">
          +{count - 3}
        </span>
      )}
      <div className="absolute inset-x-1 bottom-1 flex flex-col gap-[2px]">
        {colors.slice(0, 3).map((c, i) => (
          <div key={i} className="h-[3px] rounded-full" style={{ background: c }} />
        ))}
      </div>
    </button>
  )
}

function Chip({ task, color, onActions }: { task: Task; color: string; onActions: (t: Task) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => onActions(task)}
      className="flex cursor-grab touch-none items-center gap-2 rounded-md border border-border bg-card px-2.5 py-2 active:cursor-grabbing"
      style={{
        borderInlineEndWidth: 3,
        borderInlineEndColor: color,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : undefined,
        position: isDragging ? "relative" : undefined,
      }}
    >
      <Icon name="grip" size={14} className="shrink-0 text-muted-foreground/60" />
      <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">{task.title}</span>
      <PriorityPill priority={task.priority} />
    </div>
  )
}

export function MonthView({ onActions }: { onActions: (task: Task) => void }) {
  const tasks = useTasksStore((s) => s.tasks)
  const updateTask = useTasksStore((s) => s.updateTask)
  const colorOf = useColorOf()

  const [offset, setOffset] = useState(0)
  const base = useMemo(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth() + offset, 1)
  }, [offset])
  const year = base.getFullYear()
  const monthZero = base.getMonth()
  const today = todayLocalISO()

  const cells = useMemo(() => monthCells(year, monthZero), [year, monthZero])

  const [selected, setSelected] = useState<string | null>(() => {
    const t = todayLocalISO()
    return t.startsWith(isoOf(new Date().getFullYear(), new Date().getMonth(), 1).slice(0, 7)) ? t : null
  })

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  function handleDragEnd(e: DragEndEvent) {
    const taskId = String(e.active.id)
    const targetIso = e.over ? String(e.over.id) : null
    if (!targetIso) return
    const task = tasks.find((t) => t.id === taskId)
    if (!task || task.dueDate === targetIso) return
    updateTask(taskId, { dueDate: targetIso })
  }

  const selectedTasks = selected ? tasksDueOn(tasks, selected) : []
  const monthPrefix = isoOf(year, monthZero, 1).slice(0, 7)
  const selectedInMonth = selected?.startsWith(monthPrefix)

  return (
    <div className="px-4 pb-4">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={() => setOffset((o) => o - 1)}
            aria-label="חודש קודם"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-[var(--card-hover)]"
          >
            <Icon name="chevron-right" size={18} />
          </button>
          <p className="text-[14px] font-medium text-foreground">
            {HE_MONTHS[monthZero]} {year}
          </p>
          <button
            onClick={() => setOffset((o) => o + 1)}
            aria-label="חודש הבא"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-[var(--card-hover)]"
          >
            <Icon name="chevron-left" size={18} />
          </button>
        </div>

        <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground">
          {HE_WEEKDAYS_SHORT.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) =>
            cell === null ? (
              <div key={`b${i}`} />
            ) : (
              <DayCell
                key={cell.iso}
                iso={cell.iso}
                day={cell.day}
                isToday={cell.iso === today}
                selected={selected === cell.iso}
                onSelect={setSelected}
                {...(() => {
                  // count = distinct CATEGORIES (stripes), so "+N" reflects
                  // hidden categories beyond 3 — not raw task count.
                  const colors = distinctColors(tasksDueOn(tasks, cell.iso), colorOf)
                  return { colors, count: colors.length }
                })()}
              />
            ),
          )}
        </div>

        <div className="mt-4 rounded-xl border border-border bg-[var(--muted)] p-3">
          {selected && selectedInMonth ? (
            <>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[13px] font-medium text-foreground">
                  {Number(selected.slice(8))} {HE_MONTHS[monthZero]}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {selectedTasks.length ? "גרור משימה ליום אחר" : "יום פנוי"}
                </span>
              </div>
              {selectedTasks.length ? (
                <div className="space-y-1.5">
                  {selectedTasks.map((t) => (
                    <Chip key={t.id} task={t} color={colorOf(t)} onActions={onActions} />
                  ))}
                </div>
              ) : (
                <p className="py-1 text-[12px] text-muted-foreground">
                  מקום טוב לגרור אליו משימה גמישה.
                </p>
              )}
            </>
          ) : (
            <p className="py-2 text-center text-[12px] text-muted-foreground">
              לחץ על יום כדי לראות ולסדר את המשימות שלו.
            </p>
          )}
        </div>
      </DndContext>
    </div>
  )
}
