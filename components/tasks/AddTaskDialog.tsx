"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Icon } from "./Icon"
import { tint } from "./pills"
import { useTasksStore } from "@/lib/tasks/store"
import { priorityLabel, sizeLabel } from "@/lib/tasks/scoring"
import type { Priority, Size } from "@/lib/tasks/types"

export function AddTaskDialog({ onClose }: { onClose: () => void }) {
  const addTask = useTasksStore((s) => s.addTask)
  const categories = useTasksStore((s) => s.categories)
  const tags = useTasksStore((s) => s.tags)

  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState<Priority>("medium")
  const [size, setSize] = useState<Size>("short")
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "")
  const [tagId, setTagId] = useState("")
  const [dueDate, setDueDate] = useState("")

  const availableTags = tags.filter((t) => t.categoryId === categoryId)

  const submit = () => {
    if (!title.trim()) return
    addTask({
      title: title.trim(),
      priority,
      size,
      status: "not_started",
      categoryId,
      tagId: tagId || undefined,
      dueDate: dueDate || undefined,
    })
    onClose()
  }

  return (
    <div
      className="absolute inset-0 z-40 flex items-end justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 400 }}
        animate={{ y: 0 }}
        exit={{ y: 400 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="w-full rounded-t-2xl border-t border-border bg-card p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-foreground">משימה חדשה</h2>
          <button aria-label="סגור" onClick={onClose} className="text-muted-foreground">
            <Icon name="x" size={18} />
          </button>
        </div>

        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="מה צריך לעשות?"
          className="w-full rounded-lg border border-border bg-background px-3 py-3 text-[14px] text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-[var(--accent)]"
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />

        <div className="mt-4 space-y-3">
          <div>
            <p className="mb-1.5 text-[11px] text-muted-foreground">קטגוריה</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setCategoryId(c.id)
                    setTagId("")
                  }}
                  className="shrink-0 rounded-full border px-3 py-1 text-[12px] transition-colors"
                  style={
                    categoryId === c.id
                      ? { background: tint(c.color), color: c.color, borderColor: c.color }
                      : { borderColor: "var(--border)", color: "var(--muted-foreground)" }
                  }
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
                    className="shrink-0 rounded-full border px-3 py-1 text-[12px] transition-colors"
                    style={
                      tagId === t.id
                        ? { background: tint(t.color), color: t.color, borderColor: t.color }
                        : { borderColor: "var(--border)", color: "var(--muted-foreground)" }
                    }
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
          הוסף משימה
        </button>
      </motion.div>
    </div>
  )
}
