"use client"

import { clsx } from "clsx"
import { Icon } from "./Icon"
import { useTasksStore } from "@/lib/tasks/store"
import type { ViewName } from "@/lib/tasks/types"

const items: { id: ViewName; icon: string; label: string }[] = [
  { id: "today", icon: "zap", label: "היום" },
  { id: "projects", icon: "list-checks", label: "משימות" },
  { id: "squad", icon: "users", label: "הצוות" },
  { id: "settings", icon: "settings", label: "הגדרות" },
]

export function BottomNav() {
  const view = useTasksStore((s) => s.view)
  const setView = useTasksStore((s) => s.setView)

  return (
    <nav className="absolute bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur">
      <div className="flex px-2 py-2">
        {items.map((it) => {
          const active = view === it.id
          return (
            <button
              key={it.id}
              onClick={() => setView(it.id)}
              className={clsx(
                "flex flex-1 flex-col items-center gap-0.5 rounded-md py-1.5 transition-colors",
                active
                  ? "text-[var(--accent)]"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon name={it.icon} size={20} />
              <span className={clsx("text-[10px]", active && "font-semibold")}>{it.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
