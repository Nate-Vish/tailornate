"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { motion } from "framer-motion"
import { clsx } from "clsx"
import { Icon } from "./Icon"
import { PriorityPill, ColorPill, scoreColor } from "./pills"
import { useTasksStore } from "@/lib/tasks/store"
import { calcScore, formatRelativeDue, statusLabel } from "@/lib/tasks/scoring"
import type { Task } from "@/lib/tasks/types"

export function TaskCard({ task, draggable = true }: { task: Task; draggable?: boolean }) {
  const weights = useTasksStore((s) => s.weights)
  const tags = useTasksStore((s) => s.tags)
  const categories = useTasksStore((s) => s.categories)
  const toggleComplete = useTasksStore((s) => s.toggleComplete)
  const clearBoost = useTasksStore((s) => s.clearBoost)

  const score = calcScore(task, weights)
  const tag = task.tagId ? tags.find((t) => t.id === task.tagId) : undefined
  const category = categories.find((c) => c.id === task.categoryId)
  const stripeColor = tag?.color ?? category?.color ?? "var(--muted-foreground)"
  const boosted = !!task.boost
  const due = formatRelativeDue(task.dueDate)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: !draggable,
  })

  return (
    <motion.div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        borderInlineEndColor: stripeColor,
      }}
      className={clsx(
        "relative rounded-xl border border-border bg-card py-3 pe-1 ps-3",
        "border-e-[3px]",
        boosted && "border-dashed border-e-4",
        isDragging && "z-50 shadow-lg",
      )}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      layout
    >
      <div className="flex items-start gap-2.5">
        {draggable && (
          <button
            {...attributes}
            {...listeners}
            aria-label="גרירה לשינוי סדר"
            className="mt-1 shrink-0 cursor-grab touch-none text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
          >
            <Icon name="grip" size={16} />
          </button>
        )}

        <button
          onClick={() => toggleComplete(task.id)}
          aria-label="סמן כהושלם"
          className={clsx(
            "mt-0.5 h-[22px] w-[22px] shrink-0 rounded-full border-2 transition-colors",
            task.status === "in_progress"
              ? "border-[var(--success)]"
              : "border-border hover:border-muted-foreground",
          )}
        />

        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-medium leading-tight text-foreground">{task.title}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <PriorityPill priority={task.priority} />
            {tag && <ColorPill label={tag.name} color={tag.color} />}
            {!tag && category && <ColorPill label={category.name} color={category.color} />}
            {task.status === "in_progress" && (
              <span className="text-[10px] text-muted-foreground">· {statusLabel[task.status]}</span>
            )}
            {due && <span className="text-[10px] text-muted-foreground">· {due}</span>}
            {boosted && (
              <button
                onClick={() => clearBoost(task.id)}
                title="בטל הקפצה"
                className="flex items-center gap-0.5 text-[10px] font-medium"
                style={{ color: "var(--warning)" }}
              >
                <Icon name="arrow-up" size={10} /> הוקפץ ×
              </button>
            )}
          </div>
        </div>

        <div className="shrink-0 pe-2 text-center">
          <div className="text-[16px] font-medium leading-none" style={{ color: scoreColor(score) }}>
            {score}
          </div>
          <div className="mt-1 text-[9px] text-muted-foreground">ציון</div>
        </div>
      </div>
    </motion.div>
  )
}
