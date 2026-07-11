"use client"

import { Icon } from "./Icon"
import { cvar } from "./pills"
import { useTasksStore, selectDoneCount, selectBucketXP, levelFor, progressInLevel } from "@/lib/tasks/store"

export function SquadView() {
  const categories = useTasksStore((s) => s.categories)
  const tags = useTasksStore((s) => s.tags)
  const tasks = useTasksStore((s) => s.tasks)
  const openDrilldown = useTasksStore((s) => s.openDrilldown)

  const totalDone = tasks.filter((t) => t.status === "completed").length
  const enriched = categories.map((cat) => {
    const count = selectDoneCount({ tasks }, { categoryId: cat.id })
    const xp = selectBucketXP({ tasks }, { categoryId: cat.id })
    return { cat, count, xp, level: levelFor(xp), progress: progressInLevel(xp) }
  })
  const maxXP = Math.max(...enriched.map((e) => e.xp), 1)

  return (
    <div className="pb-28">
      <header className="px-4 pb-3 pt-5">
        <p className="text-[11px] text-muted-foreground">איזון החיים</p>
        <h1 className="text-[19px] font-semibold text-foreground">התחומים שלך</h1>
      </header>

      <div className="mx-4 mb-4 grid grid-cols-3 gap-2 rounded-xl bg-[var(--muted)] p-3">
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">הושלמו סה&quot;כ</p>
          <p className="mt-1 text-[18px] font-semibold text-foreground">{totalDone}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">רמה ממוצעת</p>
          <p className="mt-1 text-[18px] font-semibold text-foreground">
            {Math.round(enriched.reduce((s, e) => s + e.level, 0) / (enriched.length || 1))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">פעילות</p>
          <p className="mt-1 text-[18px] font-semibold" style={{ color: "var(--accent)" }}>
            {tasks.filter((t) => t.status !== "completed").length}
          </p>
        </div>
      </div>

      <div className="px-4">
        <p className="mb-2 text-[12px] text-muted-foreground">איזון בין התחומים</p>
        <div className="rounded-xl border border-border bg-card p-3">
          {enriched.map(({ cat, count, xp, level }) => {
            const pct = Math.round((xp / maxXP) * 100)
            return (
              <div key={cat.id} className="mb-2.5 last:mb-0">
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: cat.color }} />
                    <span className="text-[12px] text-foreground">{cat.name}</span>
                    <span className="text-[10px] text-muted-foreground">רמה {level}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{count} הושלמו · {xp} XP</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--muted)]">
                  <div
                    className="h-full transition-all"
                    style={{ width: `${Math.max(pct, 6)}%`, background: cat.color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-4 px-4">
        <p className="mb-2 text-[12px] text-muted-foreground">כל התחומים</p>
        <div className="grid grid-cols-2 gap-2">
          {enriched.map(({ cat, level, xp, progress }) => (
            <button
              key={cat.id}
              onClick={() => openDrilldown(cat.id)}
              className="rounded-xl border border-border bg-card p-3 text-start transition-colors hover:bg-[var(--card-hover)]"
              style={{ borderTopWidth: 3, borderTopColor: cat.color }}
            >
              <div className="flex items-start justify-between">
                <div className="relative">
                  <div
                    className="cicon flex h-11 w-11 items-center justify-center rounded-full"
                    style={cvar(cat.color)}
                  >
                    <Icon name={cat.icon} size={20} />
                  </div>
                  <span
                    className="absolute -bottom-1 -end-1 rounded-full px-1.5 py-[1px] text-[10px] font-medium leading-tight text-white"
                    style={{ background: cat.color }}
                  >
                    {level}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">{xp} XP</span>
              </div>
              <p className="mt-2 text-[13px] font-medium text-foreground">{cat.name}</p>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-[var(--muted)]">
                <div className="h-full" style={{ width: `${progress}%`, background: cat.color }} />
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {Math.round(progress)}% לרמה {level + 1}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 px-4">
        <p className="mb-2 text-[12px] text-muted-foreground">תגים פעילים</p>
        <div className="rounded-xl border border-border bg-card p-2">
          {tags.map((t) => {
            const done = selectDoneCount({ tasks }, { tagId: t.id })
            const tagXp = selectBucketXP({ tasks }, { tagId: t.id })
            return (
              <div key={t.id} className="flex items-center gap-2 p-1.5">
                <div className="h-6 w-6 rounded-full" style={{ background: t.color }} />
                <span className="flex-1 text-[12px] text-foreground">{t.name}</span>
                <span className="cpill rounded-full px-2 py-[1px] text-[10px]" style={cvar(t.color)}>
                  רמה {levelFor(tagXp)} · {done}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
