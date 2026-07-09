"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { useTasksStore } from "@/lib/tasks/store"
import { Icon } from "./Icon"
import { TodayView } from "./TodayView"
import { ProjectsView } from "./ProjectsView"
import { SquadView } from "./SquadView"
import { SettingsView } from "./SettingsView"
import { BottomNav } from "./BottomNav"
import { AddTaskDialog } from "./AddTaskDialog"
import { AchievementToast } from "./AchievementToast"
import { AIChatPanel } from "./AIChatPanel"

// Self-sufficient theme toggle: flips the `dark` class on <html> and remembers
// the choice. Works with or without a site-wide theme provider.
function useDarkToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("sidra-theme")
    const initial = stored
      ? stored === "dark"
      : document.documentElement.classList.contains("dark")
    document.documentElement.classList.toggle("dark", initial)
    setIsDark(initial)
  }, [])

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle("dark", next)
      localStorage.setItem("sidra-theme", next ? "dark" : "light")
      return next
    })
  }, [])

  return { isDark, toggle }
}

export function TasksApp() {
  const view = useTasksStore((s) => s.view)
  const setAIOpen = useTasksStore((s) => s.setAIOpen)
  const aiOpen = useTasksStore((s) => s.aiOpen)
  const [addOpen, setAddOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { isDark, toggle } = useDarkToggle()

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-[var(--accent)]"
          >
            <Icon name="sparkles" size={20} />
          </motion.div>
          <p className="text-[13px] text-muted-foreground">Sidra</p>
        </div>
      </div>
    )
  }

  return (
    <div
      dir="rtl"
      className="flex min-h-dvh items-stretch justify-center bg-background sm:items-center sm:py-8"
    >
      <div className="fixed left-4 top-4 z-50 hidden flex-col gap-2 sm:flex" dir="ltr">
        <Link
          href="/"
          aria-label="חזרה לאתר"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
        >
          <Icon name="arrow-right" size={15} className="-scale-x-100" />
        </Link>
        <button
          onClick={toggle}
          aria-label="החלף מצב תצוגה"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
        >
          <Icon name={isDark ? "sun-medium" : "moon"} size={15} />
        </button>
      </div>

      <div className="relative flex w-full flex-col overflow-hidden bg-background sm:h-[860px] sm:max-h-[92vh] sm:max-w-[420px] sm:rounded-[28px] sm:border sm:border-border sm:bg-card sm:shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-2 sm:hidden">
          <Link href="/" className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Icon name="arrow-right" size={12} />
            tailornate.com
          </Link>
          <button onClick={toggle} aria-label="החלף מצב תצוגה" className="text-muted-foreground">
            <Icon name={isDark ? "sun-medium" : "moon"} size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
            >
              {view === "today" && <TodayView onAdd={() => setAddOpen(true)} />}
              {view === "projects" && <ProjectsView />}
              {view === "squad" && <SquadView />}
              {view === "settings" && <SettingsView />}
            </motion.div>
          </AnimatePresence>
        </div>

        {!aiOpen && (
          <motion.button
            onClick={() => setAIOpen(true)}
            aria-label="פתח עוזר AI"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            className="absolute bottom-20 left-4 z-20 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl"
            style={{ background: "var(--accent)" }}
          >
            <Icon name="sparkles" size={22} />
          </motion.button>
        )}

        <BottomNav />
        <AchievementToast />

        <AnimatePresence>{addOpen && <AddTaskDialog onClose={() => setAddOpen(false)} />}</AnimatePresence>

        <AIChatPanel />
      </div>
    </div>
  )
}
