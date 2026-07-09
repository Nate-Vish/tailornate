"use client"

import { Sheet, SheetButton } from "./Sheet"
import { useTasksStore } from "@/lib/tasks/store"
import { googleCalendarUrl } from "@/lib/tasks/ics"
import type { Task } from "@/lib/tasks/types"

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
  const completed = task.status === "completed"

  return (
    <Sheet title={task.title} onClose={onClose}>
      <div className="space-y-2">
        <SheetButton
          icon={completed ? "reset" : "check"}
          label={completed ? "פתח מחדש" : "סמן כהושלם"}
          color="var(--success)"
          onClick={() => {
            toggleComplete(task.id)
            onClose()
          }}
        />
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
