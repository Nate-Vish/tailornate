"use client"

import { motion } from "framer-motion"
import { Icon } from "./Icon"

// Shared bottom-sheet shell: backdrop + slide-up card + title row.
export function Sheet({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div
      className="absolute inset-0 z-40 flex items-end justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 500 }}
        animate={{ y: 0 }}
        exit={{ y: 500 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="flex max-h-[88%] w-full flex-col rounded-t-2xl border-t border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-2">
          <div className="h-1 w-9 rounded-full bg-border" />
        </div>
        <div className="flex items-center justify-between px-5 pb-3 pt-2">
          <h2 className="text-[16px] font-semibold text-foreground">{title}</h2>
          <button aria-label="סגור" onClick={onClose} className="text-muted-foreground">
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-6">{children}</div>
      </motion.div>
    </div>
  )
}

export function SheetButton({
  icon,
  label,
  sub,
  color,
  onClick,
  disabled,
}: {
  icon: string
  label: string
  sub?: string
  color?: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center gap-3 rounded-xl border border-border bg-background px-3 py-3 text-start transition-colors hover:bg-[var(--card-hover)] disabled:opacity-40"
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{
          background: `color-mix(in srgb, ${color ?? "var(--accent)"} 12%, transparent)`,
          color: color ?? "var(--accent)",
        }}
      >
        <Icon name={icon} size={17} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-medium text-foreground">{label}</span>
        {sub && <span className="mt-0.5 block text-[11px] text-muted-foreground">{sub}</span>}
      </span>
    </button>
  )
}
