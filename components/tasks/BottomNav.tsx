"use client"

import { clsx } from "clsx"
import { Icon } from "./Icon"
import { useTasksStore } from "@/lib/tasks/store"
import type { ViewName } from "@/lib/tasks/types"

const right: { id: ViewName; icon: string; label: string }[] = [
  { id: "today", icon: "zap", label: "היום" },
  { id: "squad", icon: "users", label: "תחומים" },
]

const left: { id: ViewName; icon: string; label: string }[] = [
  { id: "table", icon: "table", label: "הכל" },
  { id: "settings", icon: "settings", label: "הגדרות" },
]

function NavButton({ id, icon, label }: { id: ViewName; icon: string; label: string }) {
  const view = useTasksStore((s) => s.view)
  const setView = useTasksStore((s) => s.setView)
  const active = view === id || (id === "squad" && view === "projects")
  return (
    <button
      onClick={() => setView(id)}
      className={clsx(
        "flex flex-1 flex-col items-center gap-0.5 rounded-md py-1.5 transition-colors",
        active ? "text-[var(--accent)]" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon name={icon} size={20} />
      <span className={clsx("text-[10px]", active && "font-semibold")}>{label}</span>
    </button>
  )
}

// Center "+" sits raised in the middle of the bar — the easiest thumb reach
// when holding a phone one-handed.
export function BottomNav({ onAdd }: { onAdd: () => void }) {
  return (
    <nav className="absolute bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur">
      <div className="flex items-end px-2 pb-2 pt-1">
        {right.map((it) => (
          <NavButton key={it.id} {...it} />
        ))}
        <div className="relative flex flex-1 justify-center">
          <button
            onClick={onAdd}
            aria-label="הוספת משימה או שרשרת"
            className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
            style={{ background: "var(--accent)" }}
          >
            <Icon name="plus" size={26} />
          </button>
        </div>
        {left.map((it) => (
          <NavButton key={it.id} {...it} />
        ))}
      </div>
    </nav>
  )
}
