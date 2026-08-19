// Executable benchmark for the planning engine — docs/BENCHMARK-engine.md.
//
//   node bench/engine-bench.mjs
//
// Compiles the engine with the TypeScript already in the project (no new
// dependency), then asserts every criterion. Exit code 0 = the bar is met.

import { execSync } from "node:child_process"
import { createRequire } from "node:module"
import { readFileSync, rmSync } from "node:fs"
import path from "node:path"

const ROOT = path.resolve(import.meta.dirname, "..")
const OUT = path.join(ROOT, ".bench-build")

// ── compile ────────────────────────────────────────────────────────────────
rmSync(OUT, { recursive: true, force: true })
// The project's own tsc, called directly — npx adds seconds of resolution.
const TSC = path.join(ROOT, "node_modules/.bin/tsc")
try {
  execSync(
    `${JSON.stringify(TSC)} lib/tasks/planner.ts lib/tasks/habits.ts lib/tasks/guardian.ts ` +
      `--outDir ${JSON.stringify(OUT)} --rootDir . --module commonjs --target es2022 ` +
      `--moduleResolution node --skipLibCheck --esModuleInterop --strict false`,
    { cwd: ROOT, stdio: "pipe" },
  )
} catch (e) {
  console.error("COMPILE FAILED\n" + (e.stdout?.toString() ?? "") + (e.stderr?.toString() ?? ""))
  process.exit(1)
}

const require = createRequire(import.meta.url)
const planner = require(path.join(OUT, "lib/tasks/planner.js"))
const habits = require(path.join(OUT, "lib/tasks/habits.js"))
const guardian = require(path.join(OUT, "lib/tasks/guardian.js"))

// ── harness ────────────────────────────────────────────────────────────────
const results = []
let currentSection = ""
const section = (s) => (currentSection = s)

