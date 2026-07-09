"use client"

import { motion } from "framer-motion"
import { Icon } from "./Icon"
import { tint } from "./pills"
import { useTasksStore, selectDoneCount, levelFor, progressInLevel } from "@/lib/tasks/store"

export function SquadStrip() {
  const categories = useTasksStore((s) => s.categories)
  const tasks = useTasksStore((s) => s.tasks)
  const openDrilldown = useTasksStore((s) => s.openDrilldown)
  const setView = useTasksStore((s) => s.setView)

  const enriched = categories.map((cat) => {
    const count = selectDoneCount({ tasks }, { categoryId: cat.id })
    return { cat, count, level: levelFor(count), progress: progressInLevel(count) }
  })

  const maxLevel = Math.max(...enriched.map((e) => e.level))
  const minLevel = Math.min(...enriched.map((e) => e.level))
  const laggard = minLevel < maxLevel ? enriched.find((e) => e.level === minLevel) : null

  return (
    <div>
      <div className="mb-2 flex items-center justify-between px-4">
        <p className="text-[12px] text-muted-foreground">התחומים שלך</p>
        <button
          onClick={() => setView("squad")}
          className="text-[12px] font-medium text-[var(--accent)] hover:underline"
        >
          התמונה המלאה ←
        </button>
      </div>

      <div className="flex gap-1.5 px-3">
        {enriched.map(({ cat, level, progress }, i) => {
          const isLaggard = laggard?.cat.id === cat.id
          return (
            <motion.button
              key={cat.id}
              onClick={() => openDrilldown(cat.id)}
              className="flex flex-1 flex-col items-center gap-1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div
                className="relative flex h-12 w-12 items-center justify-center rounded-full transition-transform hover:scale-105"
                style={{
                  background: tint(cat.color),
                  color: cat.color,
                  boxShadow: isLaggard ? "0 0 0 2px var(--warning)" : undefined,
                }}
              >
                <Icon name={cat.icon} size={22} />
                <span
                  className="absolute -bottom-1 -end-1 rounded-full px-1.5 py-[1px] text-[10px] font-medium leading-tight text-white"
                  style={{ background: cat.color }}
                >
                  {level}
                </span>
              </div>
              <p
                className="text-[10px]"
                style={isLaggard ? { color: "var(--warning)", fontWeight: 600 } : undefined}
              >
                {cat.name}
              </p>
              <div className="h-[3px] w-8 overflow-hidden rounded-full bg-[var(--muted)]">
                <div className="h-full" style={{ width: `${progress}%`, background: cat.color }} />
              </div>
            </motion.button>
          )
        })}
      </div>

      {laggard && (
        <div
          className="mx-4 mt-3 flex items-start gap-2 rounded-lg px-3 py-2"
          style={{
            background: "color-mix(in srgb, var(--warning) 12%, transparent)",
            color: "var(--warning)",
          }}
        >
          <Icon name="info" size={14} className="mt-0.5 shrink-0" />
          <p className="text-[12px] leading-snug">
            &quot;{laggard.cat.name}&quot; ברמה {laggard.level} בלבד — התחומים לא מאוזנים. אולי הזמן להשלים שם משהו קטן?
          </p>
        </div>
      )}
    </div>
  )
}
