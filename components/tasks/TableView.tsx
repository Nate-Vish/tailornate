"use client"

import { useMemo, useState } from "react"
import { clsx } from "clsx"
import { Icon } from "./Icon"
import { ColorPill, PriorityPill, scoreColor } from "./pills"
import { useTasksStore, taskXP, isChainLocked, isSnoozed } from "@/lib/tasks/store"
import { calcScore, priorityLabel, sizeLabel, statusLabel } from "@/lib/tasks/scoring"
import type { AIRequestBody, AIResponse } from "@/lib/tasks/ai"
import type { Task } from "@/lib/tasks/types"

type StatusFilter = "all" | "open" | "done"
type PeriodFilter = "all" | "week" | "month" | "quarter" | "year"
type SortKey = "score" | "due" | "created" | "completed"

const periodDays: Record<Exclude<PeriodFilter, "all">, number> = {
  week: 7,
  month: 31,
  quarter: 92,
  year: 366,
}

function inPeriod(t: Task, period: PeriodFilter): boolean {
  if (period === "all") return true
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - periodDays[period])
  const anchor = t.status === "completed" ? t.completedAt ?? t.createdAt : t.createdAt
  return new Date(anchor) >= cutoff
}

function fmtDate(iso?: string): string {
  if (!iso) return "—"
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getFullYear()).slice(2)}`
}

function toCSV(rows: string[][]): string {
  return rows.map((r) => r.map((c) => `"${c.replaceAll('"', '""')}"`).join(",")).join("\n")
}

