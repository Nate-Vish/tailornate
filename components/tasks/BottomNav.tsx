"use client"

import { clsx } from "clsx"
import { Icon } from "./Icon"
import { useTasksStore } from "@/lib/tasks/store"
import type { ViewName } from "@/lib/tasks/types"

const right: { id: ViewName; icon: string; label: string }[] = [
  { id: "squad", icon: "bar-chart", label: "סטטוס" },
  { id: "projects", icon: "folder", label: "תחומים" },
]

const left: { id: ViewName; icon: string; label: string }[] = [
  { id: "table", icon: "table", label: "הכל" },
  { id: "settings", icon: "settings", label: "הגדרות" },
]

function NavButton({ id, icon, label }: { id: ViewName; icon: string; label: string }) {
  const view = useTasksStore((s) => s.view)
  const setView = useTasksStore((s) => s.setView)
  const active = view === id
  return (
    <button
      onClick={() => setView(id)}
      aria-current={active ? "page" : undefined}
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

// Center compass = home. It opens the dashboard — the "95% of visits" screen.
// Spins a full turn on hover (desktop) and on tap (mobile has no hover).
export function BottomNav() {
  const view = useTasksStore((s) => s.view)
  const setView = useTasksStore((s) => s.setView)
  const isHome = view === "today"

  return (
    <nav
      className="absolute bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-end px-2 pb-2 pt-1">
        {right.map((it) => (
          <NavButton key={it.id} {...it} />
        ))}
        <div className="relative flex flex-1 justify-center">
          <button
            onClick={() => setView("today")}
            aria-label="מצפן — הדשבורד הראשי"
            aria-current={isHome ? "page" : undefined}
            className={clsx(
              "group -mt-7 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95",
              isHome ? "text-white" : "text-[var(--accent)] ring-1 ring-[var(--accent)]",
            )}
            style={{ background: isHome ? "var(--accent)" : "var(--card)" }}
          >
            <Icon
              name="compass"
              size={27}
              className="transition-transform duration-700 ease-out group-hover:rotate-[360deg] group-active:rotate-[360deg]"
            />
          </button>
        </div>
        {left.map((it) => (
          <NavButton key={it.id} {...it} />
        ))}
      </div>
    </nav>
  )
}
