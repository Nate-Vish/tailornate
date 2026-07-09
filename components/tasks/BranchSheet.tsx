"use client"

import { useState } from "react"
import { clsx } from "clsx"
import { Icon } from "./Icon"
import { Sheet } from "./Sheet"
import { useTasksStore } from "@/lib/tasks/store"
import type { Task } from "@/lib/tasks/types"

// Split a task into sub-tasks: type new ones, or pull in existing standalone
// tasks. The parent auto-completes when every sub-task is done.
export function BranchSheet({ task, onClose }: { task: Task; onClose: () => void }) {
  const branchTask = useTasksStore((s) => s.branchTask)
  const attachChildren = useTasksStore((s) => s.attachChildren)
  const tasks = useTasksStore((s) => s.tasks)

  const [mode, setMode] = useState<"new" | "existing">("new")
  const [lines, setLines] = useState<string[]>(["", ""])
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const attachable = tasks.filter(
    (t) =>
      t.id !== task.id &&
      !t.parentId &&
      !t.chainId &&
      t.status !== "completed" &&
      // A parent can't become someone's child
      !tasks.some((x) => x.parentId === t.id),
  )

  const validLines = lines.map((l) => l.trim()).filter(Boolean)
  const canSubmit = mode === "new" ? validLines.length > 0 : selected.size > 0

  const submit = () => {
    if (mode === "new") {
      branchTask(task.id, validLines)
    } else {
      attachChildren(task.id, [...selected])
    }
    onClose()
  }

  return (
    <Sheet title={`פיצול: ${task.title}`} onClose={onClose}>
      <div className="mb-3 flex rounded-lg bg-[var(--muted)] p-[3px]">
        {(
          [
            { id: "new", label: "תתי־משימות חדשות" },
            { id: "existing", label: "צרף קיימות" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setMode(t.id)}
            className={
              mode === t.id
                ? "flex-1 rounded-md bg-card py-[7px] text-[12px] font-medium text-foreground shadow-sm"
                : "flex-1 py-[7px] text-[12px] text-muted-foreground"
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {mode === "new" ? (
        <div className="space-y-2">
          {lines.map((line, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-5 text-center text-[12px] text-muted-foreground">{i + 1}</span>
              <input
                value={line}
                autoFocus={i === 0}
                onChange={(e) => setLines((prev) => prev.map((l, j) => (j === i ? e.target.value : l)))}
                placeholder={`חלק ${i + 1}`}
                className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-[13px] text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-[var(--accent)]"
              />
              {lines.length > 1 && (
                <button
                  aria-label="הסר שורה"
                  onClick={() => setLines((prev) => prev.filter((_, j) => j !== i))}
                  className="text-muted-foreground/60 hover:text-foreground"
                >
                  <Icon name="x" size={14} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => setLines((prev) => [...prev, ""])}
            className="flex items-center gap-1.5 text-[12px] text-[var(--accent)] hover:underline"
          >
            <Icon name="plus" size={13} />
            עוד חלק
          </button>
        </div>
      ) : (
        <div className="space-y-1.5">
          {attachable.length === 0 && (
            <p className="rounded-lg bg-[var(--muted)] px-3 py-4 text-center text-[12px] text-muted-foreground">
              אין משימות פנויות לצירוף
            </p>
          )}
          {attachable.map((t) => {
            const on = selected.has(t.id)
            return (
              <button
                key={t.id}
                onClick={() =>
                  setSelected((prev) => {
                    const next = new Set(prev)
                    if (next.has(t.id)) next.delete(t.id)
                    else next.add(t.id)
                    return next
                  })
                }
                className={clsx(
                  "flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-start transition-colors",
                  on ? "border-[var(--accent)]" : "border-border hover:bg-[var(--card-hover)]",
                )}
              >
                <span
                  className={clsx(
                    "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border-2 text-white",
                    on ? "border-[var(--accent)] bg-[var(--accent)]" : "border-border",
                  )}
                >
                  {on && <Icon name="check" size={11} />}
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">{t.title}</span>
              </button>
            )
          })}
        </div>
      )}

      <button
        onClick={submit}
        disabled={!canSubmit}
        className="mt-5 w-full rounded-lg py-3 text-[14px] font-medium text-[var(--background)] transition-opacity hover:opacity-90 disabled:opacity-40"
        style={{ background: "var(--accent)" }}
      >
        {mode === "new" ? `פצל ל-${validLines.length || ""} חלקים` : `צרף ${selected.size || ""} משימות`}
      </button>
    </Sheet>
  )
}
