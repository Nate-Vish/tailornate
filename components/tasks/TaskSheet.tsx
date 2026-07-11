"use client"

import { useState } from "react"
import { Icon } from "./Icon"
import { cvar } from "./pills"
import { Sheet } from "./Sheet"
import { useTasksStore } from "@/lib/tasks/store"
import { googleCalendarUrl } from "@/lib/tasks/ics"
import { priorityLabel, sizeLabel } from "@/lib/tasks/scoring"
import type { Priority, Size, Status, Task } from "@/lib/tasks/types"

const statusOptions: { value: Status; label: string }[] = [
  { value: "not_started", label: "לא התחיל" },
  { value: "in_progress", label: "בתהליך" },
  { value: "blocked", label: "חסום" },
]

// One sheet, two jobs: create a new task (no `task` prop) or edit an existing one.
export function TaskSheet({ task, onClose }: { task?: Task; onClose: () => void }) {
  const addTask = useTasksStore((s) => s.addTask)
  const branchTask = useTasksStore((s) => s.branchTask)
  const updateTask = useTasksStore((s) => s.updateTask)
  const deleteTask = useTasksStore((s) => s.deleteTask)
  const detachFromParent = useTasksStore((s) => s.detachFromParent)
  const unchain = useTasksStore((s) => s.unchain)
  const categories = useTasksStore((s) => s.categories)
  const tags = useTasksStore((s) => s.tags)
  const chains = useTasksStore((s) => s.chains)
  const allTasks = useTasksStore((s) => s.tasks)

  const editing = !!task
  const [title, setTitle] = useState(task?.title ?? "")
  const [priority, setPriority] = useState<Priority>(task?.priority ?? "medium")
  const [size, setSize] = useState<Size>(task?.size ?? "short")
  const [status, setStatus] = useState<Status>(
    task && task.status !== "completed" ? task.status : "not_started",
  )
  const [categoryId, setCategoryId] = useState(task?.categoryId ?? categories[0]?.id ?? "")
  const [tagId, setTagId] = useState(task?.tagId ?? "")
  const [dueDate, setDueDate] = useState(task?.dueDate ?? "")
  // Creation-time sub-tasks (branch exists on edit via the actions sheet)
  const [subtasks, setSubtasks] = useState<string[]>([])
  const [confirmDelete, setConfirmDelete] = useState(false)

  const availableTags = tags.filter((t) => t.categoryId === categoryId)
  const chain = task?.chainId ? chains.find((c) => c.id === task.chainId) : undefined
  const parent = task?.parentId ? allTasks.find((t) => t.id === task.parentId) : undefined

  const submit = () => {
    if (!title.trim()) return
    const cleanSubs = subtasks.map((x) => x.trim()).filter(Boolean)
    if (editing && task) {
      updateTask(task.id, {
        title: title.trim(),
        priority,
        size,
        status: task.status === "completed" ? task.status : status,
        categoryId,
        tagId: tagId || undefined,
        dueDate: dueDate || undefined,
      })
    } else {
      const created = addTask({
        title: title.trim(),
        priority,
        size,
        status: "not_started",
        categoryId,
        tagId: tagId || undefined,
        dueDate: dueDate || undefined,
      })
      if (cleanSubs.length > 0) branchTask(created.id, cleanSubs)
    }
    onClose()
  }

  return (
    <Sheet title={editing ? "עריכת משימה" : "משימה חדשה"} onClose={onClose}>
      <input
        autoFocus={!editing}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="מה צריך לעשות?"
        className="w-full rounded-lg border border-border bg-background px-3 py-3 text-[14px] text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-[var(--accent)]"
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />

      {(chain || parent) && (
        <div className="mt-3 space-y-1.5">
          {chain && (
            <div className="flex items-center justify-between rounded-lg bg-[var(--muted)] px-3 py-2">
              <span className="flex items-center gap-1.5 text-[12px] text-foreground">
                <Icon name="chain" size={13} />
                בשרשרת: {chain.title}
              </span>
              <button
                onClick={() => {
                  if (task) unchain(task.id)
                }}
                className="text-[11px] text-muted-foreground underline hover:text-foreground"
              >
                הסר מהשרשרת
              </button>
            </div>
          )}
          {parent && (
            <div className="flex items-center justify-between rounded-lg bg-[var(--muted)] px-3 py-2">
              <span className="flex items-center gap-1.5 text-[12px] text-foreground">
                <Icon name="branch" size={13} />
                תת־משימה של: {parent.title}
              </span>
              <button
                onClick={() => {
                  if (task) detachFromParent(task.id)
                }}
                className="text-[11px] text-muted-foreground underline hover:text-foreground"
              >
                נתק
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 space-y-3">
        <div>
          <p className="mb-1.5 text-[11px] text-muted-foreground">תחום</p>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setCategoryId(c.id)
                  setTagId("")
                }}
                className={`shrink-0 rounded-full border px-3 py-1 text-[12px] transition-colors ${categoryId === c.id ? "cchip-on" : "cchip"}`}
                style={cvar(c.color)}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {availableTags.length > 0 && (
          <div>
            <p className="mb-1.5 text-[11px] text-muted-foreground">תג (אופציונלי)</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {availableTags.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTagId(tagId === t.id ? "" : t.id)}
                  className={`shrink-0 rounded-full border px-3 py-1 text-[12px] transition-colors ${tagId === t.id ? "cchip-on" : "cchip"}`}
                  style={cvar(t.color)}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="mb-1.5 text-[11px] text-muted-foreground">דחיפות</p>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full rounded-lg border border-border bg-background px-2 py-2 text-[13px] text-foreground outline-none focus:border-[var(--accent)]"
            >
              {(["urgent", "high", "medium", "low"] as Priority[]).map((p) => (
                <option key={p} value={p}>
                  {priorityLabel[p]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="mb-1.5 text-[11px] text-muted-foreground">גודל</p>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value as Size)}
              className="w-full rounded-lg border border-border bg-background px-2 py-2 text-[13px] text-foreground outline-none focus:border-[var(--accent)]"
            >
              {(["short", "medium", "long"] as Size[]).map((s) => (
                <option key={s} value={s}>
                  {sizeLabel[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {editing && task?.status !== "completed" && (
          <div>
            <p className="mb-1.5 text-[11px] text-muted-foreground">סטטוס</p>
            <div className="flex gap-1.5">
              {statusOptions.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setStatus(o.value)}
                  className="flex-1 rounded-lg border px-2 py-2 text-[12px] transition-colors"
                  style={
                    status === o.value
                      ? {
                          background: "color-mix(in srgb, var(--accent) 12%, transparent)",
                          color: "var(--accent)",
                          borderColor: "var(--accent)",
                        }
                      : { borderColor: "var(--border)", color: "var(--muted-foreground)" }
                  }
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {!editing && (
          <div>
            <p className="mb-1.5 text-[11px] text-muted-foreground">תתי־משימות (אופציונלי)</p>
            <div className="space-y-1.5">
              {subtasks.map((line, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-4 text-center text-[11px] text-muted-foreground">{i + 1}</span>
                  <input
                    value={line}
                    onChange={(e) =>
                      setSubtasks((prev) => prev.map((l, j) => (j === i ? e.target.value : l)))
                    }
                    placeholder={`חלק ${i + 1}`}
                    className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-[var(--accent)]"
                  />
                  <button
                    aria-label="הסר"
                    onClick={() => setSubtasks((prev) => prev.filter((_, j) => j !== i))}
                    className="text-muted-foreground/60 hover:text-foreground"
                  >
                    <Icon name="x" size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setSubtasks((prev) => [...prev, ""])}
                className="flex items-center gap-1.5 text-[12px] text-[var(--accent)] hover:underline"
              >
                <Icon name="branch" size={13} />
                {subtasks.length === 0 ? "פצל לתתי־משימות" : "עוד חלק"}
              </button>
            </div>
          </div>
        )}

        <div>
          <p className="mb-1.5 text-[11px] text-muted-foreground">דדליין (אופציונלי)</p>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground outline-none focus:border-[var(--accent)]"
          />
        </div>
      </div>

      <button
        onClick={submit}
        disabled={!title.trim()}
        className="mt-5 w-full rounded-lg py-3 text-[14px] font-medium text-[var(--background)] transition-opacity hover:opacity-90 disabled:opacity-40"
        style={{ background: "var(--accent)" }}
      >
        {editing ? "שמור שינויים" : "הוסף משימה"}
      </button>

      {editing && task && (
        <div className="mt-3 flex items-center gap-2">
          {dueDate && (
            <a
              href={googleCalendarUrl({ ...task, title: title || task.title, dueDate })}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-2.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icon name="calendar-plus" size={14} />
              הוסף ליומן Google
            </a>
          )}
          {confirmDelete ? (
            <button
              onClick={() => {
                deleteTask(task.id)
                onClose()
              }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-[12px] font-medium text-white"
              style={{ background: "var(--danger)" }}
            >
              <Icon name="trash" size={14} />
              בטוח? מחק לצמיתות
            </button>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2.5 text-[12px] transition-colors"
              style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
            >
              <Icon name="trash" size={14} />
              מחק משימה
            </button>
          )}
        </div>
      )}
    </Sheet>
  )
}
