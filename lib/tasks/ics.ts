import type { Category, Task } from "./types"
import { priorityLabel, statusLabel } from "./scoring"

function icsDate(iso: string): string {
  return iso.replaceAll("-", "")
}

function nextDay(iso: string): string {
  const [y, m, day] = iso.slice(0, 10).split("-").map(Number)
  const d = new Date(y, m - 1, day + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function escapeICS(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n")
}

// All-day VEVENT per task with a due date. Importable into Google/Apple/Outlook.
export function tasksToICS(tasks: Task[], categories: Category[]): string {
  const withDue = tasks.filter((t) => t.dueDate && t.status !== "completed")
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Madko//Tasks//HE",
    "CALSCALE:GREGORIAN",
    "X-WR-CALNAME:Madko Tasks",
  ]
  for (const t of withDue) {
    const cat = categories.find((c) => c.id === t.categoryId)
    lines.push(
      "BEGIN:VEVENT",
      `UID:${t.id}@madko.tailornate.com`,
      `DTSTAMP:${icsDate(t.createdAt.slice(0, 10))}T000000Z`,
      `DTSTART;VALUE=DATE:${icsDate(t.dueDate!)}`,
      `DTEND;VALUE=DATE:${icsDate(nextDay(t.dueDate!))}`,
      `SUMMARY:${escapeICS(t.title)}`,
      `DESCRIPTION:${escapeICS(
        `Madko · ${cat?.name ?? ""} · ${priorityLabel[t.priority]} · ${statusLabel[t.status]}`,
      )}`,
      "END:VEVENT",
    )
  }
  lines.push("END:VCALENDAR")
  return lines.join("\r\n")
}

export function downloadICS(tasks: Task[], categories: Category[]): void {
  const blob = new Blob([tasksToICS(tasks, categories)], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "madko-tasks.ics"
  a.click()
  URL.revokeObjectURL(url)
}

// Prefilled Google Calendar "create event" link for a single task.
export function googleCalendarUrl(task: Task): string {
  const now = new Date()
  const localToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  const date = task.dueDate ?? localToday
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: task.title,
    dates: `${icsDate(date)}/${icsDate(nextDay(date))}`,
    details: "מתוך Madko — tailornate.com/tasks",
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
