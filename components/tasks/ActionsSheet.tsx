"use client"

import { useState } from "react"
import { Sheet, SheetButton } from "./Sheet"
import { useTasksStore, todayISO, isSnoozed, isChainLocked } from "@/lib/tasks/store"
import { googleCalendarUrl } from "@/lib/tasks/ics"
import type { Task } from "@/lib/tasks/types"

function tomorrowISO(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export type TaskSheetAction = "edit" | "branch" | "chain"

// Quick actions for a single task, opened from the "⋯" on every card/row.
export function ActionsSheet({
  task,
  onClose,
  onPick,
}: {
  task: Task
  onClose: () => void
  onPick: (action: TaskSheetAction) => void
}) {
  const boostTask = useTasksStore((s) => s.boostTask)
  const clearBoost = useTasksStore((s) => s.clearBoost)
  const toggleComplete = useTasksStore((s) => s.toggleComplete)
  const snoozeTask = useTasksStore((s) => s.snoozeTask)
  const [snoozeDateOpen, setSnoozeDateOpen] = useState(false)
  const tasks = useTasksStore((s) => s.tasks)
  const completed = task.status === "completed"
  const snoozed = isSnoozed(task)
  const locked = !completed && isChainLocked(task, tasks)

  return (
    <Sheet title={task.title} onClose={onClose}>
      <div className="space-y-2">
        {locked ? (
          <SheetButton
            icon="lock"
            label="נעול בשרשרת"
            sub="קודם משלימים את השלב הקודם"
            color="var(--warning)"
            disabled
            onClick={() => {}}
          />
        ) : (
          <SheetButton
            icon={completed ? "reset" : "check"}
            label={completed ? "פתח מחדש" : "סמן כהושלם"}
            color="var(--success)"
            onClick={() => {
              toggleComplete(task.id)
              onClose()
            }}
          />
        )}
        <SheetButton icon="pencil" label="ערוך" sub="שם, תחום, דחיפות, דדליין, מחיקה" onClick={() => onPick("edit")} />
        {!task.parentId && !completed && (
          <SheetButton
            icon="branch"
            label="פצל לתתי־משימות"
            sub="המשימה תושלם כשכל החלקים יושלמו"
            onClick={() => onPick("branch")}
          />
        )}
        {!completed && (
          <SheetButton
            icon="chain"
            label="בנה שרשרת מכאן"
            sub="תוכנית צעד־אחר־צעד — שלב נפתח רק כשהקודם הושלם"
            onClick={() => onPick("chain")}
          />
        )}
        {!completed &&
          (snoozed ? (
            <SheetButton
              icon="clock"
              label="בטל דחייה"
              sub={`נדחה עד ${task.snoozedUntil}`}
              color="var(--warning)"
              onClick={() => {
                snoozeTask(task.id, null)
                onClose()
              }}
            />
          ) : snoozeDateOpen ? (
            <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
              <span className="text-[13px] text-muted-foreground">דחה עד:</span>
              <input
                type="date"
                autoFocus
                min={todayISO()}
                onChange={(e) => {
                  if (e.target.value) {
                    snoozeTask(task.id, e.target.value)
                    onClose()
                  }
                }}
                className="flex-1 rounded-lg border border-border bg-card px-2 py-1.5 text-[13px] text-foreground outline-none"
              />
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="flex-1">
                <SheetButton
                  icon="clock"
                  label="דחה למחר"
                  color="var(--warning)"
                  onClick={() => {
                    snoozeTask(task.id, tomorrowISO())
                    onClose()
                  }}
                />
              </div>
              <div className="flex-1">
                <SheetButton
                  icon="calendar-clock"
                  label="דחה לתאריך…"
                  color="var(--warning)"
                  onClick={() => setSnoozeDateOpen(true)}
                />
              </div>
            </div>
          ))}
        {task.dueDate && (
          <a href={googleCalendarUrl(task)} target="_blank" rel="noopener noreferrer" className="block">
            <SheetButton icon="calendar-plus" label="הוסף ליומן Google" onClick={() => {}} />
          </a>
        )}
        {!completed &&
          (task.boost ? (
            <SheetButton
              icon="arrow-up"
              label="בטל הקפצה"
              color="var(--warning)"
              onClick={() => {
                clearBoost(task.id)
                onClose()
              }}
            />
          ) : (
            <SheetButton
              icon="arrow-up"
              label="הקפץ לראש הרשימה"
              color="var(--warning)"
              onClick={() => {
                boostTask(task.id, "until_done", 100)
                onClose()
              }}
            />
          ))}
      </div>
    </Sheet>
  )
}
