// The Guardian — when the agent speaks, and when it stays quiet.
//
// Silence is the default. This module answers one question: "is something here
// worth interrupting the user for?" Everything is pure logic — a time overlap,
// a broken dependency, an inverted priority. The AI only phrases the result;
// it never decides it.
//
// The bar, in Nathan's words: make me think twice before I wreck my own day —
// without nagging about every little thing.

import type { Task } from "./types"
import {
  estimateDuration,
  isTaskDone,
  localDateISO,
  minutesOfDay,
  parseLocalDateTime,
  slackMinutes,
  type PlanContext,
  type DayPlan,
} from "./planner"
import { habitNudges } from "./habits"

export type ConcernKind =
  | "conflict" // overlaps a fixed commitment
  | "sequence" // breaks a dependency / chain order
  | "inversion" // long-and-calm chosen over short-and-burning
  | "deadline_risk" // not enough room left to finish in time
  | "overload" // the day cannot hold what is asked of it
  | "habit" // a streak needs a hand

export type Severity = "high" | "medium" | "low"

export type Concern = {
  kind: ConcernKind
  severity: Severity
  taskIds: string[]
  message: string
  /** The way forward — a smaller ask, an alternative slot, a reorder. */
  suggestion?: string
}

const RANK: Record<Severity, number> = { high: 0, medium: 1, low: 2 }

const titleOf = (tasks: Task[], id: string) => tasks.find((t) => t.id === id)?.title ?? ""

/**
 * Checked when the user drags a task to a new time: does this move break
 * something? A speed bump, never a wall — the caller can always proceed.
 */
export function guardMove(
  taskId: string,
  newStartAt: string,
  tasks: Task[],
  ctx: PlanContext,
): Concern[] {
  const task = tasks.find((t) => t.id === taskId)
  if (!task) return []

  const concerns: Concern[] = []
  const start = parseLocalDateTime(newStartAt)
  const startMin = minutesOfDay(start)
  const endMin = startMin + estimateDuration(task)
  const date = localDateISO(start)

  // 1. Does it land on top of something immovable? Time the user has already
  // released — snoozed work, a habit already ticked — is not a conflict.
  for (const other of tasks) {
    if (other.id === task.id || other.status === "completed") continue
    if (other.snoozedUntil && other.snoozedUntil > date) continue
    if (other.habit?.history.includes(date)) continue
    if (!other.startAt || other.startAt.slice(0, 10) !== date) continue
    const oStart = minutesOfDay(parseLocalDateTime(other.startAt))
    const oEnd = oStart + estimateDuration(other)
    const overlaps = startMin < oEnd && endMin > oStart
    if (!overlaps) continue
    concerns.push({
      kind: "conflict",
      severity: other.fixed ? "high" : "medium",
      taskIds: [task.id, other.id],
      message: `"${task.title}" מתנגש עם "${other.title}"`,
      suggestion: other.fixed
        ? `"${other.title}" קבוע — אפשר לשים את "${task.title}" מיד אחריו`
        : "אפשר להזיז את אחד מהם",
    })
  }

  // 2. Does it jump ahead of something it depends on?
  for (const blockerId of task.blockedBy ?? []) {
    const blocker = tasks.find((t) => t.id === blockerId)
    // Same definition of "done" the planner uses — a ticked habit counts.
    if (!blocker || isTaskDone(blocker, date)) continue
    const blockerStart = blocker.startAt ? parseLocalDateTime(blocker.startAt) : null
    const beforeBlocker = blockerStart ? start.getTime() < blockerStart.getTime() : true
    if (!beforeBlocker) continue
    concerns.push({
      kind: "sequence",
      severity: "high",
      taskIds: [task.id, blocker.id],
      message: `"${task.title}" תלוי ב"${blocker.title}" שעוד לא הושלם`,
      suggestion: `כדאי לקבוע את "${blocker.title}" קודם`,
    })
  }

  // 3. Does it break the order of its chain?
  if (task.chainId) {
    const earlierOpen = tasks.filter(
      (t) =>
        t.chainId === task.chainId &&
        (t.chainOrder ?? 0) < (task.chainOrder ?? 0) &&
        t.status !== "completed",
    )
    for (const step of earlierOpen) {
      const stepStart = step.startAt ? parseLocalDateTime(step.startAt) : null
      if (stepStart && stepStart.getTime() <= start.getTime()) continue
      concerns.push({
        kind: "sequence",
        severity: "medium",
        taskIds: [task.id, step.id],
        message: `"${step.title}" הוא שלב קודם בשרשרת`,
        suggestion: `לשמור על הסדר: "${step.title}" לפני "${task.title}"`,
      })
    }
  }

  return rank(concerns)
}

