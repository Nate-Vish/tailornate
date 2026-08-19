export type Priority = "urgent" | "high" | "medium" | "low"
export type Size = "short" | "medium" | "long"
export type Status = "not_started" | "in_progress" | "completed" | "blocked"
export type BoostMode = "today" | "until_done"

export type Category = {
  id: string
  name: string
  nameEn: string
  color: string
  icon: string
}

export type Tag = {
  id: string
  name: string
  categoryId: string
  color: string
  icon: string
}

// A chain groups tasks into an ordered, step-by-step plan.
export type Chain = {
  id: string
  title: string
}

// A goal is the "why" behind tasks — the identity you're building toward.
export type Goal = {
  id: string
  title: string
  categoryId: string
  // Identity statement, Atomic Habits style: "אני אדם שמנגן"
  identity?: string
  targetDate?: string
  archived?: boolean
  createdAt: string
}

export type ChecklistItem = { id: string; text: string; done: boolean }

// How often a habit should happen.
export type Cadence =
  | { kind: "daily" }
  | { kind: "weekly"; days: number[] } // 0 = Sunday
  | { kind: "times_per_week"; times: number }

// A habit turns a goal into repeated action. Streaks are forgiving by design:
// one miss keeps it alive ("at risk"), two consecutive misses break it.
export type Habit = {
  cadence: Cadence
  // Quota per occurrence, e.g. 30 minutes of guitar.
  quotaMinutes?: number
  // The 2-minute-rule fallback offered on hard days.
  minVersion?: string
  // Implementation intention / environment cue: "אחרי הקפה של הבוקר".
  cue?: string
  // The day the habit began. Nothing before it can count as a miss — a habit
  // created today must never open with "you missed it".
  startedOn?: string // YYYY-MM-DD
  streak: number
  longestStreak: number
  lastDoneDate?: string // YYYY-MM-DD
  history: string[] // completion dates, newest first
  // How hard the coach pushes for THIS habit.
  intensity?: "gentle" | "normal" | "firm"
}

export type Task = {
  id: string
  title: string
  notes?: string
  priority: Priority
  size: Size
  status: Status
  categoryId: string
  tagId?: string
  dueDate?: string
  createdAt: string
  completedAt?: string
  // Snoozed tasks hide from the dashboard until this date (YYYY-MM-DD)
  snoozedUntil?: string
  boost?: { mode: BoostMode; setAt: string; minScore: number } | null
  // Branch: this task is a sub-task of parentId. One level deep only.
  parentId?: string
  // Chain: ordered membership in a chain. chainOrder is 0-based.
  chainId?: string
  chainOrder?: number
  // ── Time axis ──────────────────────────────────────────────────────────
  // A concrete block on the clock. startAt is a LOCAL ISO datetime.
  startAt?: string
  durationMinutes?: number
  // An immovable commitment (meeting, appointment) — never moved by the planner.
  fixed?: boolean
  // ── Dependencies ───────────────────────────────────────────────────────
  // This task is ready only once every blocker is completed.
  blockedBy?: string[]
  // ── Lightweight parts ──────────────────────────────────────────────────
  // Ticks inside ONE task (groceries) — notes, not tasks. No XP, not in Today.
  checklist?: ChecklistItem[]
  // ── Meaning ────────────────────────────────────────────────────────────
  goalId?: string
  habit?: Habit
  // Extra life-areas beyond the primary categoryId (a dinner that is both
  // career and personal). Balance counts primary + secondary.
  areaIds?: string[]
}

export type Weights = {
  priority: number
  deadline: number
  status: number
  size: number
}

export type ViewName = "today" | "projects" | "squad" | "settings" | "table"
