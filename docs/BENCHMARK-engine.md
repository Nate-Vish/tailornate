# Benchmark — The Planning Engine

The bar for Madko's brain: the deterministic engine that decides **what to do
now**, **when things fit**, and **when to speak up**. Written BEFORE the build;
the build is not done until every criterion here passes.

Executable: `node --experimental-strip-types bench/engine-bench.mjs`
(no new dependencies — Node 22 strips types natively).

## Why this exists
From the vision brainstorm: the product is the agent that runs your day; the
list is its rendered view. The agent's *judgment* must be a deterministic
algorithm — fast, free, consistent, testable — with the AI only at the edges
(understanding fuzzy input, explaining, coaching). This benchmark tests the
algorithm.

---

## A. Data durability (blocking — nothing ships that fails these)
- **D1** Every new field is OPTIONAL. A task from the current production shape
  (no startAt/duration/blockedBy/habit/goalId/checklist/areaIds) loads, renders,
  and scores exactly as before.
- **D2** The persist migration is additive: loading a v1 payload preserves every
  task, category, tag, chain and weight; no record dropped, no user value
  overwritten.
- **D3** The engine never mutates its inputs (pure functions; inputs frozen in
  tests).
- **D4** An empty store, a store with only undated tasks, and a store with only
  fixed events all produce a valid plan (no crash, no NaN, no undefined access).

## B. Time model
- **T1** `startAt` (ISO datetime) + `duration` (minutes) describe a block. A task
  with only `dueDate` (a day) is *flexible* and gets placed by the planner.
- **T2** `fixed: true` marks an immovable commitment (meeting, appointment). The
  planner never moves it and always plans around it.
- **T3** Free-slot computation: given a day's fixed blocks + working window,
  returns the gaps, correctly merged, never overlapping, never negative-length.
- **T4** All date math is LOCAL (no UTC day-shift), consistent with the existing
  `calendar.ts` rule.

## C. Dependencies
- **P1** `blockedBy: string[]` — a task is *ready* only when every blocker is
  completed. Chain steps keep their existing sequential lock.
- **P2** Topological ordering: the ready set never contains a blocked task, and
  completing a blocker unlocks its dependents in the same pass.
- **P3** Cycle-safe: a dependency cycle (A→B→A) must not hang or crash; the
  engine breaks it deterministically and reports it as an issue.
- **P4** A missing/deleted blocker id is ignored (treated as satisfied), never
  a crash — data can arrive out of order after sync.

## D. Prioritization (the improvement over everyone else)
- **S1** Score is driven by **slack**, not raw due date: `slack = deadline − now
  − duration`. A 3-hour task due in 4 hours outranks a 10-minute task due in 2
  hours.
- **S2** Critical-path weight: a task that blocks many others outranks an
  equally-urgent task that blocks nothing.
- **S3** Importance still dominates (existing priority weights respected); the
  user's tunable weights continue to work.
- **S4** Overdue escalates — an overdue task scores strictly higher than the same
  task due today (fixes the documented "overdue doesn't escalate" gap).
- **S5** Deterministic: identical input → byte-identical output, every run. No
  `Math.random`, no `Date.now()` inside pure functions (time is injected).

## E. Placement (the scheduler)
- **E1** Greedy list-scheduling: ready tasks are placed in score order into the
  earliest free slot that fits, respecting fixed blocks.
- **E2** A task never overlaps another placed task or a fixed block.
- **E3** A task that doesn't fit anywhere today lands in `unplaced` with a
  reason — silently dropping work is a failure.
- **E4** Day capacity is respected: total placed minutes ≤ available minutes.
- **E5** **Stability** — after an urgent task is inserted, previously placed
  tasks move as little as possible. Re-planning must not reshuffle the whole day
  (this is the explicit edge over Motion/Reclaim).
- **E6** Backward planning: given a milestone with a deadline and prep tasks, the
  engine schedules prep BEFORE the deadline, latest-first, and flags it when it
  no longer fits.

## F. Habits (Atomic Habits engine)
- **H1** Cadence: daily / specific weekdays / N-times-per-week all correctly
  answer "is this due today?".
- **H2** Streak counts consecutive satisfied periods; completing today extends
  it; the same day counted twice does not double-count.
- **H3** **Never miss twice** — one miss keeps the streak "at risk" but alive;
  two consecutive misses breaks it. A miss never produces shaming state.
- **H4** `times_per_week` is forgiving: 5 of 7 with a target of 3 is a success,
  not a failure.
- **H5** The 2-minute fallback (`minVersion`) is offered when a habit is at risk
  — the counter-suggestion, not a scolding.
- **H6** Habit instances are schedulable blocks (they flow into the planner like
  any other work, with their quota as duration).

