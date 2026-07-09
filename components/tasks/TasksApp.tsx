"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { useTasksStore } from "@/lib/tasks/store"
import type { Task } from "@/lib/tasks/types"
import { Icon } from "./Icon"
import { TodayView } from "./TodayView"
import { ProjectsView } from "./ProjectsView"
import { SquadView } from "./SquadView"
import { SettingsView } from "./SettingsView"
import { TableView } from "./TableView"
import { BottomNav } from "./BottomNav"
import { AchievementToast } from "./AchievementToast"
import { AIChatPanel } from "./AIChatPanel"
import { Sheet, SheetButton } from "./Sheet"
import { TaskSheet } from "./TaskSheet"
import { ActionsSheet, type TaskSheetAction } from "./ActionsSheet"
import { BranchSheet } from "./BranchSheet"
import { ChainSheet } from "./ChainSheet"

// Sidra's theme is scoped to the app wrapper (.sidra-dark class), independent
// of however the host site manages its own theme. Initial value follows the
// stored choice, then the site's current theme, then the OS preference.
function useDarkToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("sidra-theme")
    const html = document.documentElement
    const siteIsDark =
      html.classList.contains("dark") || html.getAttribute("data-theme") === "dark"
    const initial = stored
      ? stored === "dark"
      : siteIsDark || window.matchMedia("(prefers-color-scheme: dark)").matches
    setIsDark(initial)
  }, [])

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev
      localStorage.setItem("sidra-theme", next ? "dark" : "light")
      return next
    })
  }, [])

  return { isDark, toggle }
}

type SheetState =
  | { kind: "none" }
  | { kind: "add-picker" }
  | { kind: "task-new" }
  | { kind: "task-edit"; task: Task }
  | { kind: "actions"; task: Task }
  | { kind: "branch"; task: Task }
  | { kind: "chain"; task?: Task }

export function TasksApp() {
  const view = useTasksStore((s) => s.view)
  const setAIOpen = useTasksStore((s) => s.setAIOpen)
  const aiOpen = useTasksStore((s) => s.aiOpen)
  const [sheet, setSheet] = useState<SheetState>({ kind: "none" })
  const [mounted, setMounted] = useState(false)
  const { isDark, toggle } = useDarkToggle()

  useEffect(() => setMounted(true), [])

  const close = useCallback(() => setSheet({ kind: "none" }), [])
  const openActions = useCallback((task: Task) => setSheet({ kind: "actions", task }), [])

  if (!mounted) {
    return (
      <div className="sidra flex min-h-dvh items-center justify-center bg-[var(--background)]">
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
      className={`sidra ${isDark ? "sidra-dark" : ""} flex min-h-dvh items-stretch justify-center bg-[var(--background)] sm:items-center sm:py-8`}
    >
      <div className="fixed left-4 top-4 z-50 hidden flex-col gap-2 sm:flex" dir="ltr">
        <Link
          href="/portfolio"
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

      <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-background sm:h-[860px] sm:max-h-[92vh] sm:max-w-[420px] sm:rounded-[28px] sm:border sm:border-border sm:bg-card sm:shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-2 sm:hidden">
          <Link href="/portfolio" className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Icon name="arrow-right" size={12} />
            tailornate.com
          </Link>
          <button onClick={toggle} aria-label="החלף מצב תצוגה" className="text-muted-foreground">
            <Icon name={isDark ? "sun-medium" : "moon"} size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          {/* No exit animation on view switches — rapid tab taps must never
              leave a view frozen mid-transition. */}
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            {view === "today" && <TodayView onActions={openActions} />}
            {view === "projects" && <ProjectsView onActions={openActions} />}
            {view === "squad" && <SquadView />}
            {view === "table" && <TableView onActions={openActions} />}
            {view === "settings" && <SettingsView />}
          </motion.div>
        </div>

        {!aiOpen && (
          <motion.button
            onClick={() => setAIOpen(true)}
            aria-label="פתח עוזר AI"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            className="absolute bottom-24 left-4 z-20 flex h-13 w-13 items-center justify-center rounded-full p-3.5 text-white shadow-xl"
            style={{ background: "var(--accent)" }}
          >
            <Icon name="sparkles" size={22} />
          </motion.button>
        )}

        <BottomNav onAdd={() => setSheet({ kind: "add-picker" })} />
        <AchievementToast />

        <AnimatePresence>
          {sheet.kind === "add-picker" && (
            <Sheet title="מה מוסיפים?" onClose={close}>
              <div className="space-y-2">
                <SheetButton
                  icon="plus"
                  label="משימה"
                  sub="דבר אחד לעשות"
                  onClick={() => setSheet({ kind: "task-new" })}
                />
                <SheetButton
                  icon="chain"
                  label="שרשרת"
                  sub="תוכנית צעד־אחר־צעד — שלב נפתח כשהקודם הושלם"
                  onClick={() => setSheet({ kind: "chain" })}
                />
              </div>
            </Sheet>
          )}
          {sheet.kind === "task-new" && <TaskSheet onClose={close} />}
          {sheet.kind === "task-edit" && <TaskSheet task={sheet.task} onClose={close} />}
          {sheet.kind === "actions" && (
            <ActionsSheet
              task={sheet.task}
              onClose={close}
              onPick={(action: TaskSheetAction) => {
                if (action === "edit") setSheet({ kind: "task-edit", task: sheet.task })
                if (action === "branch") setSheet({ kind: "branch", task: sheet.task })
                if (action === "chain") setSheet({ kind: "chain", task: sheet.task })
              }}
            />
          )}
          {sheet.kind === "branch" && <BranchSheet task={sheet.task} onClose={close} />}
          {sheet.kind === "chain" && <ChainSheet fromTask={sheet.task} onClose={close} />}
        </AnimatePresence>

        <AIChatPanel />
      </div>
    </div>
  )
}
