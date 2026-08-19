// The planning engine — Madko's brain.
//
// Everything here is a PURE, DETERMINISTIC function: same input, same output,
// no clock reads, no randomness, no network, no AI. Time is always injected via
// `now` so the engine is fully testable. The AI never computes a plan; it only
// feeds fuzzy input (a spoken duration) and explains the result in words.
//
// Design (see docs/BENCHMARK-engine.md):
//   1. prune by dependencies  → what is actually ready (topological)
//   2. score by SLACK         → time left minus the work itself, not raw due date
//   3. place greedily         → earliest free slot that fits, around fixed blocks
//   4. keep it stable         → re-planning moves as little as possible
//   5. report problems        → the Guardian's raw material

import type { Task, Weights } from "./types"
import { calcScore } from "./scoring"
import { isDueOn } from "./habits"

// ── time helpers (all LOCAL — never UTC, which shifts the calendar day) ─────

export function localDateISO(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/** Parse "YYYY-MM-DD" as LOCAL midnight. */
export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

/** Parse a local ISO datetime ("2026-07-15T14:30"). Falls back to date-only. */
export function parseLocalDateTime(iso: string): Date {
  if (iso.length <= 10) return parseLocalDate(iso)
  const [datePart, timePart] = iso.split("T")
  const [y, m, d] = datePart.split("-").map(Number)
  const [hh, mm] = timePart.slice(0, 5).split(":").map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0)
}

export function minutesOfDay(d: Date): number {
  return d.getHours() * 60 + d.getMinutes()
}

/** A Date for `date` (YYYY-MM-DD) at `minutes` past local midnight. */
export function atMinutes(date: string, minutes: number): Date {
  const base = parseLocalDate(date)
  base.setMinutes(base.getMinutes() + minutes)
  return base
}

// ── duration ───────────────────────────────────────────────────────────────

const SIZE_MINUTES: Record<Task["size"], number> = { short: 15, medium: 45, long: 120 }

/**
 * Duration cascade (cheapest, most confident first): an explicit estimate, then
 * a habit's quota, then the size default. A learned per-user average plugs in
 * here later without changing any caller.
 */
export function estimateDuration(task: Task): number {
  if (typeof task.durationMinutes === "number" && task.durationMinutes > 0) {
    return task.durationMinutes
  }
  if (task.habit?.quotaMinutes && task.habit.quotaMinutes > 0) return task.habit.quotaMinutes
  return SIZE_MINUTES[task.size] ?? 30
}

// ── dependencies ───────────────────────────────────────────────────────────

/**
 * "Done" has ONE definition across the whole engine. A habit never carries
 * status "completed" (it recurs), so asking only about status would strand
 * anything waiting on a habit forever — silently, since the dependent would
 * vanish from both the plan and the unplaced list.
 */
export function isTaskDone(task: Task | undefined, date: string): boolean {
  if (!task) return false
  if (task.habit) return task.habit.history.includes(date)
  return task.status === "completed"
}

/**
 * Tasks whose blockers are all satisfied. A blocker id that no longer exists is
 * treated as satisfied — after sync, records can arrive out of order and a
 * missing reference must never strand real work.
 */
export function unblocked(task: Task, byId: Map<string, Task>, date: string): boolean {
  if (!task.blockedBy?.length) return true
  return task.blockedBy.every((id) => {
    const b = byId.get(id)
    return !b || isTaskDone(b, date)
  })
}

/**
 * Ids that sit on a dependency cycle. A cycle can never resolve on its own, so
 * the engine reports it and lets the work through rather than hiding it forever.
 */
export function findCycles(tasks: Task[]): string[] {
  const byId = new Map(tasks.map((t) => [t.id, t]))
  const state = new Map<string, 0 | 1 | 2>() // 0 unvisited, 1 in-stack, 2 done
  const onCycle = new Set<string>()

  const visit = (id: string, stack: string[]) => {
    const s = state.get(id) ?? 0
    if (s === 2) return
    if (s === 1) {
      // Found a back-edge: everything from this id up the stack is on the cycle.
      const from = stack.indexOf(id)
      if (from >= 0) stack.slice(from).forEach((x) => onCycle.add(x))
      return
    }
    state.set(id, 1)
    stack.push(id)
    for (const dep of byId.get(id)?.blockedBy ?? []) {
      if (byId.has(dep)) visit(dep, stack)
    }
    stack.pop()
    state.set(id, 2)
  }

  // Sorted ids keep cycle-breaking deterministic across runs.
  for (const id of [...byId.keys()].sort()) visit(id, [])
  return [...onCycle].sort()
}

