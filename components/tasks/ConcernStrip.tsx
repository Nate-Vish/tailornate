"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icon } from "./Icon"
import type { Concern } from "@/lib/tasks/guardian"

const TONE: Record<Concern["kind"], { icon: string; color: string }> = {
  conflict: { icon: "zap", color: "var(--danger)" },
  sequence: { icon: "chain", color: "var(--warning)" },
  inversion: { icon: "arrow-up", color: "var(--warning)" },
  deadline_risk: { icon: "calendar-clock", color: "var(--danger)" },
  overload: { icon: "bar-chart", color: "var(--warning)" },
  habit: { icon: "flame", color: "var(--accent)" },
}

/**
 * The agent's "?" channel. It stays out of the way — nothing renders on a calm
 * day — and speaks only when something is actually worth a second thought.
 */
export function ConcernStrip({ concerns }: { concerns: Concern[] }) {
  // Keyed by identity, not index: the list is rebuilt every minute, and an
  // index would silently re-point an open row at a different concern.
  const [openKey, setOpenKey] = useState<string | null>(null)
  if (concerns.length === 0) return null

  return (
    <div className="space-y-1.5 px-4 pb-3">
      {concerns.map((c) => {
        const tone = TONE[c.kind] ?? TONE.overload
        const key = `${c.kind}-${c.taskIds.join("-")}`
        const open = openKey === key
        return (
          <div
            key={key}
            className="overflow-hidden rounded-xl border border-border bg-card"
            style={{ borderInlineStartWidth: 3, borderInlineStartColor: tone.color }}
          >
            <button
              onClick={() => setOpenKey(open ? null : key)}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-start"
              aria-expanded={open}
            >
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: `color-mix(in srgb, ${tone.color} 14%, transparent)`,
                  color: tone.color,
                }}
              >
                <Icon name={tone.icon} size={13} />
              </span>
              <span className="min-w-0 flex-1 text-[12.5px] leading-snug text-foreground">
                {c.message}
              </span>
              {c.suggestion && (
                <Icon
                  name={open ? "chevron-up" : "chevron-down"}
                  size={14}
                  className="shrink-0 text-muted-foreground"
                />
              )}
            </button>

            <AnimatePresence initial={false}>
              {open && c.suggestion && (
                <motion.p
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="px-3 pb-2.5 ps-11 text-[12px] leading-relaxed text-muted-foreground"
                >
                  {c.suggestion}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
