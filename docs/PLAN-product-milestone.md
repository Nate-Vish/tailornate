# Plan: Madko Product Milestone — Accounts, Sync, Reminders, Recurrence

Turns the single-device personal tool into a multi-device product with a nudge.
Every phase ships independently; the app works at the end of each.

## Approach

**Backend: Supabase** (Postgres + Auth + RLS). One vendor covers auth (email OTP
+ Google login), a queryable tasks table (required for server-side reminder
queries — a JSONB blob can't answer "what's due at 09:00"), row-level security,
and pg_cron for the reminder tick — avoiding Vercel Hobby's once-a-day cron limit.

**Local-first stays.** Zustand+localStorage remains the working copy (speed,
offline, privacy story). Sync is a thin layer: per-task `updatedAt` LWW merge,
dirty-id outbound queue (debounced push), pull on load, `deletedAt` tombstones.
Logged-out users keep exactly today's behavior.

**Reminders: Web Push** (VAPID via `web-push`). iOS constraint: push works only
for the installed home-screen PWA (iOS 16.4+), permission must follow a user
gesture — so the UI detects "not installed" and shows the add-to-home-screen
guide instead of a dead permission prompt. Sender = Supabase Edge Function on a
5-min pg_cron tick querying `remind_at <= now() AND reminded_at IS NULL`.

**Recurrence: spawn-on-complete.** A recurring task holds a compact rule
({freq: daily|weekly|monthly, interval, byday?}); completing it creates the next
occurrence with an advanced dueDate. No materialized series, history stays
clean, XP keeps working.

## Steps

### Phase 0 — Safety net (no behavior change)
1. [ ] Add vitest + tests for store mutators (toggleComplete cascades, chain lock, attach guards, snooze), scoring, ics-parse — files: `vitest.config.ts`, `lib/tasks/*.test.ts`, `package.json` — verify: `pnpm test` green in CI-able script
2. [ ] JSON backup/restore in Settings (export/import full persisted state, version-stamped) — files: `components/tasks/SettingsView.tsx`, `lib/tasks/backup.ts` — verify: export → wipe localStorage → import → identical state

### Phase 1 — Accounts
3. [ ] Supabase project + schema: `profiles` (weights/categories/tags JSONB), `tasks` (all Task fields + user_id, updated_at, deleted_at), `chains`, `push_subscriptions`; RLS: user sees only own rows — files: `supabase/schema.sql`, docs — verify: RLS denial tested with two users
4. [ ] Auth: email OTP + Google, `@supabase/ssr` session handling in proxy.ts; auth replaces the passcode gate for /tasks + task APIs (passcode stays as env kill-switch until Phase 2 ends) — files: `proxy.ts`, `app/tasks/gate/*` → login page, `lib/supabase/*` — verify: login/logout on two browsers; APIs 401 without session
5. [ ] Env wiring on Vercel (SUPABASE_URL, ANON_KEY, SERVICE_ROLE) — verify: prod login works

### Phase 1.5 — Auth security hardening (blocks Phase 2)
Email-OTP and Google login carry real risks; each item below is a task, not a note.
5a. [ ] **Mailbox = master key**: OTP expiry ≤10 min, single-use, ≤5 verify attempts, send-rate limit per email+IP — verify in Supabase auth config — verify: expired/reused codes rejected
5b. [ ] **No user enumeration**: login responses identical whether the email exists or not — verify: timing+body diff test
5c. [ ] **Minimal-content emails**: OTP mail contains code only — never task data, never PII beyond the address; Hebrew template; sender domain SPF/DKIM/DMARC once custom SMTP is added — verify: raw email inspection
5d. [ ] **OAuth done right**: PKCE flow, strict redirect-URL allowlist (prod + preview + localhost only), Google accounts with unverified emails rejected, account-linking by verified email documented — verify: tampered redirect_uri fails
5e. [ ] **Session hygiene**: httpOnly+Secure+SameSite cookies, refresh-token rotation, logout revokes server-side, new-device login email notification — verify: stolen-cookie-after-logout test
5f. [ ] **RLS adversarial test**: second test user attempts read/write of first user's rows via direct PostgREST calls — verify: all denied; SERVICE_ROLE never shipped client-side (grep CI check)
5g. [ ] **?next open-redirect guard** carried over to the new login page (relative paths only) — verify: external URL in next is ignored
5h. [ ] **Account deletion**: self-serve delete removes rows + auth user; privacy page documents retention — verify: deleted user's data gone from DB

### Phase 2 — Sync
6. [ ] Sync engine: initial upload of local data on first login (idempotent), pull-merge on load (LWW by updated_at), debounced push of dirty ids, tombstone deletes — files: `lib/tasks/sync.ts`, `store.ts` (stamp updatedAt in mutators), `TasksApp.tsx` (sync lifecycle) — verify: phone+laptop two-way edit test; vitest merge cases
7. [ ] Conflict + offline behavior: queue survives reload; offline edits sync on reconnect — verify: airplane-mode test
8. [ ] Re-run docs/BENCHMARK.md (A3, B3, B4 especially) — verify: scorecard updated

### Phase 3 — Reminders
9. [ ] `remindAt` on Task (+ TaskSheet picker with smart defaults: due-date 09:00; AI action patch field) — files: `types.ts`, `TaskSheet.tsx`, `ai.ts`, `route.ts` — verify: set/edit/clear via UI and via AI
10. [ ] Push plumbing: VAPID keys, service worker (`public/sw.js`), subscribe flow in Settings (+ iOS install-detection guide), `push_subscriptions` upsert — files: `public/sw.js`, `lib/push.ts`, `SettingsView.tsx`, `app/api/push-subscribe/route.ts` — verify: test notification button rings phone + desktop
11. [ ] Sender: Supabase Edge Function + pg_cron (5 min) → web-push → mark reminded_at; notification deep-links to /tasks — files: `supabase/functions/remind/` — verify: reminder fires ≤5 min after remind_at on installed iOS PWA and Android/desktop
12. [ ] Quiet hours = a SET-TIME confirmation guard, never a silent mute (Nathan, 2026-07-11):
    - User-set reminders always fire at their chosen time; if the time falls inside quiet hours (default 22:00-08:00), Madko asks "this is in your quiet hours — sure?" at set-time, then honors it.
    - Auto-generated reminders (task-due default, planner nudges) never self-schedule into the night — snap to a daytime slot. A task whose deadline is literally at night counts as an explicit time.
    - Window editable/removable in Settings. Hebrew notification copy.
    - verify: a 03:00 user reminder rings at 03:00 after confirm; an auto reminder never fires in the window

### Phase 4 — Recurrence
13. [ ] Recurrence rule on Task + spawn-on-complete in store (next dueDate/remindAt advanced; recurring badge on cards) — files: `types.ts`, `store.ts` (+tests), `TaskSheet.tsx`, `TaskCard.tsx` — verify: vitest date-advance cases incl. month-end
14. [ ] AI support: create/update recurring ("כל ראשון בבוקר") — files: `ai.ts`, `route.ts` — verify: prod prompt test
15. [ ] Final benchmark re-run + scorecard; update privacy/terms (accounts, push, server storage) — files: `docs/BENCHMARK.md`, `app/legal/*` — verify: all ❌-free

## Risks
- **iOS push flakiness** → detect standalone mode, guide install first; test on Nathan's iPhone before calling done
- **Sync data loss** → Phase 0 backup/restore ships first; initial upload never deletes local; tombstones instead of hard deletes
- **Auth migration locks Nathan out mid-transition** → passcode env kill-switch retained until Phase 2 verified on both his devices
- **Supabase free-tier pausing (1 week inactivity)** → pg_cron tick doubles as keep-alive; note in ops doc
- **Scope creep** → phases are shippable checkpoints; stop/reassess after each

## Done When
- Same tasks on iPhone + laptop within seconds of an edit
- A reminder set in Madko rings the installed iPhone PWA
- "כל יום ראשון" task recreates itself on completion
- Login required; passcode gate retired; legal pages updated
- `pnpm test` green; BENCHMARK scorecard has no ❌ and B3 loses its "zero tests" note

## Decisions (Nathan, 2026-07-11)
1. Auth: email-OTP + Google login — APPROVED, with the Phase 1.5 security checklist as a blocking gate
2. Quiet hours: APPROVED as a set-time confirmation guard (never silent) — user-set alerts always fire; auto alerts avoid the night window (default 22:00-08:00, editable)
3. Supabase region: eu-central-1 Frankfurt — APPROVED


## Phase 5 — Views + Smart Planner (flagship, after calendar-in-store)
Design decisions (Nathan, 2026-07-11): month = agenda + infographic heatmap, zoomable month→week→day and back; planner PROPOSES and user approves (never auto); "busy day" = calendar events AND task load, both weighted.
16. [ ] Real day/week/month views: day=thin today, week=7-day agenda w/ per-day load, month=heatmap calendar (cells by load), click-to-zoom + back — files: TodayView split into DayView/WeekView/MonthView, lib/tasks/load.ts — verify: three genuinely different layouts; heatmap colors match load
17. [ ] Weighted daily load model: calendar events + task load/scores per day — verify: unit tests over known fixtures
18. [ ] Smart planner: propose distributing undated/new tasks onto lighter days, backward-plan prep before deadlines/meetings, propose rebalancing on overload — user approves each — files: lib/tasks/planner.ts, AI actions, suggestion UI — verify: travel scenario produces sane spread
19. [ ] Twice-daily calendar check (cron) feeds the planner; suggestions surface as approvable cards — verify: cron fires, suggestion appears

## Phase 6 — Multimodal & multi-calendar intake
20. [ ] Multiple calendar feeds with per-category mapping (family cal → משפחה) — files: settings, calendar-feed route, ai payload — verify: two calendars merge, events inherit category
21. [ ] Image/file intake in AI chat (Gemini vision): extract dates, infer structure (isolated/chain/branch), backward-plan deadlines, judge importance — needs Nathan's real-example calibration — verify: meeting-invite screenshot → prep task with deadline before the meeting
