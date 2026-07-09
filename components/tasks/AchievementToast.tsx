"use client"

import { useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Icon } from "./Icon"
import { tint } from "./pills"
import { useTasksStore } from "@/lib/tasks/store"

export function AchievementToast() {
  const lastAward = useTasksStore((s) => s.lastAward)
  const clearAward = useTasksStore((s) => s.clearAward)
  const tags = useTasksStore((s) => s.tags)
  const categories = useTasksStore((s) => s.categories)

  useEffect(() => {
    if (!lastAward) return
    const t = setTimeout(clearAward, 3200)
    return () => clearTimeout(t)
  }, [lastAward, clearAward])

  if (!lastAward) return null

  const tag = lastAward.tagId ? tags.find((x) => x.id === lastAward.tagId) : null
  const cat = categories.find((x) => x.id === lastAward.categoryId)
  const color = tag?.color ?? cat?.color ?? "var(--accent)"
  const name = tag?.name ?? cat?.name ?? ""

  return (
    <AnimatePresence>
      <motion.div
        key={lastAward.taskTitle + lastAward.xp}
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -70, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 260 }}
        className="absolute left-0 right-0 top-3 z-50 flex justify-center px-4"
      >
        <div
          className="flex items-center gap-3 rounded-2xl border border-border px-4 py-2.5 shadow-lg backdrop-blur"
          style={{ background: `color-mix(in srgb, ${color} 12%, var(--card))` }}
        >
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-white"
            style={{ background: color }}
          >
            <Icon name={lastAward.leveledUp ? "trophy" : "check"} size={16} />
          </div>
          <div>
            <p className="text-[13px] font-semibold leading-tight" style={{ color }}>
              {lastAward.leveledUp ? `${name} עלה רמה! +${lastAward.xp} XP` : `+${lastAward.xp} XP`}
            </p>
            <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
              {lastAward.taskTitle}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
