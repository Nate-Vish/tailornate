import type { Task, Weights } from "./types"

const priorityScore: Record<Task["priority"], number> = {
  urgent: 100,
  high: 70,
  medium: 40,
  low: 15,
}

const sizeScore: Record<Task["size"], number> = {
  short: 100,
  medium: 60,
  long: 30,
}

const statusScore: Record<Task["status"], number> = {
  in_progress: 100,
  not_started: 50,
  blocked: 10,
  completed: 0,
}

function daysUntil(iso?: string): number | null {
  if (!iso) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(iso)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - now.getTime()) / 86_400_000)
}

function deadlineScore(iso?: string): number {
  const d = daysUntil(iso)
  if (d === null) return 0
  if (d <= 0) return 100
  if (d === 1) return 85
  if (d <= 3) return 70
  if (d <= 7) return 50
  if (d <= 14) return 35
  if (d <= 30) return 20
  return 5
}

export function calcScore(task: Task, w: Weights): number {
  if (task.status === "completed") return 0
  const total = w.priority + w.deadline + w.status + w.size || 1
  const raw =
    (priorityScore[task.priority] * w.priority +
      deadlineScore(task.dueDate) * w.deadline +
      statusScore[task.status] * w.status +
      sizeScore[task.size] * w.size) /
    total
  const boosted = task.boost ? Math.max(raw, task.boost.minScore) : raw
  return Math.round(boosted)
}

export const priorityLabel: Record<Task["priority"], string> = {
  urgent: "דחוף",
  high: "גבוה",
  medium: "בינוני",
  low: "נמוך",
}

export const sizeLabel: Record<Task["size"], string> = {
  short: "קצרה",
  medium: "בינונית",
  long: "ארוכה",
}

export const statusLabel: Record<Task["status"], string> = {
  not_started: "לא התחיל",
  in_progress: "בתהליך",
  completed: "הושלם",
  blocked: "חסום",
}

export function formatRelativeDue(iso?: string): string | null {
  if (!iso) return null
  const d = daysUntil(iso)
  if (d === null) return null
  if (d < 0) return `באיחור ${-d} ימים`
  if (d === 0) return "היום"
  if (d === 1) return "מחר"
  if (d <= 7) return `בעוד ${d} ימים`
  const date = new Date(iso)
  return `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}`
}
