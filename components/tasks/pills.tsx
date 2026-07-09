"use client"

import type { CSSProperties } from "react"
import type { Priority } from "@/lib/tasks/types"
import { priorityLabel } from "@/lib/tasks/scoring"

// Inline style helper: expose a user color to the theme-aware CSS classes
// (.cpill/.cicon/.cchip-on/.cstripe/.cfill in sidra.css). Light mode shows the
// raw color; dark mode lightens it so mid-tones stay readable.
export function cvar(color: string): CSSProperties {
  return { "--c": color } as CSSProperties
}

const priorityColors: Record<Priority, string> = {
  urgent: "var(--danger)",
  high: "var(--warning)",
  medium: "var(--accent)",
  low: "var(--success)",
}

export function PriorityPill({ priority }: { priority: Priority }) {
  const c = priorityColors[priority]
  return (
    <span
      className="rounded-full px-2 py-[2px] text-[10px] font-medium"
      style={{ background: `color-mix(in srgb, ${c} 14%, transparent)`, color: c }}
    >
      {priorityLabel[priority]}
    </span>
  )
}

export function ColorPill({ label, color }: { label: string; color: string }) {
  return (
    <span className="cpill rounded-full px-2 py-[2px] text-[10px] font-medium" style={cvar(color)}>
      {label}
    </span>
  )
}

export function scoreColor(score: number): string {
  if (score >= 80) return "var(--danger)"
  if (score >= 55) return "var(--warning)"
  return "var(--muted-foreground)"
}