/** How many tasks transitively wait on this one (critical-path weight). */
export function blockingWeights(tasks: Task[]): Map<string, number> {
  const dependents = new Map<string, string[]>()
  for (const t of tasks) {
    for (const dep of t.blockedBy ?? []) {
      const list = dependents.get(dep) ?? []
      list.push(t.id)
      dependents.set(dep, list)
    }
  }
  const memo = new Map<string, number>()
  const count = (id: string, seen: Set<string>): number => {
    if (memo.has(id)) return memo.get(id)!
    if (seen.has(id)) return 0 // cycle guard
    seen.add(id)
    let total = 0
    let touchedCycle = false
    for (const child of dependents.get(id) ?? []) {
      if (seen.has(child)) touchedCycle = true
      total += 1 + count(child, seen)
    }
    seen.delete(id)
    // A value computed while a cycle guard fired depends on which node the walk
    // started from — caching it would make the result order-dependent, breaking
    // the determinism guarantee.
    if (!touchedCycle) memo.set(id, total)
    return total
  }
  const out = new Map<string, number>()
  for (const t of tasks) out.set(t.id, count(t.id, new Set()))
  return out
}

// ── scoring ────────────────────────────────────────────────────────────────

export type PlanContext = {
  /** Injected clock — the engine never reads the real time itself. */
  now: Date
  weights: Weights
  workingStartHour?: number
  workingEndHour?: number
}

const WORK_START = 8
const WORK_END = 22

/**
 * The moment this task is measured against.
 *
 * These are two different things and conflating them was a real bug: `startAt`
 * is an APPOINTMENT (be there at 14:00 — the meeting is the work), while
 * `dueDate` is a DEADLINE (finish some work before the day ends).
 */
export function deadlineOf(task: Task): { at: Date; kind: "appointment" | "deadline" } | null {
  if (task.startAt) return { at: parseLocalDateTime(task.startAt), kind: "appointment" }
  if (task.dueDate) {
    const d = parseLocalDate(task.dueDate)
    d.setHours(23, 59, 0, 0)
    return { at: d, kind: "deadline" }
  }
  return null
}

/**
 * Slack = the breathing room left.
 *
 * For a deadline it is time-until MINUS the work itself — the core improvement
 * over sorting by due date, since a 3-hour task due in 4 hours is tighter than
 * a 10-minute task due in 2 hours. For an appointment it is simply time-until:
 * you do not have to *finish* a meeting before it starts, you have to be there.
 */
export function slackMinutes(task: Task, now: Date): number | null {
  const deadline = deadlineOf(task)
  if (!deadline) return null
  const until = (deadline.at.getTime() - now.getTime()) / 60000
  return deadline.kind === "appointment" ? until : until - estimateDuration(task)
}

/**
 * Urgency from slack: rises smoothly as room runs out, and keeps rising once
 * late. Past the deadline it approaches — but never reaches — 100, so a task
 * two weeks overdue always outranks one that slipped this morning. A hard cap
 * would make every late task look equally late, which is exactly the "overdue
 * doesn't escalate" flaw this replaces.
 */
export function slackUrgency(slack: number | null): number {
  if (slack === null) return 0
  if (slack <= 0) return 60 + 40 * (1 - Math.exp(slack / 2880)) // 2 days ≈ 63% of the way
  return 60 * Math.exp(-slack / 240)
}

export function criticalityBonus(blocking: number): number {
  return Math.min(25, blocking * 8)
}

/**
 * The planning score: the user's own tuned score, plus time pressure, plus how
 * much other work is waiting on this. Rounded to 2 decimals so near-ties stay
 * distinguishable and ordering is stable.
 */
export function planScore(task: Task, ctx: PlanContext, blocking = 0): number {
  const base = calcScore(task, ctx.weights)
  const raw = base + slackUrgency(slackMinutes(task, ctx.now)) + criticalityBonus(blocking)
  return Math.round(raw * 100) / 100
}

// ── the ready set ──────────────────────────────────────────────────────────

const isSnoozedOn = (t: Task, date: string) => !!t.snoozedUntil && t.snoozedUntil > date

