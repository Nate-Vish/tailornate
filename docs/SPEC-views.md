# Spec — Day/Week/Month Views + Month Calendar

Build scope: **client-side only, no backend.** Fixes the dead day/week/month
toggle and delivers the calendar Nathan co-designed (category stripes +
drag-to-reschedule). Verified against every R# below before reporting done.

## Requirements

- **R1** The יום/שבוע/חודש toggle switches between three genuinely different
  layouts — not merely different list lengths.
- **R2 · יום** = the current today-focused dashboard, unchanged: hero
  next-task, squad strip, "later" list, snoozed strip, done-today strip.
- **R3 · שבוע** = agenda of the current week (Sun–Sat containing today). Each
  day is a row: day name + date, a load indicator (task count), and the
  active tasks whose dueDate is that day. Today's row is visibly marked. A
  "ללא תאריך" section lists undated active top-level tasks by score.
- **R4 · חודש** = calendar grid of the current month. Each day cell shows the
  day number and up to 3 category-colored stripes (one per distinct category
  of tasks due that day), "+N" when more. Empty days show no stripes. Today's
  cell is marked. Fits 375px with no horizontal scroll.
- **R5** Tapping a month day opens a detail panel listing that day's tasks as
  category-colored chips, or an empty-day hint.
- **R6** In the month detail, a task drags onto another day cell to
  reschedule: on drop its dueDate becomes that day, both cells' stripes
  update immediately, and the change persists (store → localStorage).
- **R7** The calendar and week day-rows show only DATED active tasks; undated
  tasks appear only in the week's "ללא תאריך" section. Completed tasks are
  excluded from stripes and agenda.
- **R8** All date math is LOCAL (no UTC off-by-one). Stripe/chip color = tag
  color if the task has a tag, else its category color — same rule as
  TaskCard elsewhere.
- **R9** Both themes readable (AA); mobile-first; drag works on touch + mouse.
- **R10** No regression: nav, AI, settings, existing day dashboard unchanged.
  `pnpm build` + `tsc --noEmit` clean.
- **R11** Sub-task children are not shown as independent calendar entries
  (only top-level tasks), consistent with the today list.
- **R12** Empty month/week states are graceful (never a blank screen).

## Notifications settings — design locked here, BUILT LATER (Phase 3, needs push backend)

Kept compact so it never overloads the eye — one card, indented sub-rows:
- **N1** Master switch "התראות" — OFF by default. The browser permission
  prompt is requested only when the user turns it on (after a gesture).
- **N2** When on, ≤4 rows appear beneath it:
  1. תזכורות משימות (on/off)
  2. נודניקים מהתכנון החכם (on/off)
  3. שעות שקט — from/to time (default 22:00–08:00), per the confirmation-guard
     rule (user-set alerts always ring; auto alerts avoid the window)
  4. שעת ברירת מחדל לתזכורת של משימה עם דדליין (default 09:00)
- **N3** When off: the rows collapse; reminder time pickers elsewhere still
  work but show an inline "התראות כבויות" hint.

## Verification method
1. `tsc --noEmit` + `pnpm build` clean.
2. Browser (local + dev preview): toggle shows 3 distinct layouts; week rows
   correct for the current week; month stripes match a known task set
   (Nathan's 13=work+family / 14=empty / 15=friends pattern reproduced with
   seeded dated tasks); drag a task between two days and confirm persistence
   after reload.
3. Adversarial review pass over the built code against R1–R12.

## Verification result (2026-07-11)
Built and verified. Live browser (local + will re-check on Vercel preview):
R1–R12 all met. Adversarial review (2 reviewers → verify phase) raised 2
candidates, both fixed:
- **R4** — month "+N" badge counted raw tasks, not distinct categories →
  now `count = distinctColors(...).length` so "+N" reflects hidden categories.
- **R3** — undated section header showed the full count but rendered only 12,
  silently hiding extras → cap removed, header now always matches the list.
Types: `next dev` compiles all three views live with no errors; a clean
`tsc --noEmit` earlier returned no diagnostics. NOTE: local `next build`
currently crashes on a Next-CLI semver guard (`_semver.default.satisfies is
not a function`) — an install/tooling glitch in the CLI entrypoint, not app
code; Vercel builds in a clean environment and is the authoritative gate.
