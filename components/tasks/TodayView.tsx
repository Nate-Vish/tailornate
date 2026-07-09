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
import { AnimatePresence } from "framer-motion"
import { useTasksStore, selectTodayList, selectRecentDone } from "@/lib/tasks/store"
import { calcScore } from "@/lib/tasks/scoring"
import { TaskCard } from "./TaskCard"
import { SquadStrip } from "./SquadStrip"
import { Icon } from "./Icon"
import type { Task } from "@/lib/tasks/types"

function greeting(): string {
  const h = new Date().getHours()
  if (h < 5) return "לילה טוב"
  if (h < 12) return "בוקר טוב"
  if (h < 18) return "צהריים טובים"
  return "ערב טוב"
}

export function TodayView({ onActions }: { onActions: (task: Task) => void }) {
  const tasks = useTasksStore((s) => s.tasks)
  const weights = useTasksStore((s) => s.weights)
  const boostTask = useTasksStore((s) => s.boostTask)

  const active = useMemo(() => selectTodayList({ tasks, weights }), [tasks, weights])
  const recentDone = useMemo(() => selectRecentDone({ tasks }, 1), [tasks])
  const [span, setSpan] = useState<"day" | "week" | "month">("day")

  const shown = useMemo(() => {
    if (span === "day") return active.slice(0, 7)
    if (span === "week") return active.slice(0, 14)
    return active
  }, [active, span])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  function handleDragEnd(e: DragEndEvent) {
    const { active: a, over } = e
    if (!over || a.id === over.id) return
    const oldIndex = shown.findIndex((t) => t.id === a.id)
    const newIndex = shown.findIndex((t) => t.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const reordered = arrayMove(shown, oldIndex, newIndex)
    const moved = reordered[newIndex]
    const neighborAbove = reordered[newIndex - 1]
    if (neighborAbove) {
      boostTask(moved.id, "until_done", calcScore(neighborAbove, weights) + 1)
    } else {
      boostTask(moved.id, "until_done", 100)
    }
  }

  return (
    <div className="pb-32">
      <header className="px-4 pb-3 pt-5">
        <p className="text-[11px] text-muted-foreground">{greeting()}, נתן</p>
        <h1 className="mt-0.5 text-[19px] font-semibold text-foreground">היום שלי</h1>
      </header>

      <div className="px-4 pb-3">
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

      <div className="pb-4">
        <SquadStrip />
      </div>

      <div className="border-t border-border px-4 pb-2 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[14px] font-medium text-foreground">
            {span === "day" ? "לדחוף היום" : span === "week" ? "השבוע" : "הכל"}
          </p>
          <span className="text-[11px] text-muted-foreground">ממוין לפי ציון חכם</span>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={shown.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <AnimatePresence initial={false}>
              <div className="space-y-2">
                {shown.map((t) => (
                  <TaskCard key={t.id} task={t} onActions={onActions} />
                ))}
              </div>
            </AnimatePresence>
          </SortableContext>
        </DndContext>

        {shown.length === 0 && (
          <p className="rounded-lg bg-[var(--muted)] px-3 py-6 text-center text-[13px] text-muted-foreground">
            הכל נקי. תוסיף משימה או תיהנה מהרגע 🎉
          </p>
        )}

        {recentDone.length > 0 && (
          <div className="mt-4 flex items-center gap-2.5 rounded-lg bg-[var(--muted)] px-3 py-2.5">
            <span className="shrink-0" style={{ color: "var(--warning)" }}>
              <Icon name="trophy" size={18} />
            </span>
            <div className="flex-1">
              <p className="text-[12px] font-medium text-foreground">
                אחרונה שסגרת: {recentDone[0].title}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">המשך ככה</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
