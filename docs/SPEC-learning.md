# Spec — The Learning Layer ("model of self")

The engine decides well, but today it treats Nathan like anyone. This layer
makes it learn *him*: how long his work really takes, when he actually gets
things done, which warnings he ignores, which habits survive.

Personal app, one user — so the profile can be fitted aggressively to him with
no general-purpose defaults to protect.

## Principle
**Counters and running averages, not machine learning.** Every signal below is
a deterministic statistic computed from what already happened. That keeps it
free, instant, offline, and testable exactly like the planner. No model, no
training, no inference cost.

The layer is READ-ONLY to the engine: modules take a `profile` and use it to
adjust their own numbers. Nothing about the engine's structure changes.

## What gets learned

| Signal | Captured from | Used by |
|--------|---------------|---------|
| **Duration reality** — actual vs estimated, per bucket (tag → category → size) | time between `in_progress` and `completed`, or an explicit "how long did it take" answer | `estimateDuration` (tier 2 of the cascade) |
| **Active hours** — when work actually gets completed | histogram of `completedAt` hour | slot preference in `planDay` |
| **Real day capacity** — minutes of work actually finished per day | rolling median of completed minutes | overload detection, honest planning |
| **Nudge response** — per concern kind: shown → acted / ignored | concern shown, then whether the user did the thing within the day | `dayConcerns` gating |
| **Habit reality** — which weekday a habit is always skipped | habit history gaps by weekday | coach suggestions ("move gym to Thursday?") |
| **Deferral pattern** — what keeps getting snoozed or pushed | snooze + reschedule counts per task/category | a gentle "is this actually a priority?" prompt |

## Shape

```ts
export type Profile = {
  // bucketKey → { factor, samples }. factor 1.4 = "takes 40% longer than estimated"
  durationFactor: Record<string, { factor: number; samples: number }>
  // 24 buckets, share of completions per hour
  activeHours: number[]
  // rolling median of minutes completed per day
  dayCapacityMinutes: number | null
  // concern kind → { shown, acted }
  nudgeResponse: Record<string, { shown: number; acted: number }>
  // habitId → weekday → { due, done }
  habitByWeekday: Record<string, Record<number, { due: number; done: number }>>
  deferrals: Record<string, number>
  updatedAt: string
}
```

Stored in the same persisted store (so it syncs and backs up with everything
else), under its own key so a corrupt profile can be reset without touching
tasks.

## Rules that keep it honest

- **Confidence gates everything.** A factor with fewer than 5 samples is not
  applied. Cold start = today's behaviour, exactly.
- **Recency-weighted.** An exponential moving average, so last month matters
  less than last week. Life changes; the profile must follow.
- **Bounded.** `durationFactor` clamps to [0.5, 3]. One task that sat open for
  a week must not teach the engine that everything takes 8 hours.
- **Outlier-resistant.** A completion longer than ~4× the estimate is recorded
  but weighted down — it usually means "forgot to tick it", not real work time.
- **Never learns shame.** Nothing in the profile is presented as a failing. A
  low `dayCapacityMinutes` means "plan less", not "you did badly".
- **Transparent and correctable.** A settings screen shows what it learned in
  plain Hebrew ("משימות בתחום לימודים לוקחות לך בערך פי 1.4") with a reset per
  row. The user must be able to see and overrule the model of himself.

## Integration points (all additive)
- `PlanContext` gains an optional `profile`. Absent → today's behaviour.
- `estimateDuration(task, profile?)` — inserts tier 2 between explicit and
  size-default.
- `planDay` — prefers slots inside active hours for long/deep work.
- `dayConcerns` — a concern kind whose `acted / shown` ratio drops below a
  threshold (with enough samples) stops surfacing.
- `habitNudges` — uses `habitByWeekday` to propose a cadence change instead of
  nagging about a day he never does it.

## Benchmark criteria (to add to docs/BENCHMARK-engine.md)
- **L1** Cold start: an empty profile produces byte-identical plans to no profile.
- **L2** Confidence gate: a factor with < 5 samples is never applied.
- **L3** Bounds: no sample, however extreme, pushes a factor outside [0.5, 3].
- **L4** Recency: a changed pattern overtakes an old one within ~2 weeks of data.
- **L5** Nudge suppression: a concern ignored N times stops surfacing, and one
  that is acted on keeps surfacing.
- **L6** Determinism: the profile is a pure function of the event history.
- **L7** Durability: a corrupt/absent profile never breaks a plan or loses tasks.
- **L8** Transparency: every learned value is renderable as one Hebrew sentence.
