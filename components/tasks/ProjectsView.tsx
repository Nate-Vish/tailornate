"use client"

import { useMemo, useState } from "react"
import { AnimatePresence } from "framer-motion"
import { Icon } from "./Icon"
import { cvar } from "./pills"
import { TaskCard } from "./TaskCard"
import { CategorySheet, TagSheet } from "./CategoryTagSheets"
import {
  useTasksStore,
  selectSortedActive,
  selectDoneCount,
  selectBucketXP,
  levelFor,
} from "@/lib/tasks/store"
import type { Task } from "@/lib/tasks/types"

type SheetState =
  | { kind: "none" }
  | { kind: "cat-new" }
  | { kind: "cat-edit"; id: string }
  | { kind: "tag-new"; categoryId: string }
  | { kind: "tag-edit"; id: string }

export function ProjectsView({ onActions }: { onActions: (task: Task) => void }) {
  const categories = useTasksStore((s) => s.categories)
  const tags = useTasksStore((s) => s.tags)
  const tasks = useTasksStore((s) => s.tasks)
  const weights = useTasksStore((s) => s.weights)
  const drilldownCategoryId = useTasksStore((s) => s.drilldownCategoryId)
  const openDrilldown = useTasksStore((s) => s.openDrilldown)
  const setView = useTasksStore((s) => s.setView)

  const [sheet, setSheet] = useState<SheetState>({ kind: "none" })
  const close = () => setSheet({ kind: "none" })

  const category = categories.find((c) => c.id === drilldownCategoryId)

  const sortedInCat = useMemo(
    () =>
      category
        ? selectSortedActive({ tasks, weights }).filter(
            (t) => t.categoryId === category.id && !t.parentId,
          )
        : [],
    [tasks, weights, category],
  )

  const sheets = (
    <AnimatePresence>
      {sheet.kind === "cat-new" && <CategorySheet onClose={close} />}
      {sheet.kind === "cat-edit" && (
        <CategorySheet category={categories.find((c) => c.id === sheet.id)} onClose={close} />
      )}
      {sheet.kind === "tag-new" && <TagSheet categoryId={sheet.categoryId} onClose={close} />}
      {sheet.kind === "tag-edit" && (() => {
        const t = tags.find((x) => x.id === sheet.id)
        return t ? <TagSheet tag={t} categoryId={t.categoryId} onClose={close} /> : null
      })()}
    </AnimatePresence>
  )

  if (!category) {
    return (
      <div className="pb-28">
        <header className="px-4 pb-4 pt-5">
          <p className="text-[11px] text-muted-foreground">מבט על</p>
          <h1 className="text-[19px] font-semibold text-foreground">כל התחומים</h1>
        </header>

        <div className="space-y-2 px-4">
          {categories.map((c) => {
            const done = selectDoneCount({ tasks }, { categoryId: c.id })
            const catXp = selectBucketXP({ tasks }, { categoryId: c.id })
            const active = tasks.filter((t) => t.categoryId === c.id && t.status !== "completed").length
            const catTags = tags.filter((t) => t.categoryId === c.id)
            return (
              <div
                key={c.id}
                className="cstripe flex items-center rounded-xl border border-border bg-card"
                style={{ borderInlineEndWidth: 4, ...cvar(c.color) }}
              >
                <button
                  onClick={() => openDrilldown(c.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 p-3 text-start transition-colors hover:bg-[var(--card-hover)]"
                >
                  <div
                    className="cicon flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                    style={cvar(c.color)}
                  >
                    <Icon name={c.icon} size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[14px] font-medium text-foreground">{c.name}</span>
                      <span className="cpill shrink-0 rounded-full px-2 py-[1px] text-[10px]" style={cvar(c.color)}>
                        רמה {levelFor(catXp)}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {active} פעילות · {catTags.length} תגים · {done} הושלמו
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => setSheet({ kind: "cat-edit", id: c.id })}
                  aria-label={`ערוך ${c.name}`}
                  className="flex h-10 w-10 shrink-0 items-center justify-center text-muted-foreground/60 transition-colors hover:text-foreground"
                >
                  <Icon name="pencil" size={15} />
                </button>
              </div>
            )
          })}

          <button
            onClick={() => setSheet({ kind: "cat-new" })}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-3 text-[13px] text-muted-foreground transition-colors hover:bg-[var(--card-hover)] hover:text-foreground"
          >
            <Icon name="plus" size={15} />
            תחום חדש
          </button>
        </div>

        {sheets}
      </div>
    )
  }

  const catTags = tags.filter((t) => t.categoryId === category.id)
  const catXp = selectBucketXP({ tasks }, { categoryId: category.id })
  const activeInCat = tasks.filter(
    (t) => t.categoryId === category.id && t.status !== "completed",
  ).length
  const doneThisWeek = tasks.filter((t) => {
    if (t.categoryId !== category.id || t.status !== "completed" || !t.completedAt) return false
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return new Date(t.completedAt) > weekAgo
  }).length

  return (
    <div className="pb-28">
      <header className="flex items-center gap-2 px-4 py-4">
        <button
          onClick={() => setView("projects")}
          aria-label="חזרה"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-[var(--card-hover)]"
        >
          <Icon name="chevron-right" size={18} />
        </button>
        <div className="flex-1">
          <p className="text-[11px] text-muted-foreground">תחום</p>
          <h1 className="text-[17px] font-semibold text-foreground">{category.name}</h1>
        </div>
        <button
          onClick={() => setSheet({ kind: "cat-edit", id: category.id })}
          aria-label="ערוך תחום"
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-[var(--card-hover)] hover:text-foreground"
        >
          <Icon name="pencil" size={16} />
        </button>
        <div
          className="cicon relative flex h-11 w-11 items-center justify-center rounded-full"
          style={cvar(category.color)}
        >
          <Icon name={category.icon} size={20} />
          <span
            className="absolute -bottom-1 -end-1 rounded-full px-1.5 py-[1px] text-[10px] font-medium leading-tight text-white"
            style={{ background: category.color }}
          >
            {levelFor(catXp)}
          </span>
        </div>
      </header>

      <div className="mb-4 flex gap-2 px-4">
        <div className="flex-1 rounded-lg bg-[var(--muted)] px-3 py-2.5">
          <p className="text-[11px] text-muted-foreground">פעילות</p>
          <p className="mt-0.5 text-[17px] font-medium text-foreground">{activeInCat}</p>
        </div>
        <div className="flex-1 rounded-lg bg-[var(--muted)] px-3 py-2.5">
          <p className="text-[11px] text-muted-foreground">השבוע נסגרו</p>
          <p className="mt-0.5 text-[17px] font-medium" style={{ color: "var(--success)" }}>
            {doneThisWeek}
          </p>
        </div>
      </div>

      <div className="px-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[12px] text-muted-foreground">תתי פרויקטים (תגים)</p>
          <button
            onClick={() => setSheet({ kind: "tag-new", categoryId: category.id })}
            className="flex items-center gap-1 text-[12px] text-[var(--accent)] hover:underline"
          >
            <Icon name="plus" size={13} />
            תג חדש
          </button>
        </div>
        <div className="mb-4 space-y-2">
          {catTags.map((t) => {
            const done = selectDoneCount({ tasks }, { tagId: t.id })
            const tagXp = selectBucketXP({ tasks }, { tagId: t.id })
            const active = tasks.filter((x) => x.tagId === t.id && x.status !== "completed").length
            const universe = active + done || 1
            const progress = Math.round((done / universe) * 100)
            return (
              <div
                key={t.id}
                className="cstripe flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                style={{ borderInlineEndWidth: 4, ...cvar(t.color) }}
              >
                <div className="cicon flex h-9 w-9 items-center justify-center rounded-full" style={cvar(t.color)}>
                  <Icon name={t.icon} size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-medium text-foreground">{t.name}</span>
                    <span className="cpill rounded-full px-2 py-[1px] text-[10px]" style={cvar(t.color)}>
                      רמה {levelFor(tagXp)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[var(--muted)]">
                    <div className="h-full" style={{ width: `${progress}%`, background: t.color }} />
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {active} פעילות · {done} הושלמו · {progress}%
                  </p>
                </div>
                <button
                  onClick={() => setSheet({ kind: "tag-edit", id: t.id })}
                  aria-label={`ערוך ${t.name}`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:text-foreground"
                >
                  <Icon name="pencil" size={14} />
                </button>
              </div>
            )
          })}
          {catTags.length === 0 && (
            <p className="rounded-lg bg-[var(--muted)] px-3 py-3 text-center text-[12px] text-muted-foreground">
              אין תגים עדיין — הוסף תת־פרויקט בכפתור &quot;תג חדש&quot;.
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-border px-4 pt-4">
        <p className="mb-3 text-[13px] font-medium text-foreground">משימות פעילות</p>
        <div className="space-y-2">
          {sortedInCat.map((t) => (
            <TaskCard key={t.id} task={t} draggable={false} onActions={onActions} />
          ))}
          {sortedInCat.length === 0 && (
            <p className="rounded-lg bg-[var(--muted)] px-3 py-4 text-center text-[12px] text-muted-foreground">
              אין משימות פעילות בתחום 🎉
            </p>
          )}
        </div>
      </div>

      {sheets}
    </div>
  )
}