// The "big picture" screen: every task ever, filterable like a spreadsheet,
// exportable to CSV, and analyzable by the AI.
export function TableView({ onActions }: { onActions: (task: Task) => void }) {
  const tasks = useTasksStore((s) => s.tasks)
  const categories = useTasksStore((s) => s.categories)
  const tags = useTasksStore((s) => s.tags)
  const chains = useTasksStore((s) => s.chains)
  const weights = useTasksStore((s) => s.weights)

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<StatusFilter>("all")
  const [categoryId, setCategoryId] = useState("all")
  const [period, setPeriod] = useState<PeriodFilter>("all")
  const [sortKey, setSortKey] = useState<SortKey>("score")
  const [sortDesc, setSortDesc] = useState(true)
  const [analysis, setAnalysis] = useState("")
  const [analyzing, setAnalyzing] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const rows = tasks.filter((t) => {
      if (status === "open" && t.status === "completed") return false
      if (status === "done" && t.status !== "completed") return false
      if (categoryId !== "all" && t.categoryId !== categoryId) return false
      if (!inPeriod(t, period)) return false
      if (q && !t.title.toLowerCase().includes(q)) return false
      return true
    })
    const dir = sortDesc ? -1 : 1
    return rows.sort((a, b) => {
      const va =
        sortKey === "score"
          ? calcScore(a, weights)
          : sortKey === "due"
            ? a.dueDate ?? "9999"
            : sortKey === "created"
              ? a.createdAt
              : a.completedAt ?? ""
      const vb =
        sortKey === "score"
          ? calcScore(b, weights)
          : sortKey === "due"
            ? b.dueDate ?? "9999"
            : sortKey === "created"
              ? b.createdAt
              : b.completedAt ?? ""
      if (va < vb) return -dir
      if (va > vb) return dir
      return 0
    })
  }, [tasks, search, status, categoryId, period, sortKey, sortDesc, weights])

  const doneCount = filtered.filter((t) => t.status === "completed").length
  const earnedXP = filtered
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + taskXP(t), 0)

  const exportCSV = () => {
    const header = ["משימה", "תחום", "תג", "שרשרת", "דחיפות", "גודל", "סטטוס", "דדליין", "נוצר", "הושלם", "ציון", "XP"]
    const rows = filtered.map((t) => {
      const cat = categories.find((c) => c.id === t.categoryId)
      const tag = tags.find((x) => x.id === t.tagId)
      const chain = chains.find((c) => c.id === t.chainId)
      return [
        t.title,
        cat?.name ?? "",
        tag?.name ?? "",
        chain?.title ?? "",
        priorityLabel[t.priority],
        sizeLabel[t.size],
        statusLabel[t.status],
        t.dueDate ?? "",
        t.createdAt.slice(0, 10),
        t.completedAt?.slice(0, 10) ?? "",
        String(calcScore(t, weights)),
        String(taskXP(t)),
      ]
    })
    // BOM so Excel opens Hebrew correctly
    const blob = new Blob(["﻿" + toCSV([header, ...rows])], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "madko-tasks.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const analyze = async () => {
    if (analyzing) return
    setAnalyzing(true)
    setAnalysis("")
    try {
      const body: AIRequestBody = {
        mode: "analyze",
        messages: [
          {
            role: "user",
            content:
              "נתח את המשימות המסוננות: מה הושלם, מה תקוע והכי הרבה זמן, איזה תחומים מוזנחים, ומה 2-3 ההמלצות שלך.",
          },
        ],
        state: {
          today: new Date().toISOString().slice(0, 10),
          categories: categories.map((c) => ({ id: c.id, name: c.name })),
          tags: tags.map((t) => ({ id: t.id, name: t.name, categoryId: t.categoryId })),
          chains: chains.map((c) => ({ id: c.id, title: c.title })),
          tasks: filtered.slice(0, 300).map((t) => ({
            id: t.id,
            title: t.title,
            priority: t.priority,
            size: t.size,
            status: t.status,
            categoryId: t.categoryId,
            tagId: t.tagId,
            dueDate: t.dueDate,
            createdAt: t.createdAt.slice(0, 10),
            completedAt: t.completedAt?.slice(0, 10),
            parentId: t.parentId,
            chainId: t.chainId,
            score: calcScore(t, weights),
          })),
        },
      }
      const res = await fetch("/api/tasks-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = (await res.json()) as AIResponse
      setAnalysis(data.reply || "לא הצלחתי לנתח הפעם.")
    } catch {
      setAnalysis("בעיית חיבור — נסה שוב.")
    } finally {
      setAnalyzing(false)
    }
  }

  const sortHeader = (key: SortKey, label: string) => (
    <button
      onClick={() => {
        if (sortKey === key) setSortDesc((d) => !d)
        else {
          setSortKey(key)
          setSortDesc(true)
        }
      }}
      className={clsx("flex items-center gap-0.5", sortKey === key && "text-[var(--accent)]")}
    >
      {label}
      {sortKey === key && <Icon name={sortDesc ? "chevron-down" : "chevron-up"} size={11} />}
    </button>
  )

  return (
    <div className="pb-28">
      <header className="px-4 pb-3 pt-5">
        <p className="text-[11px] text-muted-foreground">התמונה הגדולה</p>
        <h1 className="text-[19px] font-semibold text-foreground">כל המשימות</h1>
      </header>

      <div className="space-y-2 px-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חיפוש…"
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-[13px] text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-[var(--accent)]"
        />
        <div className="grid grid-cols-3 gap-1.5">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            className="rounded-lg border border-border bg-card px-2 py-1.5 text-[12px] text-foreground outline-none"
          >
            <option value="all">הכל</option>
            <option value="open">פתוחות</option>
            <option value="done">הושלמו</option>
          </select>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="rounded-lg border border-border bg-card px-2 py-1.5 text-[12px] text-foreground outline-none"
          >
            <option value="all">כל התחומים</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
            className="rounded-lg border border-border bg-card px-2 py-1.5 text-[12px] text-foreground outline-none"
          >
            <option value="all">כל הזמן</option>
            <option value="week">שבוע אחרון</option>
            <option value="month">חודש אחרון</option>
            <option value="quarter">3 חודשים</option>
            <option value="year">שנה</option>
          </select>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-[var(--muted)] px-3 py-2">
          <span className="text-[12px] text-muted-foreground">
            {filtered.length} משימות · {doneCount} הושלמו · {earnedXP} XP
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icon name="download" size={12} />
              CSV
            </button>
            <button
              onClick={analyze}
              disabled={analyzing || filtered.length === 0}
              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ background: "var(--accent)" }}
            >
              <Icon name="sparkles" size={12} />
              {analyzing ? "מנתח…" : "ניתוח AI"}
            </button>
          </div>
        </div>

        {(analysis || analyzing) && (
          <div
            className="whitespace-pre-line rounded-xl border border-border bg-card px-4 py-3 text-[13px] leading-relaxed text-foreground"
            style={{ borderInlineStartWidth: 3, borderInlineStartColor: "var(--accent)" }}
          >
            {analyzing ? "מסתכל על הנתונים…" : analysis}
          </div>
        )}
      </div>

      <div className="mt-3 overflow-x-auto px-4">
        <table className="w-full min-w-[640px] border-separate border-spacing-0 text-[12px]">
          <thead>
            <tr className="text-start text-[11px] text-muted-foreground">
              {["", "משימה", "תחום", "דחיפות", "סטטוס"].map((h, i) => (
                <th key={i} className="border-b border-border px-2 py-2 text-start font-medium">
                  {h}
                </th>
              ))}
              <th className="border-b border-border px-2 py-2 text-start font-medium">
                {sortHeader("due", "דדליין")}
              </th>
              <th className="border-b border-border px-2 py-2 text-start font-medium">
                {sortHeader("created", "נוצר")}
              </th>
              <th className="border-b border-border px-2 py-2 text-start font-medium">
                {sortHeader("completed", "הושלם")}
              </th>
              <th className="border-b border-border px-2 py-2 text-start font-medium">
                {sortHeader("score", "ציון")}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => {
              const cat = categories.find((c) => c.id === t.categoryId)
              const tag = tags.find((x) => x.id === t.tagId)
              const chain = chains.find((c) => c.id === t.chainId)
              const done = t.status === "completed"
              const locked = !done && isChainLocked(t, tasks)
              const score = calcScore(t, weights)
              return (
                <tr
                  key={t.id}
                  onClick={() => onActions(t)}
                  className="cursor-pointer transition-colors hover:bg-[var(--card-hover)]"
                >
                  <td className="border-b border-border px-2 py-2">
                    {done ? (
                      <span style={{ color: "var(--success)" }}>
                        <Icon name="check-check" size={14} />
                      </span>
                    ) : locked ? (
                      <span className="text-muted-foreground/50">
                        <Icon name="lock" size={13} />
                      </span>
                    ) : null}
                  </td>
                  <td className="max-w-[220px] border-b border-border px-2 py-2">
                    <span className={clsx("block truncate", done ? "text-muted-foreground line-through" : "text-foreground")}>
                      {t.parentId && <span className="text-muted-foreground">↳ </span>}
                      {t.title}
                    </span>
                    {(tag || chain) && (
                      <span className="mt-0.5 flex gap-1">
                        {tag && <ColorPill label={tag.name} color={tag.color} />}
                        {chain && (
                          <span className="text-[10px] text-muted-foreground">🔗 {chain.title}</span>
                        )}
                      </span>
                    )}
                  </td>
                  <td className="border-b border-border px-2 py-2">
                    {cat && <ColorPill label={cat.name} color={cat.color} />}
                  </td>
                  <td className="border-b border-border px-2 py-2">
                    <PriorityPill priority={t.priority} />
                  </td>
                  <td className="whitespace-nowrap border-b border-border px-2 py-2 text-muted-foreground">
                    {locked ? "ממתין בשרשרת" : !done && isSnoozed(t) ? `נדחה עד ${t.snoozedUntil}` : statusLabel[t.status]}
                  </td>
                  <td className="whitespace-nowrap border-b border-border px-2 py-2 text-muted-foreground">
                    {fmtDate(t.dueDate)}
                  </td>
                  <td className="whitespace-nowrap border-b border-border px-2 py-2 text-muted-foreground">
                    {fmtDate(t.createdAt)}
                  </td>
                  <td className="whitespace-nowrap border-b border-border px-2 py-2 text-muted-foreground">
                    {fmtDate(t.completedAt)}
                  </td>
                  <td className="border-b border-border px-2 py-2 font-semibold" style={{ color: done ? "var(--muted-foreground)" : scoreColor(score) }}>
                    {done ? "—" : score}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="rounded-lg bg-[var(--muted)] px-3 py-6 text-center text-[13px] text-muted-foreground">
            אין תוצאות לסינון הזה
          </p>
        )}
      </div>
    </div>
  )
}
