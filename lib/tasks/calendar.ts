import type { Task } from "./types"

// All date math here is LOCAL — never new Date("YYYY-MM-DD") (that parses UTC
// and shifts the calendar day west of UTC).

export function isoOf(year: number, monthZero: number, day: number): string {
  return `${year}-${String(monthZero + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export function todayLocalISO(): string {
  const d = new Date()
  return isoOf(d.getFullYear(), d.getMonth(), d.getDate())
}

// Active, top-level tasks due on a given YYYY-MM-DD (children never surface as
// independent calendar entries; completed tasks are excluded).
export function tasksDueOn(tasks: Task[], iso: string): Task[] {
  return tasks.filter((t) => t.status !== "completed" && !t.parentId && t.dueDate === iso)
}

export function undatedActive(tasks: Task[]): Task[] {
  return tasks.filter((t) => t.status !== "completed" && !t.parentId && !t.dueDate)
}

export type MonthCell = { iso: string; day: number } | null

// Calendar cells for a month, Sunday-first. null = leading blank.
export function monthCells(year: number, monthZero: number): MonthCell[] {
  const startBlanks = new Date(year, monthZero, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, monthZero + 1, 0).getDate()
  const cells: MonthCell[] = []
  for (let i = 0; i < startBlanks; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push({ iso: isoOf(year, monthZero, d), day: d })
  return cells
}

// The 7 ISO dates (Sun–Sat) of the week containing `iso`.
export function weekDates(iso: string): string[] {
  const [y, m, d] = iso.split("-").map(Number)
  const base = new Date(y, m - 1, d)
  const sunday = new Date(base)
  sunday.setDate(base.getDate() - base.getDay())
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(sunday)
    dd.setDate(sunday.getDate() + i)
    return isoOf(dd.getFullYear(), dd.getMonth(), dd.getDate())
  })
}

export function weekdayIndex(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d).getDay()
}

export function ddmm(iso: string): string {
  const [, m, d] = iso.split("-")
  return `${d}.${m}`
}

export const HE_WEEKDAYS_SHORT = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"]
export const HE_WEEKDAYS_LONG = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"]
export const HE_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
]