/** A chain step is locked while an earlier step is still open. */
function chainLocked(task: Task, tasks: Task[]): boolean {
  if (!task.chainId) return false
  return tasks.some(
    (t) =>
      t.chainId === task.chainId &&
      (t.chainOrder ?? 0) < (task.chainOrder ?? 0) &&
      t.status !== "completed",
  )
}

/**
 * What can actually be worked on right now: not done, not snoozed, not waiting
 * on a blocker or an earlier chain step, and not a container (a parent's
 * children are the real work).
 */
export function readySet(tasks: Task[], ctx: PlanContext): Task[] {
  const date = localDateISO(ctx.now)
  const byId = new Map(tasks.map((t) => [t.id, t]))
  const hasChildren = new Set(tasks.filter((t) => t.parentId).map((t) => t.parentId!))
  const cyclic = new Set(findCycles(tasks))

  return tasks.filter((t) => {
    if (t.status === "completed") return false
    if (isSnoozedOn(t, date)) return false
    if (t.habit) {
      // Ticked today → finished for today. Not due today → not today's problem.
      if (t.habit.history.includes(date)) return false
      if (!isDueOn(t.habit, date)) return false
    }
    if (hasChildren.has(t.id)) return false
    if (chainLocked(t, tasks)) return false
    // A cycle can never satisfy itself — let it through and report it instead.
    if (cyclic.has(t.id)) return true
    return unblocked(t, byId, date)
  })
}

/**
 * Does this task belong to the day being planned?
 *
 * "committed" is work the day actually owes: a commitment at a set time, a
 * deadline today or already missed, a habit due today. "optional" is backlog —
 * genuinely useful to suggest when there is room, but it must NOT count as
 * overload when it does not fit, or the agent would nag every single day about
 * a backlog that was never due.
 */
export function dayRole(task: Task, date: string): "committed" | "optional" | "other-day" {
  if (task.startAt) {
    return task.startAt.slice(0, 10) === date ? "committed" : "other-day"
  }
  if (task.habit) return "committed"
  if (task.dueDate) return task.dueDate <= date ? "committed" : "other-day"
  return "optional"
}

// ── free slots ─────────────────────────────────────────────────────────────

export type Slot = { start: number; end: number } // minutes of day

/**
 * The gaps left in a day once fixed commitments are carved out. Overlapping
 * commitments are merged, everything is clamped to the working window, and a
 * zero/negative gap is never returned.
 */
export function freeSlots(busy: Slot[], startHour = WORK_START, endHour = WORK_END): Slot[] {
  const dayStart = startHour * 60
  const dayEnd = endHour * 60
  if (dayEnd <= dayStart) return []

  const clamped = busy
    .map((b) => ({ start: Math.max(b.start, dayStart), end: Math.min(b.end, dayEnd) }))
    .filter((b) => b.end > b.start)
    .sort((a, b) => a.start - b.start)

  // Merge overlaps so a gap can never be double-counted.
  const merged: Slot[] = []
  for (const b of clamped) {
    const last = merged[merged.length - 1]
    if (last && b.start <= last.end) last.end = Math.max(last.end, b.end)
    else merged.push({ ...b })
  }

  const gaps: Slot[] = []
  let cursor = dayStart
  for (const b of merged) {
    if (b.start > cursor) gaps.push({ start: cursor, end: b.start })
    cursor = Math.max(cursor, b.end)
  }
  if (cursor < dayEnd) gaps.push({ start: cursor, end: dayEnd })
  return gaps
}

// ── the plan ───────────────────────────────────────────────────────────────

export type PlacedBlock = {
  taskId: string
  /** minutes of day */
  start: number
  end: number
  fixed: boolean
  score: number
}

export type Unplaced = {
  taskId: string
  reason: "no_slot" | "too_long_for_day" | "past_working_hours"
}

export type PlanIssue = {
  kind: "overload" | "deadline_risk" | "cycle" | "conflict"
  severity: "high" | "medium" | "low"
  taskIds: string[]
  detail: string
}

export type DayPlan = {
  date: string
  blocks: PlacedBlock[]
  unplaced: Unplaced[]
  issues: PlanIssue[]
  freeMinutes: number
  plannedMinutes: number
}

export type PlanInput = {
  tasks: Task[]
  ctx: PlanContext
  /** Previous placements — honoured when still valid, to keep the day stable. */
  previous?: PlacedBlock[]
}

