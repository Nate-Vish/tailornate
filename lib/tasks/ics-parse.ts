// Minimal ICS parser for read-only calendar feeds (Google "secret address",
// Outlook published calendars). Handles all-day + timed events and basic
// DAILY/WEEKLY recurrence — enough to answer "what's on my calendar this
// week". Exotic rules (monthly by position, EXDATE) are out of scope.

export type CalendarEvent = {
  title: string
  date: string // YYYY-MM-DD
  time?: string // HH:MM when not all-day
  allDay: boolean
}

function unfold(text: string): string {
  return text.replace(/\r?\n[ \t]/g, "")
}

type ParsedDate = { y: number; m: number; d: number; time?: string } | null

function parseICSDate(value: string): ParsedDate {
  const m = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})\d{2}Z?)?/)
  if (!m) return null
  return {
    y: Number(m[1]),
    m: Number(m[2]),
    d: Number(m[3]),
    time: m[4] ? `${m[4]}:${m[5]}` : undefined,
  }
}

function toISO(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

const WEEKDAYS: Record<string, number> = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 }

export function parseICS(text: string, windowStart: Date, windowEnd: Date): CalendarEvent[] {
  const events: CalendarEvent[] = []
  const seen = new Set<string>()
  const blocks = unfold(text).split("BEGIN:VEVENT").slice(1)

  for (const block of blocks) {
    const body = block.split("END:VEVENT")[0]
    const prop = (name: string): { params: string; value: string } | null => {
      const re = new RegExp(`^${name}([^:\\r\\n]*):(.*)$`, "m")
      const m = body.match(re)
      return m ? { params: m[1], value: m[2].trim() } : null
    }

    if (prop("STATUS")?.value === "CANCELLED") continue
    const summary = prop("SUMMARY")?.value.replace(/\\,/g, ",").replace(/\\n/g, " ").replace(/\\;/g, ";")
    const dtstart = prop("DTSTART")
    if (!summary || !dtstart) continue
    const start = parseICSDate(dtstart.value)
    if (!start) continue
    const allDay = dtstart.params.includes("VALUE=DATE") || !start.time

    const push = (dt: Date) => {
      if (dt < windowStart || dt > windowEnd) return
      const iso = toISO(dt.getFullYear(), dt.getMonth() + 1, dt.getDate())
      const key = `${summary}|${iso}`
      if (seen.has(key)) return
      seen.add(key)
      events.push({ title: summary, date: iso, time: allDay ? undefined : start.time, allDay })
    }

    const first = new Date(start.y, start.m - 1, start.d)
    const rrule = prop("RRULE")?.value

    if (!rrule) {
      push(first)
      continue
    }

    const freq = rrule.match(/FREQ=(\w+)/)?.[1]
    const interval = Number(rrule.match(/INTERVAL=(\d+)/)?.[1] ?? 1)
    const until = rrule.match(/UNTIL=(\d{8}(?:T\d{6}Z?)?)/)?.[1]
    const count = Number(rrule.match(/COUNT=(\d+)/)?.[1] ?? 0)
    const untilDate = until ? parseICSDate(until) : null
    const hardEnd = untilDate
      ? new Date(Math.min(windowEnd.getTime(), new Date(untilDate.y, untilDate.m - 1, untilDate.d).getTime()))
      : windowEnd

    if (freq === "DAILY") {
      let occurrences = 0
      for (let dt = new Date(first); dt <= hardEnd && occurrences < 400; dt.setDate(dt.getDate() + interval)) {
        occurrences++
        if (count && occurrences > count) break
        push(new Date(dt))
      }
    } else if (freq === "WEEKLY") {
      const byday = rrule.match(/BYDAY=([\w,]+)/)?.[1]
      const days = byday
        ? byday.split(",").map((d) => WEEKDAYS[d]).filter((d) => d !== undefined)
        : [first.getDay()]
      let occurrences = 0
      // Walk week by week from the event's first week
      for (
        let weekStart = new Date(first.getFullYear(), first.getMonth(), first.getDate() - first.getDay());
        weekStart <= hardEnd && occurrences < 400;
        weekStart.setDate(weekStart.getDate() + 7 * interval)
      ) {
        for (const wd of days) {
          const dt = new Date(weekStart)
          dt.setDate(dt.getDate() + wd)
          if (dt < first || dt > hardEnd) continue
          occurrences++
          if (count && occurrences > count) break
          push(dt)
        }
      }
    } else {
      // MONTHLY/YEARLY etc.: include only the first occurrence if in window
      push(first)
    }
  }

  return events.sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? ""))
}