## G. The Guardian (when the agent speaks)
- **G1** Silent by default: a normal day with no problems produces ZERO concerns.
- **G2** Time conflict: moving a task onto a fixed block raises a conflict
  concern naming both.
- **G3** Broken dependency: moving a task before its blocker raises a sequence
  concern.
- **G4** Priority inversion: doing a long non-urgent task while a short urgent
  one is due raises a concern (Nathan's explicit rule).
- **G5** Deadline risk: a task whose remaining slack < its duration is flagged
  before it's too late.
- **G6** Habit at risk / missed yesterday raises a *coach* concern with the
  2-minute counter-suggestion, never a shaming message.
- **G7** Every concern carries a severity and a machine-readable kind so the UI
  can decide loudness; concerns are ranked, and only the top few surface.

## H. Cost & performance
- **C1** Zero AI calls in the engine. Nothing in `planner.ts` / `habits.ts` /
  `guardian.ts` imports an AI SDK or calls the network.
- **C2** A full day plan over 200 tasks completes in < 50 ms.
- **C3** No dependency added to package.json for the engine or the benchmark.

## I. Surface (proof it's real)
- **U1** The day view renders an hour-by-hour timeline with fixed blocks, placed
  tasks, and free gaps visible.
- **U2** "מה עכשיו" reads the engine's top of queue — not a separate sort.
- **U3** Concerns surface as "?" chips; tapping one shows the explanation.
- **U4** Both themes readable; Hebrew RTL correct; mobile-first.
- **U5** The existing views (week, month, table, projects) still work unchanged.

---

## Scoring
Each criterion: ✅ pass · ⚠️ partial (documented) · ❌ fail.
**Ship gate: zero ❌ in A–H.** Section I verified in the browser.

## Result — 2026-07-15

**50 / 50 green** (`node bench/engine-bench.mjs`). Sections A–H all pass.

### What the loop caught
The benchmark earned its keep. Round one found three defects a "looks right"
review would have missed:

| # | Defect | Why it mattered |
|---|--------|-----------------|
| S4 | A task 10 days overdue scored *identically* to one 3 days overdue — the escalation saturated at a hard cap | The exact "overdue doesn't escalate" flaw this engine exists to fix |
| G4 | The priority-inversion guard never fired: it compared slack against the wrong horizon | The explicit rule (don't sink into a long calm task while something short burns) was dead code |
| H7 | A habit ticked today was scheduled again the same day | Would double-book the day and make the streak feel broken |

Then a 48-agent adversarial verification pass (4 slices, every claim
independently reproduced or refuted) confirmed **33 further gaps**, which
traced to three roots I had introduced:

| Root | What it broke |
|------|---------------|
| **The planner had no notion of "this day" or "now"** | Tomorrow's meeting landed on today's timeline; work was scheduled into hours already gone; the entire backlog was crammed into today, so the overload warning fired permanently |
| **`startAt` was overloaded as both a scheduled time and a deadline** | Every meeting became a permanent high-severity deadline warning — the agent nagged through every appointment |
| **"habit done" was defined differently in each place that asked** | A task blocked by a habit was stranded forever *and vanished silently* — absent from both the plan and the unplaced list |

The fixes: a `dayRole` horizon (committed / optional / other-day) so only work
the day actually owes can count as overload; a `now` floor on today's free
slots; `deadlineOf` returning a *kind* (`appointment` vs `deadline`) so slack is
measured correctly for each; and one shared `isTaskDone(task, date)` used by the
planner, the guardian and the store. Ten new criteria (E7-E9, H8-H10, P5, S6,
G8-G10) were added so none of it can regress — the benchmark grew 39 → 50.

Three older checks (S1, E3, G5) then failed *correctly*: they had encoded the
old, wrong meaning of `startAt`. They were rewritten against the corrected
semantics rather than the code being bent back to pass them.

### Performance
- 200-task day plan: **0.6 ms** (bar: < 50 ms)
- Zero AI calls, zero network, zero new dependencies in the engine
- Deterministic: identical output across runs *and* across input order

### Section I (surface) — verified by reading, not by browser
`next dev` is broken in this environment (hangs with no output while
`next --version` works) — a known local tooling problem in this project, not
app code. Per the standing rule, the authoritative build gate is the Vercel
deployment, so the surface is verified by code review here and must be
confirmed in a browser on the Vercel preview before it counts as done.

### Follow-up bar (added by the vision work, not yet built)
- The **learning layer**: `estimateDuration` currently stops at the size
  default. Tier 2 of the cascade — the user's own history — is the next build,
  and needs its own criteria here.
- **Offline**: the app shell has no service worker, so today it will not open
  without a network. Required by the local-first goal.
- **Restore on a new device** must be a blocking criterion once backup exists:
  install → passcode → data returns.