/**
 * Priority inversion: settling into a long, calm task while something short and
 * burning is waiting. Nathan's explicit rule — this is the one that protects
 * output without micromanaging.
 */
export function checkInversion(
  startingTaskId: string,
  tasks: Task[],
  ctx: PlanContext,
): Concern | null {
  const task = tasks.find((t) => t.id === startingTaskId)
  if (!task) return null

  const duration = estimateDuration(task)
  const slack = slackMinutes(task, ctx.now)
  const isLongAndCalm = duration >= 60 && (slack === null || slack > 480)
  if (!isLongAndCalm) return null

  // Something short and near its deadline — cheap to clear, expensive to miss.
  // "Near" means inside a day, and always tighter than the task being started.
  const mySlack = slack === null ? Number.POSITIVE_INFINITY : slack
  const nearHorizon = Math.min(1440, mySlack)
  const burning = tasks
    .filter((t) => {
      if (t.id === task.id || t.status === "completed") return false
      const s = slackMinutes(t, ctx.now)
      return s !== null && s < nearHorizon && estimateDuration(t) <= 30
    })
    .sort((a, b) => (slackMinutes(a, ctx.now) ?? 0) - (slackMinutes(b, ctx.now) ?? 0))[0]

  if (!burning) return null
  return {
    kind: "inversion",
    severity: "medium",
    taskIds: [task.id, burning.id],
    message: `"${burning.title}" קצר ובוער — ו"${task.title}" ייקח ${Math.round(duration / 60)} שעות`,
    suggestion: `להוריד את "${burning.title}" מהראש קודם, זה כמה דקות`,
  }
}

/** Everything worth saying about today, ranked. */
export function dayConcerns(
  tasks: Task[],
  plan: DayPlan,
  ctx: PlanContext,
  limit = 3,
): Concern[] {
  const concerns: Concern[] = []
  const today = localDateISO(ctx.now)

  for (const issue of plan.issues) {
    if (issue.kind === "deadline_risk") {
      concerns.push({
        kind: "deadline_risk",
        severity: "high",
        taskIds: issue.taskIds,
        message: issue.detail,
        suggestion: "אפשר לדחות את הדדליין או לקצר את המשימה",
      })
    } else if (issue.kind === "overload") {
      concerns.push({
        kind: "overload",
        severity: issue.severity,
        taskIds: issue.taskIds,
        message: issue.detail,
        suggestion: "אפשר להזיז חלק למחר",
      })
    } else if (issue.kind === "conflict") {
      concerns.push({
        kind: "conflict",
        severity: "high",
        taskIds: issue.taskIds,
        message: issue.detail,
      })
    }
  }

  for (const nudge of habitNudges(tasks, today)) {
    concerns.push({
      kind: "habit",
      severity: nudge.severity,
      taskIds: [nudge.taskId],
      message: nudge.message,
      suggestion: nudge.suggestion,
    })
  }

  // At most one concern per kind before falling back to severity order. Three
  // deadline warnings in a row would bury the habit nudge underneath them, and
  // a wall of the same message reads as nagging rather than help.
  const ranked = rank(concerns)
  const seen = new Set<ConcernKind>()
  const diverse = ranked.filter((c) => {
    if (seen.has(c.kind)) return false
    seen.add(c.kind)
    return true
  })
  return [...diverse, ...ranked.filter((c) => !diverse.includes(c))].slice(0, limit)
}

function rank(list: Concern[]): Concern[] {
  return [...list].sort(
    (a, b) => RANK[a.severity] - RANK[b.severity] || a.taskIds[0].localeCompare(b.taskIds[0]),
  )
}
