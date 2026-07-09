"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { motion } from "framer-motion"
import { clsx } from "clsx"
import { Icon } from "./Icon"
import { PriorityPill, ColorPill, scoreColor, cvar } from "./pills"
import { useTasksStore, childrenOf, chainProgress } from "@/lib/tasks/store"
import { calcScore, formatRelativeDue, statusLabel } from "@/lib/tasks/scoring"
import type { Task } from "@/lib/tasks/types"

function SubtaskRow({ task }: { task: Task }) {
  const toggleComplete = useTasksStore((s) => s.toggleComplete)
  const done = task.status === "completed"
  return (
    <div className="flex items-center gap-2 py-1">
      <button
        onClick={() => toggleComplete(task.id)}
        aria-label={done ? "פתח מחדש" : "סמן כהושלם"}
        className={clsx(
          "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          done ? "border-[var(--success)] bg-[var(--success)] text-white" : "border-border hover:border-muted-foreground",
        )}
      >
        {done && <Icon name="check" size={11} />}
      </button>
      <span
        className={clsx(
          "min-w-0 flex-1 truncate text-[12.5px]",
          done ? "text-muted-foreground line-through" : "text-foreground",
        )}
      >
        {task.title}
      </span>
      <PriorityPill priority={task.priority} />
    </div>
  )
}

export function TaskCard({
  task,
  draggable = true,
  onActions,
}: {
  task: Task
  draggable?: boolean
  onActions?: (task: Task) => void
}) {
  const weights = useTasksStore((s) => s.weights)
  const tags = useTasksStore((s) => s.tags)
  const categories = useTasksStore((s) => s.categories)
  const chains = useTasksStore((s) => s.chains)
  const tasks = useTasksStore((s) => s.tasks)
  const toggleComplete = useTasksStore((s) => s.toggleComplete)
  const clearBoost = useTasksStore((s) => s.clearBoost)

  const score = calcScore(task, weights)
  const tag = task.tagId ? tags.find((t) => t.id === task.tagId) : undefined
  const category = categories.find((c) => c.id === task.categoryId)
  const stripeColor = tag?.color ?? category?.color ?? "var(--muted-foreground)"
  const boosted = !!task.boost
  const due = formatRelativeDue(task.dueDate)

  const children = childrenOf(tasks, task.id)
  const doneChildren = children.filter((c) => c.status === "completed").length

  const chain = task.chainId ? chains.find((c) => c.id === task.chainId) : undefined
  const chainInfo = task.chainId ? chainProgress(tasks, task.chainId) : null

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
        ...cvar(stripeColor),
      }}
      className={clsx(
        "cstripe relative rounded-xl border border-border bg-card py-3 pe-1 ps-3",
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
          title={children.length > 0 ? "משלים גם את כל תתי־המשימות" : undefined}
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
            {chain && chainInfo && (
              <span
                className="flex items-center gap-1 rounded-full px-2 py-[2px] text-[10px] font-medium"
                style={{
                  background: "color-mix(in srgb, var(--accent) 12%, transparent)",
                  color: "var(--accent)",
                }}
              >
                <Icon name="chain" size={10} />
                {chain.title} · {chainInfo.done + 1}/{chainInfo.total}
              </span>
            )}
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

        <div className="flex shrink-0 flex-col items-center gap-1 pe-1">
          <div className="text-center">
            <div className="text-[16px] font-medium leading-none" style={{ color: scoreColor(score) }}>
              {score}
            </div>
            <div className="mt-0.5 text-[9px] text-muted-foreground">ציון</div>
          </div>
          {onActions && (
            <button
              onClick={() => onActions(task)}
              aria-label="פעולות על המשימה"
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:bg-[var(--card-hover)] hover:text-foreground"
            >
              <Icon name="more" size={16} />
            </button>
          )}
        </div>
      </div>

      {children.length > 0 && (
        <div className="ms-8 mt-2 border-s-2 border-border pe-2 ps-3">
          <div className="mb-1 flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--muted)]">
              <div
                className="h-full transition-all"
                style={{
                  width: `${(doneChildren / children.length) * 100}%`,
                  background: "var(--success)",
                }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">
              {doneChildren}/{children.length}
            </span>
          </div>
          {children.map((c) => (
            <SubtaskRow key={c.id} task={c} />
          ))}
        </div>
      )}
    </motion.div>
  )
}
