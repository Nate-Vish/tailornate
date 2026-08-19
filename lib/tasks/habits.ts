// The habits engine — Atomic Habits, in code.
//
// Pure and deterministic like the planner: the date is always passed in.
//
// The rules that matter, and why:
//   · Forgiving by design — one miss keeps the streak alive but "at risk";
//     only two consecutive misses break it ("never miss twice").
//   · The 2-minute fallback — on a hard day the coach offers the smallest
//     possible version instead of scolding. Showing up beats perfection.
//   · times-per-week is flexible — 3 of 7 days is a hit, whichever days.
// Shame makes people abandon the app, so no state here is ever "failure".

import type { Habit, Task } from "./types"

// ── date helpers (local, string-based — no timezone drift) ──────────────────

const pad = (n: number) => String(n).padStart(2, "0")

export function shiftDate(iso: string, days: number): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + days)
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`
}

export function dayOfWeek(iso: string): number {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number)
  return new Date(y, m - 1, d).getDay() // 0 = Sunday
}

/** Sunday-start week key, so "this week" is unambiguous. */
export function weekKey(iso: string): string {
  return shiftDate(iso, -dayOfWeek(iso))
}

// ── cadence ────────────────────────────────────────────────────────────────

/** Is this habit expected on this date? */
export function isDueOn(habit: Habit, date: string): boolean {
  const c = habit.cadence
  if (c.kind === "daily") return true
  if (c.kind === "weekly") return c.days.includes(dayOfWeek(date))
  // times_per_week: due until the week's quota is met — any days count.
  return weekProgress(habit, date).done < c.times
}

/** How far into the weekly quota you are. */
export function weekProgress(habit: Habit, date: string): { done: number; target: number } {
  const c = habit.cadence
  const key = weekKey(date)
  const done = habit.history.filter((d) => weekKey(d) === key).length
  const target =
    c.kind === "times_per_week" ? c.times : c.kind === "weekly" ? c.days.length : 7
  return { done, target }
}

// ── streaks ────────────────────────────────────────────────────────────────

export type StreakState = {
  streak: number
  longest: number
  doneToday: boolean
  /** Missed the previous expected occurrence — alive, but one away from breaking. */
  atRisk: boolean
  /** Two consecutive expected occurrences missed — the streak has reset. */
  broken: boolean
  /** Whether it is expected today at all. */
  dueToday: boolean
}

/**
 * When the habit began. A day before this is not a miss — it is a day the habit
 * did not exist yet. Falls back to the oldest completion for habits created
 * before this field existed; a habit with neither is brand new.
 */
function startedOn(habit: Habit): string | null {
  if (habit.startedOn) return habit.startedOn
  if (habit.history.length) return [...habit.history].sort()[0]
  return null
}

/** The expected occurrence dates before `date`, most recent first. */
function previousExpected(habit: Habit, date: string, count: number): string[] {
  const out: string[] = []
  const start = startedOn(habit)
  // A brand-new habit has no history to have missed.
  if (!start) return out
  let cursor = shiftDate(date, -1)
  // Look back far enough to cover weekly cadences without scanning forever.
  for (let i = 0; i < 90 && out.length < count; i++) {
    if (cursor < start) break
    if (habit.cadence.kind === "times_per_week" || isDueOn(habit, cursor)) out.push(cursor)
    cursor = shiftDate(cursor, -1)
  }
  return out
}

export function streakState(habit: Habit, today: string): StreakState {
  const done = new Set(habit.history)
  const doneToday = done.has(today)
  const dueToday = isDueOn(habit, today) || doneToday

  if (habit.cadence.kind === "times_per_week") {
    // Streak counts consecutive WEEKS that met the target.
    let streak = 0
    let key = weekKey(today)
    const target = habit.cadence.times
    // The current week still counts as alive while it can still be met.
    const thisWeekDone = habit.history.filter((d) => weekKey(d) === key).length
    if (thisWeekDone >= target) streak++
    key = shiftDate(key, -7)
    for (let i = 0; i < 52; i++) {
      const n = habit.history.filter((d) => weekKey(d) === key).length
      if (n >= target) {
        streak++
        key = shiftDate(key, -7)
      } else break
    }
    const lastWeekDone = habit.history.filter((d) => weekKey(d) === shiftDate(weekKey(today), -7)).length
    // Judge the current week by what is still POSSIBLE, not by what is done so
    // far. On a Sunday morning nothing has been done yet and that is fine — the
    // quota only becomes a worry when the days left can no longer cover it.
    const daysLeft = 7 - dayOfWeek(today) // including today
    const reachable = thisWeekDone + daysLeft >= target
    const met = thisWeekDone >= target
    const hadPreviousWeek = !!startedOn(habit) && startedOn(habit)! <= shiftDate(weekKey(today), -1)
    return {
      streak,
      longest: Math.max(habit.longestStreak ?? 0, streak),
      doneToday,
      dueToday,
      // Tight but still doable, or coming off a missed week.
      atRisk:
        !met && reachable && (thisWeekDone + daysLeft === target || (hadPreviousWeek && lastWeekDone < target)),
      // Only truly broken once this week is out of reach AND last week failed.
      broken: !reachable && hadPreviousWeek && lastWeekDone < target,
    }
  }

  // Daily / weekly: walk back over expected days.
  let streak = 0
  let cursor = doneToday ? today : shiftDate(today, -1)
  for (let i = 0; i < 365; i++) {
    if (!isDueOn(habit, cursor) && !done.has(cursor)) {
      cursor = shiftDate(cursor, -1)
      continue
    }
    if (done.has(cursor)) {
      streak++
      cursor = shiftDate(cursor, -1)
    } else break
  }

  const prior = previousExpected(habit, today, 2)
  const missedLast = prior[0] !== undefined && !done.has(prior[0])
  const missedTwice = missedLast && prior[1] !== undefined && !done.has(prior[1])

  return {
    streak,
    longest: Math.max(habit.longestStreak ?? 0, streak),
    doneToday,
    dueToday,
    // One miss: alive but at risk. Two: broken. Never framed as failure.
    atRisk: !doneToday && missedLast && !missedTwice,
    broken: missedTwice,
  }
}

/** Record a completion. Same day twice never double-counts. */
export function tickHabit(habit: Habit, date: string): Habit {
  if (habit.history.includes(date)) return habit
  const history = [date, ...habit.history].sort().reverse().slice(0, 400)
  const next: Habit = { ...habit, history, lastDoneDate: date }
  const state = streakState(next, date)
  return {
    ...next,
    streak: state.streak,
    longestStreak: Math.max(habit.longestStreak ?? 0, state.streak),
  }
}

/**
 * A habit ticked for this date. Habit tasks never carry status "completed" —
 * they recur — so "done" is a question about history, and every surface
 * (the list, the planner, the coach) has to ask it the same way.
 */
export function isHabitDoneOn(task: Task, date: string): boolean {
  return !!task.habit?.history.includes(date)
}

/** Undo today's tick (mis-tap). Recomputes the streak from what's left. */
export function untickHabit(habit: Habit, date: string): Habit {
  if (!habit.history.includes(date)) return habit
  const history = habit.history.filter((d) => d !== date)
  const next: Habit = {
    ...habit,
    history,
    lastDoneDate: history[0],
  }
  // longestStreak is a record of what actually happened — an undo never lowers it.
  return { ...next, streak: streakState(next, date).streak }
}

// ── the coach ──────────────────────────────────────────────────────────────

export type HabitNudge = {
  taskId: string
  kind: "at_risk" | "missed_yesterday" | "streak_milestone"
  severity: "high" | "medium" | "low"
  message: string
  /** The 2-minute-rule version — the way back in, never a demand for the full thing. */
  suggestion?: string
}

const INTENSITY_RANK = { gentle: 0, normal: 1, firm: 2 } as const

/**
 * What the coach would say today. Returns nothing when the habit is on track —
 * silence is the default, and only what matters earns a word.
 */
export function habitNudges(tasks: Task[], today: string): HabitNudge[] {
  const out: HabitNudge[] = []

  for (const task of tasks) {
    if (!task.habit) continue
    const state = streakState(task.habit, today)
    if (state.doneToday) {
      // Celebrate a real milestone, nothing else.
      if (state.streak > 0 && state.streak % 7 === 0) {
        out.push({
          taskId: task.id,
          kind: "streak_milestone",
          severity: "low",
          message: `${state.streak} ימים ברצף של "${task.title}" 🎯`,
        })
      }
      continue
    }
    if (!state.dueToday) continue

    const min = task.habit.minVersion
    const cue = task.habit.cue
    const intensity = task.habit.intensity ?? "normal"

    if (state.atRisk || state.broken) {
      // The counter-suggestion: shrink the ask, name the cue, keep it warm.
      const suggestion =
        min ?? (cue ? `רק ${cue} — 2 דקות, זהו` : "רק 2 דקות, לא חייב יותר")
      // Wording has to match the cadence — "you missed yesterday" is simply
      // untrue for a weekly habit or a per-week quota, and a coach that says
      // untrue things stops being believed.
      let message: string
      if (task.habit.cadence.kind === "times_per_week") {
        const p = weekProgress(task.habit, today)
        message = `"${task.title}" — ${p.done} מתוך ${p.target} השבוע`
      } else if (task.habit.cadence.kind === "weekly") {
        message = state.atRisk
          ? `"${task.title}" — פספסת את הפעם הקודמת, בוא לא נפספס פעמיים`
          : `"${task.title}" להיום`
      } else {
        message = state.atRisk
          ? `פספסת אתמול את "${task.title}" — בוא לא נפספס פעמיים`
          : `"${task.title}" מחכה לך`
      }
      out.push({
        taskId: task.id,
        kind: state.atRisk ? "at_risk" : "missed_yesterday",
        severity: state.atRisk ? "high" : "medium",
        message,
        suggestion,
      })
    } else if (INTENSITY_RANK[intensity] >= 2) {
      out.push({
        taskId: task.id,
        kind: "at_risk",
        severity: "low",
        message: `"${task.title}" להיום`,
        suggestion: min,
      })
    }
  }

  return out.sort(
    (a, b) =>
      ({ high: 0, medium: 1, low: 2 })[a.severity] - ({ high: 0, medium: 1, low: 2 })[b.severity] ||
      a.taskId.localeCompare(b.taskId),
  )
}