/** Tasks that already own a moment on this day (meetings, timed commitments). */
function fixedBlocksFor(tasks: Task[], date: string): PlacedBlock[] {
  return tasks
    .filter((t) => t.startAt && t.startAt.slice(0, 10) === date)
    .map((t) => {
      const start = minutesOfDay(parseLocalDateTime(t.startAt!))
      return {
        taskId: t.id,
        start,
        end: start + estimateDuration(t),
        fixed: t.fixed !== false,
        score: 0,
      }
    })
    .sort((a, b) => a.start - b.start || a.taskId.localeCompare(b.taskId))
}

function takeFromSlots(slots: Slot[], start: number, end: number) {
  const out: Slot[] = []
  for (const s of slots) {
    if (end <= s.start || start >= s.end) {
      out.push(s)
      continue
    }
    if (start > s.start) out.push({ start: s.start, end: start })
    if (end < s.end) out.push({ start: end, end: s.end })
  }
  return out
}

/**
 * Build the day: fixed commitments stay put, everything ready is scored and
 * dropped into the earliest slot that fits. Anything that doesn't fit is
 * reported — work is never silently dropped.
 */
export function planDay({ tasks, ctx, previous }: PlanInput): DayPlan {
  const date = localDateISO(ctx.now)
  const startHour = ctx.workingStartHour ?? WORK_START
  const endHour = ctx.workingEndHour ?? WORK_END

  const ready = readySet(tasks, ctx)
  const blocking = blockingWeights(tasks)

  // Only commitments that live on THIS day hold a slot. A meeting next Tuesday
  // must not be dropped onto today's timeline as if it were flexible work.
  const fixed = fixedBlocksFor(ready, date)
  const fixedIds = new Set(fixed.map((b) => b.taskId))

  // The past is not available. Planning today starts from now, not from the
  // opening of the working window, or the plan describes hours already gone.
  const isToday = date === localDateISO(ctx.now)
  const floor = isToday
    ? Math.min(endHour * 60, Math.max(startHour * 60, Math.ceil(minutesOfDay(ctx.now) / 5) * 5))
    : startHour * 60
  let slots = freeSlots(
    [
      ...(floor > startHour * 60 ? [{ start: startHour * 60, end: floor }] : []),
      ...fixed.map((b) => ({ start: b.start, end: b.end })),
    ],
    startHour,
    endHour,
  )

  // Flexible work, most pressing first. Ties break by id so runs are identical.
  // Work belonging to another day is excluded outright.
  const flexible = ready
    .filter((t) => !fixedIds.has(t.id) && dayRole(t, date) !== "other-day")
    .map((t) => ({
      task: t,
      score: planScore(t, ctx, blocking.get(t.id) ?? 0),
      role: dayRole(t, date),
    }))
    .sort((a, b) => b.score - a.score || a.task.id.localeCompare(b.task.id))

  const blocks: PlacedBlock[] = [...fixed]
  const unplaced: Unplaced[] = []
  const prevById = new Map((previous ?? []).map((b) => [b.taskId, b]))
  const dayCapacity = (endHour - startHour) * 60

  const place = (taskId: string, start: number, end: number, score: number) => {
    blocks.push({ taskId, start, end, fixed: false, score })
    slots = takeFromSlots(slots, start, end)
  }

  // Pass 1 — honour previous placements that are still valid. Stability is a
  // feature: a re-plan that reshuffles the whole day destroys trust.
  for (const { task, score } of flexible) {
    const prev = prevById.get(task.id)
    if (!prev || prev.fixed) continue
    const dur = estimateDuration(task)
    const fits = slots.some((s) => prev.start >= s.start && prev.start + dur <= s.end)
    if (fits) place(task.id, prev.start, prev.start + dur, score)
  }

  // Pass 2 — place the rest into the earliest gap that fits. Backlog work that
  // does not fit is simply not today's; only work the day OWES is reported as
  // not fitting, so a large backlog never reads as an overloaded day.
  const placedIds = new Set(blocks.map((b) => b.taskId))
  for (const { task, score, role } of flexible) {
    if (placedIds.has(task.id)) continue
    const dur = estimateDuration(task)
    if (dur > dayCapacity) {
      if (role === "committed") unplaced.push({ taskId: task.id, reason: "too_long_for_day" })
      continue
    }
    const slot = slots.find((s) => s.end - s.start >= dur)
    if (!slot) {
      if (role === "committed") unplaced.push({ taskId: task.id, reason: "no_slot" })
      continue
    }
    place(task.id, slot.start, slot.start + dur, score)
    placedIds.add(task.id)
  }

  blocks.sort((a, b) => a.start - b.start || a.taskId.localeCompare(b.taskId))

  const plannedMinutes = blocks.reduce((sum, b) => sum + (b.end - b.start), 0)
  const freeMinutes = slots.reduce((sum, s) => sum + (s.end - s.start), 0)

  return {
    date,
    blocks,
    unplaced,
    issues: detectIssues({ tasks, ctx, blocks, unplaced }),
    freeMinutes,
    plannedMinutes,
  }
}