function check(id, desc, fn) {
  try {
    const detail = fn()
    results.push({ id, section: currentSection, desc, pass: true, detail: detail || "" })
  } catch (err) {
    results.push({ id, section: currentSection, desc, pass: false, detail: String(err.message || err) })
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}
const eq = (a, b, msg) => assert(a === b, `${msg} — got ${JSON.stringify(a)}, want ${JSON.stringify(b)}`)

// ── fixtures ───────────────────────────────────────────────────────────────
const WEIGHTS = { priority: 45, deadline: 30, status: 15, size: 10 }
// Fixed clock: 2026-07-15, 09:00 local. Nothing in the engine reads the real time.
const NOW = new Date(2026, 6, 15, 9, 0, 0, 0)
const ctx = (over = {}) => ({ now: NOW, weights: WEIGHTS, ...over })
const D = (n) => {
  const d = new Date(NOW)
  d.setDate(d.getDate() + n)
  return planner.localDateISO(d)
}
const T = (o) => ({
  title: o.id,
  priority: "medium",
  size: "short",
  status: "not_started",
  categoryId: "c1",
  createdAt: "2026-07-01T00:00:00.000Z",
  ...o,
})
const H = (o = {}) => ({
  cadence: { kind: "daily" },
  streak: 0,
  longestStreak: 0,
  history: [],
  ...o,
})
const deepFreeze = (o) => {
  if (o && typeof o === "object" && !Object.isFrozen(o)) {
    Object.freeze(o)
    Object.values(o).forEach(deepFreeze)
  }
  return o
}
const startOf = (plan, id) => plan.blocks.find((b) => b.taskId === id)?.start

// ═══════════════════════════════ A. DURABILITY ═════════════════════════════
section("A. Data durability")

check("D1", "a legacy task (none of the new fields) plans normally", () => {
  const legacy = T({ id: "legacy", priority: "high", size: "medium", dueDate: D(0) })
  const plan = planner.planDay({ tasks: [legacy], ctx: ctx() })
  assert(plan.blocks.length === 1, "legacy task was not placed")
  eq(plan.blocks[0].taskId, "legacy", "wrong task placed")
  assert(plan.unplaced.length === 0, "legacy task landed in unplaced")
  return `placed at ${plan.blocks[0].start}m, duration ${plan.blocks[0].end - plan.blocks[0].start}m`
})

check("D3", "the engine never mutates its inputs", () => {
  const tasks = [
    T({ id: "a", dueDate: D(0) }),
    T({ id: "b", blockedBy: ["a"] }),
    T({ id: "c", startAt: `${D(0)}T14:00`, fixed: true, durationMinutes: 60 }),
  ].map(deepFreeze)
  deepFreeze(tasks)
  planner.planDay({ tasks, ctx: ctx() }) // must not throw on frozen input
  planner.readySet(tasks, ctx())
  planner.blockingWeights(tasks)
  return "frozen inputs survived a full plan"
})

check("D4", "empty / undated-only / fixed-only stores all produce a valid plan", () => {
  const empty = planner.planDay({ tasks: [], ctx: ctx() })
  eq(empty.blocks.length, 0, "empty store produced blocks")
  assert(Number.isFinite(empty.freeMinutes), "freeMinutes is not a number")

  const undated = planner.planDay({ tasks: [T({ id: "u1" }), T({ id: "u2" })], ctx: ctx() })
  assert(undated.blocks.length === 2, "undated tasks were not placed")

  const fixedOnly = planner.planDay({
    tasks: [T({ id: "f", startAt: `${D(0)}T10:00`, fixed: true, durationMinutes: 60 })],
    ctx: ctx(),
  })
  eq(fixedOnly.blocks.length, 1, "fixed block missing")
  assert(fixedOnly.issues.every((i) => i.kind !== "conflict"), "phantom conflict on a clean day")
  return "all three shapes valid"
})

// ═══════════════════════════════ B. TIME MODEL ═════════════════════════════
section("B. Time model")

check("T1", "a day-only task is flexible and gets placed", () => {
  const plan = planner.planDay({ tasks: [T({ id: "flex", dueDate: D(0) })], ctx: ctx() })
  const b = plan.blocks[0]
  assert(b && !b.fixed, "task should be flexible")
  return `placed at minute ${b.start}`
})

check("T2", "a fixed commitment is never moved and is planned around", () => {
  const tasks = [
    T({ id: "meeting", startAt: `${D(0)}T14:00`, fixed: true, durationMinutes: 60 }),
    T({ id: "work", size: "long" }),
  ]
  const plan = planner.planDay({ tasks, ctx: ctx() })
  eq(startOf(plan, "meeting"), 14 * 60, "fixed block moved")
  const w = plan.blocks.find((b) => b.taskId === "work")
  assert(w, "flexible task not placed")
  assert(w.end <= 14 * 60 || w.start >= 15 * 60, "flexible task overlaps the meeting")
  return "meeting held at 14:00, work planned around it"
})

check("T3", "free slots merge overlaps, clamp to the window, never go negative", () => {
  const slots = planner.freeSlots(
    [
      { start: 10 * 60, end: 11 * 60 },
      { start: 10 * 60 + 30, end: 12 * 60 }, // overlaps the previous
      { start: 2 * 60, end: 3 * 60 }, // before the window
      { start: 23 * 60, end: 25 * 60 }, // after the window
    ],
    8,
    22,
  )
  assert(slots.every((s) => s.end > s.start), "a zero/negative slot was returned")
  for (let i = 1; i < slots.length; i++) assert(slots[i].start >= slots[i - 1].end, "slots overlap")
  assert(slots.every((s) => s.start >= 8 * 60 && s.end <= 22 * 60), "slot outside the window")
  const total = slots.reduce((n, s) => n + (s.end - s.start), 0)
  eq(total, 14 * 60 - 120, "merged busy time is wrong")
  return `${slots.length} gaps, ${total} free minutes`
})

check("T4", "date math is local — no UTC day shift", () => {
  const d = planner.parseLocalDate("2026-07-15")
  eq(d.getFullYear(), 2026, "year")
  eq(d.getMonth(), 6, "month")
  eq(d.getDate(), 15, "day")
  eq(d.getHours(), 0, "should be local midnight")
  eq(planner.localDateISO(d), "2026-07-15", "round trip")
  const dt = planner.parseLocalDateTime("2026-07-15T14:30")
  eq(dt.getHours(), 14, "hours")
  eq(dt.getMinutes(), 30, "minutes")
  return "local round-trip intact"
})

// ═══════════════════════════════ C. DEPENDENCIES ═══════════════════════════
section("C. Dependencies")

check("P1", "a blocked task is not ready", () => {
  const tasks = [T({ id: "logo" }), T({ id: "landing", blockedBy: ["logo"] })]
  const ready = planner.readySet(tasks, ctx()).map((t) => t.id)
  assert(ready.includes("logo"), "blocker should be ready")
  assert(!ready.includes("landing"), "blocked task leaked into the ready set")
  return `ready: ${ready.join(", ")}`
})

check("P2", "completing the blocker unlocks the dependent", () => {
  const tasks = [T({ id: "logo", status: "completed" }), T({ id: "landing", blockedBy: ["logo"] })]
  const ready = planner.readySet(tasks, ctx()).map((t) => t.id)
  assert(ready.includes("landing"), "dependent stayed locked after its blocker completed")
  return "unlocked in the same pass"
})

check("P3", "a dependency cycle neither hangs nor hides the work", () => {
  const tasks = [T({ id: "a", blockedBy: ["b"] }), T({ id: "b", blockedBy: ["a"] })]
  const t0 = Date.now()
  const cycles = planner.findCycles(tasks)
  const plan = planner.planDay({ tasks, ctx: ctx() })
  assert(Date.now() - t0 < 1000, "cycle detection took too long — possible hang")
  assert(cycles.includes("a") && cycles.includes("b"), "cycle not detected")
  assert(plan.issues.some((i) => i.kind === "cycle"), "cycle not reported as an issue")
  eq(plan.blocks.length, 2, "cyclic work vanished instead of being surfaced")
  return `cycle reported: ${cycles.join("→")}`
})

check("P4", "a missing blocker id is treated as satisfied, never a crash", () => {
  const tasks = [T({ id: "orphan", blockedBy: ["deleted-long-ago"] })]
  const ready = planner.readySet(tasks, ctx()).map((t) => t.id)
  assert(ready.includes("orphan"), "task stranded by a dangling reference")
  return "dangling reference ignored"
})

// ═══════════════════════════════ D. SCORING ════════════════════════════════
section("D. Prioritization")

check("S1", "slack beats raw due date (the core improvement)", () => {
  // Same deadline, different amounts of work: the long one is the tight one.
  // Sorting by due date alone would call these equally urgent.
  const big = T({ id: "big", durationMinutes: 600, dueDate: D(0) })
  const small = T({ id: "small", durationMinutes: 10, dueDate: D(0) })
  const sBig = planner.slackMinutes(big, NOW)
  const sSmall = planner.slackMinutes(small, NOW)
  assert(sBig < sSmall, `the longer job must have less room (${sBig} vs ${sSmall})`)
  const scoreBig = planner.planScore(big, ctx())
  const scoreSmall = planner.planScore(small, ctx())
  assert(scoreBig > scoreSmall, `tighter slack must rank higher (${scoreBig} vs ${scoreSmall})`)

  // An appointment is measured differently: you must BE there, not finish first.
  const meeting = T({ id: "m", durationMinutes: 180, startAt: `${D(0)}T13:00` })
  eq(planner.slackMinutes(meeting, NOW), 240, "an appointment's slack is time-until-it-starts")
  return `big ${scoreBig} > small ${scoreSmall}; slack ${Math.round(sBig)} vs ${Math.round(sSmall)}`
})

check("S2", "a task that blocks others outranks an identical one that blocks nothing", () => {
  const tasks = [
    T({ id: "keystone", dueDate: D(1) }),
    T({ id: "lonely", dueDate: D(1) }),
    T({ id: "d1", blockedBy: ["keystone"] }),
    T({ id: "d2", blockedBy: ["keystone"] }),
  ]
  const w = planner.blockingWeights(tasks)
  assert(w.get("keystone") >= 2, `keystone should block 2, got ${w.get("keystone")}`)
  eq(w.get("lonely"), 0, "lonely blocks nothing")
  const a = planner.planScore(tasks[0], ctx(), w.get("keystone"))
  const b = planner.planScore(tasks[1], ctx(), w.get("lonely"))
  assert(a > b, `critical path must win (${a} vs ${b})`)
  return `keystone ${a} > lonely ${b}`
})

check("S3", "the user's tuned weights still drive the result", () => {
  const urgent = T({ id: "u", priority: "urgent" })
  const low = T({ id: "l", priority: "low" })
  const priorityHeavy = { priority: 90, deadline: 5, status: 3, size: 2 }
  const flat = { priority: 10, deadline: 40, status: 40, size: 10 }
  const gapHeavy =
    planner.planScore(urgent, ctx({ weights: priorityHeavy })) -
    planner.planScore(low, ctx({ weights: priorityHeavy }))
  const gapFlat =
    planner.planScore(urgent, ctx({ weights: flat })) - planner.planScore(low, ctx({ weights: flat }))
  assert(gapHeavy > gapFlat, "priority weight had no effect")
  return `gap ${gapHeavy.toFixed(1)} vs ${gapFlat.toFixed(1)}`
})

check("S4", "overdue escalates above the same task due today", () => {
  const overdue = T({ id: "o", dueDate: D(-3), durationMinutes: 30 })
  const dueToday = T({ id: "t", dueDate: D(0), durationMinutes: 30 })
  const a = planner.planScore(overdue, ctx())
  const b = planner.planScore(dueToday, ctx())
  assert(a > b, `overdue must outrank due-today (${a} vs ${b})`)
  const older = planner.planScore(T({ id: "o2", dueDate: D(-10), durationMinutes: 30 }), ctx())
  assert(older > a, "more overdue must rank higher still")
  return `3d late ${a} > today ${b}; 10d late ${older}`
})

check("S5", "identical input produces identical output, every run", () => {
  const tasks = [
    T({ id: "a", priority: "high", dueDate: D(1) }),
    T({ id: "b", size: "long" }),
    T({ id: "c", startAt: `${D(0)}T15:00`, fixed: true, durationMinutes: 45 }),
    T({ id: "d", blockedBy: ["a"] }),
  ]
  const one = JSON.stringify(planner.planDay({ tasks, ctx: ctx() }))
  const two = JSON.stringify(planner.planDay({ tasks, ctx: ctx() }))
  const three = JSON.stringify(planner.planDay({ tasks: [...tasks].reverse(), ctx: ctx() }))
  eq(one, two, "two runs differed")
  eq(one, three, "input order changed the output")
  return "stable across runs and input order"
})

// ═══════════════════════════════ E. PLACEMENT ══════════════════════════════
section("E. Placement")

check("E1", "the most pressing ready task is placed first", () => {
  const tasks = [
    T({ id: "calm", size: "short" }),
    T({ id: "burning", priority: "urgent", dueDate: D(0), durationMinutes: 30 }),
  ]
  const plan = planner.planDay({ tasks, ctx: ctx() })
  assert(startOf(plan, "burning") < startOf(plan, "calm"), "urgent work was not placed first")
  return "urgent first"
})

check("E2", "no two blocks ever overlap", () => {
  const tasks = [
    T({ id: "m1", startAt: `${D(0)}T10:00`, fixed: true, durationMinutes: 60 }),
    T({ id: "m2", startAt: `${D(0)}T13:00`, fixed: true, durationMinutes: 90 }),
    ...Array.from({ length: 8 }, (_, i) => T({ id: `t${i}`, size: "medium" })),
  ]
  const plan = planner.planDay({ tasks, ctx: ctx() })
  const sorted = [...plan.blocks].sort((a, b) => a.start - b.start)
  for (let i = 1; i < sorted.length; i++) {
    assert(
      sorted[i].start >= sorted[i - 1].end,
      `${sorted[i].taskId} overlaps ${sorted[i - 1].taskId}`,
    )
  }
  assert(!plan.issues.some((i) => i.kind === "conflict"), "conflict issue on a valid plan")
  return `${plan.blocks.length} blocks, zero overlaps`
})

check("E3", "committed work that does not fit is reported, never dropped", () => {
  // 30 long tasks all due today — work the day genuinely owes.
  const tasks = Array.from({ length: 30 }, (_, i) => T({ id: `big${i}`, size: "long", dueDate: D(0) }))
  const plan = planner.planDay({ tasks, ctx: ctx() })
  const accounted = plan.blocks.length + plan.unplaced.length
  eq(accounted, 30, "tasks vanished between placed and unplaced")
  assert(plan.unplaced.length > 0, "a 60-hour day should not fit")
  assert(plan.issues.some((i) => i.kind === "overload"), "overload not reported")
  assert(plan.unplaced.every((u) => !!u.reason), "unplaced entry without a reason")
  return `${plan.blocks.length} placed, ${plan.unplaced.length} reported as not fitting`
})

check("E4", "the day's capacity is respected", () => {
  const tasks = Array.from({ length: 40 }, (_, i) => T({ id: `x${i}`, size: "medium" }))
  const plan = planner.planDay({ tasks, ctx: ctx({ workingStartHour: 9, workingEndHour: 17 }) })
  const capacity = 8 * 60
  assert(plan.plannedMinutes <= capacity, `planned ${plan.plannedMinutes} > capacity ${capacity}`)
  return `${plan.plannedMinutes} of ${capacity} minutes used`
})

check("E5", "an urgent insert re-plans locally — the day is not reshuffled", () => {
  const base = Array.from({ length: 6 }, (_, i) => T({ id: `p${i}`, size: "medium" }))
  const first = planner.planDay({ tasks: base, ctx: ctx() })

  const withUrgent = [
    ...base,
    T({ id: "urgent", priority: "urgent", dueDate: D(0), durationMinutes: 30 }),
  ]
  const second = planner.planDay({ tasks: withUrgent, ctx: ctx(), previous: first.blocks })

  const moved = first.blocks.filter((b) => startOf(second, b.taskId) !== b.start)
  assert(second.blocks.some((b) => b.taskId === "urgent"), "urgent task was not placed")
  assert(moved.length <= 1, `${moved.length} tasks moved — a re-plan must stay stable`)
  return `${moved.length} of ${first.blocks.length} existing blocks moved`
})

check("E6", "backward planning puts prep before the deadline, latest-first", () => {
  const prep = [
    T({ id: "s1", durationMinutes: 60 }),
    T({ id: "s2", durationMinutes: 60 }),
    T({ id: "s3", durationMinutes: 60 }),
  ]
  const out = planner.backwardPlan({ date: D(5) }, prep, ctx(), 120)
  eq(out.length, 3, "every prep task needs a date")
  assert(
    out.every((o) => o.dueDate <= D(5)),
    "prep scheduled after the milestone",
  )
  const byId = Object.fromEntries(out.map((o) => [o.taskId, o.dueDate]))
  assert(byId.s1 <= byId.s2 && byId.s2 <= byId.s3, "prep order not preserved")
  assert(byId.s3 === D(5), "the last step should sit against the deadline")
  assert(out.every((o) => o.fits), "prep should still fit 5 days out")

  const tight = planner.backwardPlan({ date: D(0) }, prep, ctx(), 60)
  assert(tight.some((o) => !o.fits), "an impossible schedule must be flagged")
  return `s1 ${byId.s1}, s2 ${byId.s2}, s3 ${byId.s3}`
})

check("E7", "a commitment on another day never lands on today's timeline", () => {
  const tasks = [
    T({ id: "today_meet", startAt: `${D(0)}T10:00`, fixed: true, durationMinutes: 60 }),
    T({ id: "tomorrow_meet", startAt: `${D(1)}T10:00`, fixed: true, durationMinutes: 60 }),
    T({ id: "next_week", startAt: `${D(7)}T09:00`, fixed: true, durationMinutes: 120 }),
  ]
  const plan = planner.planDay({ tasks, ctx: ctx() })
  const ids = plan.blocks.map((b) => b.taskId)
  assert(ids.includes("today_meet"), "today's meeting missing")
  assert(!ids.includes("tomorrow_meet"), "tomorrow's meeting was placed on today")
  assert(!ids.includes("next_week"), "next week's commitment was placed on today")
  assert(!plan.unplaced.some((u) => u.taskId !== "today_meet" && u.taskId), "other days leaked into unplaced")
  return `only ${ids.join(", ")} on today`
})

check("E8", "today's plan starts from now, not from the opening of the window", () => {
  const afternoon = new Date(2026, 6, 15, 15, 30)
  const plan = planner.planDay({
    tasks: [T({ id: "work", size: "medium" })],
    ctx: ctx({ now: afternoon }),
  })
  const b = plan.blocks.find((x) => x.taskId === "work")
  assert(b, "task not placed")
  assert(b.start >= 15 * 60 + 30, `placed at ${b.start} — in an hour that already passed`)
  // …and free time reflects only what is left of the day.
  assert(plan.freeMinutes <= (22 - 15.5) * 60, `freeMinutes ${plan.freeMinutes} counts hours already gone`)
  return `placed at ${b.start}m, ${plan.freeMinutes} minutes actually left`
})

check("E9", "a backlog that does not fit is not an overloaded day", () => {
  // 40 undated tasks — a normal backlog, nothing due today.
  const backlog = Array.from({ length: 40 }, (_, i) => T({ id: `b${i}`, size: "medium" }))
  const plan = planner.planDay({ tasks: backlog, ctx: ctx() })
  eq(plan.unplaced.length, 0, "backlog was reported as work the day failed to hold")
  assert(!plan.issues.some((i) => i.kind === "overload"), "backlog triggered an overload issue")

  // But work actually DUE today that cannot fit must still be reported.
  const due = Array.from({ length: 20 }, (_, i) => T({ id: `d${i}`, size: "long", dueDate: D(0) }))
  const plan2 = planner.planDay({ tasks: due, ctx: ctx() })
  assert(plan2.unplaced.length > 0, "genuinely over-committed day was not reported")
  assert(plan2.issues.some((i) => i.kind === "overload"), "real overload not raised")
  return `backlog silent; ${plan2.unplaced.length} committed tasks reported`
})

// ═══════════════════════════════ F. HABITS ═════════════════════════════════
section("F. Habits")

check("H1", "cadence answers 'is it due today' for all three shapes", () => {
  eq(habits.isDueOn(H(), D(0)), true, "daily is always due")
  const dow = habits.dayOfWeek(D(0))
  eq(habits.isDueOn(H({ cadence: { kind: "weekly", days: [dow] } }), D(0)), true, "weekly, matching day")
  eq(
    habits.isDueOn(H({ cadence: { kind: "weekly", days: [(dow + 1) % 7] } }), D(0)),
    false,
    "weekly, other day",
  )
  const met = H({ cadence: { kind: "times_per_week", times: 2 }, history: [D(0), D(-1)] })
  eq(habits.isDueOn(met, D(0)), false, "quota met — not due again")
  return "daily / weekly / times-per-week all correct"
})

check("H2", "streaks count consecutive days and never double-count a day", () => {
  const h = H({ history: [D(-1), D(-2), D(-3)] })
  const before = habits.streakState(h, D(0))
  eq(before.streak, 3, "three days back")
  const ticked = habits.tickHabit(h, D(0))
  eq(habits.streakState(ticked, D(0)).streak, 4, "today should extend the streak")
  const twice = habits.tickHabit(ticked, D(0))
  eq(twice.history.length, ticked.history.length, "same day counted twice")
  return "3 → 4, idempotent"
})

check("H3", "never miss twice — one miss survives, two break", () => {
  const oneMiss = H({ history: [D(-2), D(-3), D(-4)] }) // yesterday missed
  const s1 = habits.streakState(oneMiss, D(0))
  assert(s1.atRisk, "one miss should read as at-risk")
  assert(!s1.broken, "one miss must not break the streak")

  const twoMisses = H({ history: [D(-3), D(-4), D(-5)] })
  const s2 = habits.streakState(twoMisses, D(0))
  assert(s2.broken, "two consecutive misses should break it")
  return "1 miss = at risk, 2 misses = broken"
})

check("H4", "times-per-week is forgiving — any days count", () => {
  const h = H({ cadence: { kind: "times_per_week", times: 3 }, history: [D(0), D(-1)] })
  const p = habits.weekProgress(h, D(0))
  eq(p.target, 3, "target")
  assert(p.done >= 2, "progress should count both days")
  const done = habits.tickHabit(h, D(-2))
  const s = habits.streakState(done, D(0))
  assert(!s.broken, "meeting the weekly target must not read as broken")
  return `${p.done}/${p.target} this week`
})

check("H5", "an at-risk habit gets the 2-minute way back in, never a scolding", () => {
  const task = T({
    id: "read",
    title: "לקרוא",
    habit: H({ history: [D(-2), D(-3)], minVersion: "רק להדליק את מנורת הקריאה" }),
  })
  const nudges = habits.habitNudges([task], D(0))
  assert(nudges.length === 1, "an at-risk habit should produce exactly one nudge")
  const n = nudges[0]
  assert(n.suggestion && n.suggestion.length > 0, "no counter-suggestion offered")
  eq(n.suggestion, "רק להדליק את מנורת הקריאה", "the minimum version should be the suggestion")
  assert(!/כישלון|נכשלת|אכזבת/.test(n.message), "shaming language in a nudge")
  return `"${n.message}" → "${n.suggestion}"`
})

check("H7", "a habit ticked today is not scheduled again today", () => {
  const guitar = T({ id: "guitar", habit: H({ quotaMinutes: 30 }) })
  const before = planner.planDay({ tasks: [guitar], ctx: ctx() })
  eq(before.blocks.length, 1, "an untouched habit should be scheduled")

  const ticked = { ...guitar, habit: habits.tickHabit(guitar.habit, D(0)) }
  const after = planner.planDay({ tasks: [ticked], ctx: ctx() })
  eq(after.blocks.length, 0, "a habit done today was scheduled again")
  assert(after.unplaced.length === 0, "a finished habit must not read as unplaced work")

  // …and it returns tomorrow.
  const tomorrow = new Date(NOW)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const next = planner.planDay({ tasks: [ticked], ctx: ctx({ now: tomorrow }) })
  eq(next.blocks.length, 1, "the habit should come back the next day")
  return "scheduled → ticked → gone today → back tomorrow"
})

check("H6", "a habit's quota makes it a schedulable block", () => {
  const guitar = T({ id: "guitar", habit: H({ quotaMinutes: 30 }) })
  eq(planner.estimateDuration(guitar), 30, "quota should drive the duration")
  const plan = planner.planDay({ tasks: [guitar], ctx: ctx() })
  const b = plan.blocks.find((x) => x.taskId === "guitar")
  assert(b, "habit was not scheduled")
  eq(b.end - b.start, 30, "habit block length")
  return "30-minute guitar block placed"
})

check("H8", "a habit that is not due today stays out of today", () => {
  const dow = habits.dayOfWeek(D(0))
  const otherDay = T({
    id: "sunday_only",
    habit: H({ cadence: { kind: "weekly", days: [(dow + 3) % 7] } }),
  })
  const dueToday = T({ id: "today_habit", habit: H({ cadence: { kind: "weekly", days: [dow] } }) })
  const ready = planner.readySet([otherDay, dueToday], ctx()).map((t) => t.id)
  assert(!ready.includes("sunday_only"), "a habit due another day was scheduled today")
  assert(ready.includes("today_habit"), "a habit due today was dropped")
  return `ready: ${ready.join(", ")}`
})

check("H9", "a brand-new habit is never 'you missed it'", () => {
  const fresh = T({ id: "new", title: "חדש", habit: H({ startedOn: D(0) }) })
  const s = habits.streakState(fresh.habit, D(0))
  assert(!s.broken, "a habit created today reads as broken")
  assert(!s.atRisk, "a habit created today reads as at-risk")
  const nudges = habits.habitNudges([fresh], D(0))
  assert(
    !nudges.some((n) => /פספסת/.test(n.message)),
    `a new habit was told it missed something: ${nudges.map((n) => n.message).join(" | ")}`,
  )
  return "silent on day one"
})

check("H10", "a fresh week does not break a per-week habit", () => {
  // A habit that met its quota last week, on the first day of a new week.
  const sunday = new Date(NOW)
  sunday.setDate(sunday.getDate() - habits.dayOfWeek(D(0))) // this week's Sunday
  const sundayISO = planner.localDateISO(sunday)
  const lastWeek = [1, 2, 3].map((n) => habits.shiftDate(sundayISO, -n))
  const h = H({
    cadence: { kind: "times_per_week", times: 3 },
    startedOn: habits.shiftDate(sundayISO, -21),
    history: lastWeek,
  })
  const s = habits.streakState(h, sundayISO)
  assert(!s.broken, "a new week with nothing done yet reads as broken")
  return "quota still reachable — not broken"
})

check("P5", "a ticked habit satisfies anything waiting on it", () => {
  const gym = T({ id: "gym", habit: H({ history: [D(0)] }) })
  const shower = T({ id: "shower", blockedBy: ["gym"] })
  const ready = planner.readySet([gym, shower], ctx()).map((t) => t.id)
  assert(ready.includes("shower"), "dependent stranded behind a completed habit")

  // Before the tick it must still be blocked.
  const notYet = T({ id: "gym", habit: H({ history: [] }) })
  const readyBefore = planner.readySet([notYet, shower], ctx()).map((t) => t.id)
  assert(!readyBefore.includes("shower"), "dependent ran before its habit blocker")

  // And it must never silently vanish — blocked work is simply not ready.
  const plan = planner.planDay({ tasks: [notYet, shower], ctx: ctx() })
  assert(!plan.blocks.some((b) => b.taskId === "shower"), "blocked task was scheduled")
  return "blocked before the tick, unblocked after"
})

check("S6", "scoring takes its clock as an argument — no hidden system time", () => {
  const src = readFileSync(path.join(ROOT, "lib/tasks/scoring.ts"), "utf8")
  assert(/now: Date/.test(src), "calcScore does not accept an injected clock")
  const task = T({ id: "t", dueDate: D(1) })
  const early = planner.planScore(task, ctx({ now: new Date(2026, 6, 15, 8, 0) }))
  const later = planner.planScore(task, ctx({ now: new Date(2026, 6, 15, 20, 0) }))
  assert(later > early, `urgency must rise as the day passes (${early} → ${later})`)
  return `08:00 ${early} → 20:00 ${later}`
})

// ═══════════════════════════════ G. GUARDIAN ═══════════════════════════════
section("G. Guardian")

check("G1", "a calm day produces zero concerns", () => {
  const tasks = [
    T({ id: "a", dueDate: D(3) }),
    T({ id: "b", habit: H({ history: [D(0), D(-1), D(-2)] }) }),
  ]
  const plan = planner.planDay({ tasks, ctx: ctx() })
  const concerns = guardian.dayConcerns(tasks, plan, ctx())
  eq(concerns.length, 0, `expected silence, got: ${concerns.map((c) => c.message).join(" | ")}`)
  return "silent"
})

check("G2", "moving onto a fixed commitment raises a conflict", () => {
  const tasks = [
    T({ id: "meeting", title: "פגישה", startAt: `${D(0)}T14:00`, fixed: true, durationMinutes: 60 }),
    T({ id: "task", title: "עבודה", durationMinutes: 60 }),
  ]
  const concerns = guardian.guardMove("task", `${D(0)}T14:30`, tasks, ctx())
  const conflict = concerns.find((c) => c.kind === "conflict")
  assert(conflict, "no conflict raised")
  eq(conflict.severity, "high", "a fixed commitment should be a high-severity clash")
  assert(conflict.taskIds.includes("meeting"), "the concern must name the other task")
  assert(conflict.suggestion, "a concern should offer a way forward")
  const clean = guardian.guardMove("task", `${D(0)}T16:00`, tasks, ctx())
  eq(clean.filter((c) => c.kind === "conflict").length, 0, "false conflict at a free time")
  return conflict.message
})

check("G3", "moving ahead of a blocker raises a sequence concern", () => {
  const tasks = [
    T({ id: "logo", title: "לוגו", startAt: `${D(1)}T10:00` }),
    T({ id: "landing", title: "דף נחיתה", blockedBy: ["logo"] }),
  ]
  const concerns = guardian.guardMove("landing", `${D(0)}T10:00`, tasks, ctx())
  const seq = concerns.find((c) => c.kind === "sequence")
  assert(seq, "no sequence concern raised")
  assert(seq.taskIds.includes("logo"), "the blocker must be named")
  return seq.message
})

check("G4", "long-and-calm over short-and-burning raises an inversion concern", () => {
  const tasks = [
    T({ id: "deep", title: "עבודה עמוקה", durationMinutes: 180, dueDate: D(10) }),
    T({ id: "quick", title: "לשלם חשבון", durationMinutes: 15, dueDate: D(0) }),
  ]
  const c = guardian.checkInversion("deep", tasks, ctx())
  assert(c, "no inversion concern raised")
  assert(c.taskIds.includes("quick"), "the burning task must be named")
  const none = guardian.checkInversion("quick", tasks, ctx())
  eq(none, null, "a short task must not trigger inversion")
  return c.message
})

check("G5", "not enough room before a deadline is flagged early", () => {
  // 20 hours of work due by the end of today, at 09:00 — it cannot land.
  const tasks = [T({ id: "report", title: "דוח", durationMinutes: 1200, dueDate: D(0) })]
  const plan = planner.planDay({ tasks, ctx: ctx() })
  const concerns = guardian.dayConcerns(tasks, plan, ctx())
  assert(concerns.some((c) => c.kind === "deadline_risk"), "deadline risk not raised")
  // …and it is raised BEFORE the deadline passes, not after.
  assert(planner.slackMinutes(tasks[0], NOW) < 0, "the test case is not actually tight")
  return "flagged before it was too late"
})

check("G6", "habit concerns are warm and actionable, never shaming", () => {
  const tasks = [
    T({ id: "gym", title: "כושר", habit: H({ history: [D(-2)], minVersion: "רק ללבוש בגדי ספורט" }) }),
  ]
  const plan = planner.planDay({ tasks, ctx: ctx() })
  const concerns = guardian.dayConcerns(tasks, plan, ctx())
  const habit = concerns.find((c) => c.kind === "habit")
  assert(habit, "no habit concern raised")
  assert(habit.suggestion, "a habit concern must offer the smaller version")
  assert(!/כישלון|נכשלת|עצלן/.test(habit.message), "shaming language")
  return `"${habit.message}"`
})

check("G7", "concerns carry severity and kind, are ranked, and are capped", () => {
  const tasks = [
    ...Array.from({ length: 25 }, (_, i) => T({ id: `f${i}`, size: "long" })),
    T({ id: "late", title: "מאחר", durationMinutes: 240, startAt: `${D(0)}T10:00` }),
    T({ id: "h", title: "הרגל", habit: H({ history: [D(-2)] }) }),
  ]
  const plan = planner.planDay({ tasks, ctx: ctx() })
  const concerns = guardian.dayConcerns(tasks, plan, ctx(), 3)
  assert(concerns.length <= 3, "the cap was not applied")
  assert(concerns.every((c) => c.kind && c.severity), "a concern is missing kind or severity")
  const order = { high: 0, medium: 1, low: 2 }
  for (let i = 1; i < concerns.length; i++) {
    assert(order[concerns[i].severity] >= order[concerns[i - 1].severity], "concerns are not ranked")
  }
  return `${concerns.length} surfaced, most severe first`
})

check("G8", "an appointment is not a permanent deadline warning", () => {
  // A meeting happening right now: 09:00, one hour, and it is 09:00.
  const meeting = T({
    id: "meeting",
    title: "פגישה",
    startAt: `${D(0)}T09:00`,
    fixed: true,
    durationMinutes: 60,
  })
  const plan = planner.planDay({ tasks: [meeting], ctx: ctx() })
  const concerns = guardian.dayConcerns([meeting], plan, ctx())
  assert(
    !concerns.some((c) => c.kind === "deadline_risk"),
    `a meeting in progress was flagged as at risk: ${concerns.map((c) => c.message).join(" | ")}`,
  )
  // A real deadline with not enough room still must be flagged.
  const real = T({ id: "report", title: "דוח", dueDate: D(0), durationMinutes: 1200 })
  const p2 = planner.planDay({ tasks: [real], ctx: ctx() })
  assert(
    guardian.dayConcerns([real], p2, ctx()).some((c) => c.kind === "deadline_risk"),
    "a genuine deadline risk was missed",
  )
  return "meetings quiet, deadlines loud"
})

check("G9", "an ordinary day with a backlog stays silent", () => {
  const tasks = [
    ...Array.from({ length: 25 }, (_, i) => T({ id: `b${i}`, size: "medium" })),
    T({ id: "meet", startAt: `${D(0)}T14:00`, fixed: true, durationMinutes: 60 }),
    T({ id: "hab", habit: H({ startedOn: D(-30), history: [D(0), D(-1), D(-2)] }) }),
  ]
  const plan = planner.planDay({ tasks, ctx: ctx() })
  const concerns = guardian.dayConcerns(tasks, plan, ctx())
  eq(concerns.length, 0, `expected silence, got: ${concerns.map((c) => c.message).join(" | ")}`)
  return "silent with a 25-task backlog, a meeting and a habit"
})

check("G10", "the agent never repeats itself — one concern per kind", () => {
  const tasks = [
    ...Array.from({ length: 6 }, (_, i) =>
      T({ id: `late${i}`, title: `מאחר ${i}`, dueDate: D(-2), durationMinutes: 240 }),
    ),
    T({ id: "hab", title: "הרגל", habit: H({ startedOn: D(-30), history: [D(-2)] }) }),
  ]
  const plan = planner.planDay({ tasks, ctx: ctx() })
  const concerns = guardian.dayConcerns(tasks, plan, ctx(), 3)
  const kinds = concerns.map((c) => c.kind)
  eq(new Set(kinds).size, kinds.length, `repeated kinds: ${kinds.join(", ")}`)
  assert(kinds.includes("habit"), "the habit nudge was buried under repeated warnings")
  return `kinds: ${kinds.join(", ")}`
})

// ═══════════════════════════════ H. COST & PERF ════════════════════════════
section("H. Cost & performance")

check("C1", "the engine makes zero AI or network calls", () => {
  for (const f of ["planner.ts", "habits.ts", "guardian.ts"]) {
    const src = readFileSync(path.join(ROOT, "lib/tasks", f), "utf8")
    assert(!/@ai-sdk|generateText|openai|anthropic/i.test(src), `${f} references an AI SDK`)
    assert(!/\bfetch\s*\(|XMLHttpRequest|axios/.test(src), `${f} makes a network call`)
    assert(!/Math\.random|Date\.now\s*\(\)/.test(src), `${f} is not deterministic`)
  }
  return "pure, offline, deterministic"
})

check("C2", "a 200-task day plans in under 50ms", () => {
  const tasks = Array.from({ length: 200 }, (_, i) =>
    T({
      id: `t${i}`,
      size: ["short", "medium", "long"][i % 3],
      priority: ["urgent", "high", "medium", "low"][i % 4],
      dueDate: i % 5 === 0 ? D(i % 7) : undefined,
      blockedBy: i > 10 && i % 11 === 0 ? [`t${i - 7}`] : undefined,
    }),
  )
  const t0 = process.hrtime.bigint()
  planner.planDay({ tasks, ctx: ctx() })
  const ms = Number(process.hrtime.bigint() - t0) / 1e6
  assert(ms < 50, `took ${ms.toFixed(1)}ms`)
  return `${ms.toFixed(1)}ms for 200 tasks`
})

check("C3", "no dependency was added for the engine or this benchmark", () => {
  const pkg = JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8"))
  const all = { ...pkg.dependencies, ...pkg.devDependencies }
  for (const banned of ["vitest", "jest", "mocha", "ts-node", "tsx"]) {
    assert(!all[banned], `${banned} was added`)
  }
  return `${Object.keys(all).length} packages, unchanged`
})

// ── report ─────────────────────────────────────────────────────────────────
let lastSection = ""
for (const r of results) {
  if (r.section !== lastSection) {
    console.log(`\n${r.section}`)
    lastSection = r.section
  }
  const mark = r.pass ? "✅" : "❌"
  console.log(`  ${mark} ${r.id.padEnd(4)} ${r.desc}`)
  if (r.detail) console.log(`         ${r.pass ? "→" : "✗"} ${r.detail}`)
}

const failed = results.filter((r) => !r.pass)
console.log(
  `\n${"═".repeat(60)}\n${results.length - failed.length}/${results.length} passed` +
    (failed.length ? ` — ❌ ${failed.map((f) => f.id).join(", ")}` : " — all green"),
)
rmSync(OUT, { recursive: true, force: true })
process.exit(failed.length ? 1 : 0)