/** Problems worth raising: overload, deadline risk, dependency cycles. */
export function detectIssues({
  tasks,
  ctx,
  blocks,
  unplaced,
}: {
  tasks: Task[]
  ctx: PlanContext
  blocks: PlacedBlock[]
  unplaced: Unplaced[]
}): PlanIssue[] {
  const issues: PlanIssue[] = []
  const byId = new Map(tasks.map((t) => [t.id, t]))

  // Only work the day actually owes reaches `unplaced`, so this fires when the
  // day is genuinely over-committed — not merely because a backlog exists.
  if (unplaced.length > 0) {
    issues.push({
      kind: "overload",
      severity: unplaced.length > 3 ? "high" : "medium",
      taskIds: unplaced.map((u) => u.taskId),
      detail:
        unplaced.length === 1
          ? `"${byId.get(unplaced[0].taskId)?.title ?? ""}" לא נכנסת ליום`
          : `${unplaced.length} משימות של היום לא נכנסות ליום`,
    })
  }

  // A task with less room than the work it needs will miss its deadline. Only
  // real deadlines qualify: an appointment that has already started is simply
  // happening, not "at risk", and flagging it would nag through every meeting.
  const atRisk: string[] = []
  for (const t of tasks) {
    if (t.status === "completed") continue
    if (deadlineOf(t)?.kind !== "deadline") continue
    const slack = slackMinutes(t, ctx.now)
    if (slack !== null && slack < 0) atRisk.push(t.id)
  }
  if (atRisk.length > 0) {
    // One concern for all of them — a separate line per task would drown out
    // everything else the agent has to say.
    const first = byId.get(atRisk[0])?.title ?? ""
    issues.push({
      kind: "deadline_risk",
      severity: "high",
      taskIds: atRisk,
      detail:
        atRisk.length === 1
          ? `אין מספיק זמן ל"${first}" לפני הדדליין`
          : `${atRisk.length} משימות לא יספיקו לדדליין שלהן`,
    })
  }

  const cyclic = findCycles(tasks)
  if (cyclic.length > 0) {
    issues.push({
      kind: "cycle",
      severity: "medium",
      taskIds: cyclic,
      detail: "יש תלות מעגלית בין משימות",
    })
  }

  // Overlaps should be impossible; assert it so a regression surfaces loudly.
  const sorted = [...blocks].sort((a, b) => a.start - b.start)
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].start < sorted[i - 1].end) {
      issues.push({
        kind: "conflict",
        severity: "high",
        taskIds: [sorted[i - 1].taskId, sorted[i].taskId],
        detail: `${byId.get(sorted[i].taskId)?.title ?? ""} מתנגש עם ${byId.get(sorted[i - 1].taskId)?.title ?? ""}`,
      })
    }
  }

  return issues
}

/**
 * Backward planning: place prep work BEFORE a dated milestone, latest-first, so
 * the last step lands right against the deadline and earlier steps back up from
 * there. Returns a due date per prep task, and whether it still fits.
 */
export function backwardPlan(
  milestone: { date: string },
  prep: Task[],
  ctx: PlanContext,
  dailyCapacityMinutes = 120,
): { taskId: string; dueDate: string; fits: boolean }[] {
  const out: { taskId: string; dueDate: string; fits: boolean }[] = []
  let cursor = parseLocalDate(milestone.date)
  let usedToday = 0

  // Last prep step sits closest to the milestone.
  for (const task of [...prep].reverse()) {
    const dur = estimateDuration(task)
    if (usedToday + dur > dailyCapacityMinutes) {
      cursor = new Date(cursor)
      cursor.setDate(cursor.getDate() - 1)
      usedToday = 0
    }
    usedToday += dur
    const day = localDateISO(cursor)
    out.push({ taskId: task.id, dueDate: day, fits: parseLocalDate(day) >= startOfDay(ctx.now) })
  }
  return out.reverse()
}

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
