# Madko Product Benchmark

The bar every release must clear. Scores: ✅ pass · ⚠️ pass with noted gaps · ❌ fail.
Re-run after every significant change; a ❌ blocks deploy.

## A. Micro — every feature, on its own

### A1. Access gate
- [ ] Wrong passcode → clear Hebrew error; correct → lands on intended page (?next preserved)
- [ ] Rate-limited after repeated failures; APIs return 401 JSON, pages redirect
- [ ] Renders correctly in light/dark, mobile/desktop; input usable (no iOS zoom, no dark-on-dark)

### A2. Dashboard (compass home)
- [ ] Hero always shows the top-scored actionable task; empty state when none
- [ ] Snooze to tomorrow/date hides task until that date, returns automatically, clears boost
- [ ] Done-today strip: local-timezone correct, faded + strikethrough, XP sum right, undo works
- [ ] Day/week/month caps list length as designed; drag-to-boost works incl. above hero
- [ ] Daily tip renders, changes daily, no hydration mismatch

### A3. Task model operations
- [ ] Create/edit/delete with all fields; delete asks confirmation; children orphaned not deleted
- [ ] Branch: sub-tasks complete parent when all done; completing parent cascades; XP sums once
- [ ] Chain: steps unlock strictly in order — enforced in the store for every entry point (UI, AI); empty chains pruned
- [ ] Snoozed/locked tasks cannot be completed accidentally from any view
- [ ] Boost survives reload; cleared on complete/snooze

### A4. Table ("everything") view
- [ ] Filters (status/category/period/search) compose correctly; sort toggles; counts + XP match
- [ ] CSV opens in Excel with Hebrew intact; all columns populated
- [ ] AI analyze returns insight over the *filtered* set only

### A5. AI assistant
- [ ] Every manual operation is reachable via text: create/edit/complete/reopen/delete/branch/chain/attach/boost/snooze/query
- [ ] Calendar prompts work: add-from-calendar, bulk-complete-with-exclusions; unconnected → helpful pointer
- [ ] AI sees full task state (incl. parent/chain/snooze) — no blind spots vs UI
- [ ] Voice: mic works on Chrome desktop + iOS Safari; graceful errors; transcription fallback
- [ ] Never invents ids; ambiguous requests ask instead of act
- [ ] Off-scope requests (homework, recipes, general chat) refused in one sentence, zero actions — the AI is a task tool, not a free LLM
- [ ] Prompt/state exfiltration attempts refused; daily request cap bounds token spend per client

### A6. Integrations
- [ ] Calendar feed: valid secret URL connects with event count; invalid URL/host → specific Hebrew error
- [ ] Recurring events (daily/weekly incl. BYDAY) expand correctly in the -7..+21d window
- [ ] ICS export imports cleanly into Google Calendar; per-task GCal link prefills correctly

### A7. Status + Domains views
- [ ] Levels = XP-based (effort-weighted) consistently everywhere; balance bars reflect XP; laggard highlighted
- [ ] Category drill-down: tag cards accurate; task list excludes children; actions available

### A8. Visual/interaction quality
- [ ] Both themes readable on every screen (contrast ≥ WCAG AA for text)
- [ ] Safe-area respected; no iOS focus zoom; touch targets ≥ 40px for primary actions
- [ ] PWA installs standalone with icon on iOS/Android; theme-color matches
- [ ] Animations never leave UI in a stuck state; rapid tab switching safe

## B. Macro — the system as a whole

### B1. Methodology soundness (does it match how experts manage time?)
- [ ] Capture is frictionless (GTD: get it out of your head) — + always ≤1 tap away, free-text AI capture
- [ ] Prioritization is explicit and tunable (Eisenhower-like urgency×deadline scoring, user weights)
- [ ] One unambiguous "next action" (GTD next-action) — the hero card
- [ ] Big work is decomposable (branch) and sequence-able (chain) — matches "next physical action" thinking
- [ ] Review loop exists (status balance, table analytics, AI weekly analysis)
- [ ] Deferral is a first-class, guilt-free action (snooze) — not deletion, not clutter

### B2. Coherence & simplicity
- [ ] A new user understands the home screen in <10 seconds without a manual
- [ ] No two features fight (e.g., boost vs snooze vs chain-lock have clear precedence)
- [ ] Terminology consistent across UI/AI/legal (תחומים, תגים, שרשרת, ציון)

### B3. Code health (a company could build on this)
- [ ] Clear module boundaries: lib/tasks (domain) vs components/tasks (UI) vs app/api (server)
- [ ] No dead code/exports; types strict; build+tsc clean
- [ ] State transitions centralized in store; no component mutates tasks directly
- [ ] Server routes validated, rate-limited, size-capped; no secrets in repo

### B4. Security & privacy
- [ ] Private area unreachable without passcode (pages + all task APIs)
- [ ] No SSRF (host allowlist + no redirect following), no XSS (no dangerouslySetInnerHTML), headers sane
- [ ] Data stays on-device; every server touchpoint documented in privacy page
- [ ] AI cannot be prompt-injected into destructive bulk ops beyond action cap

### B5. Competitive stance (vs Todoist / TickTick / Things)
- [ ] Differentiators hold: Hebrew-first + true RTL, life-balance gamification, AI with full app control, calendar-aware bulk ops
- [ ] Table-stakes gaps honestly listed: multi-device sync, reminders/notifications, recurring tasks, offline PWA cache, undo
- [ ] The one-sentence pitch is defensible: "המצפן שאומר לך מה עכשיו"

## C. Known accepted trade-offs (reviewed, not bugs)
- localStorage only (single device) until accounts/sync milestone
- No push reminders (needs service worker + permission model)
- Recurring *tasks* unsupported (recurring calendar events are readable)
- In-memory rate limits reset per serverless instance (soft speed-bump; hard limits need Redis/KV — accepted at beta scale)
- No automated tests yet (state machine now centralized in store — add vitest before accounts/sync milestone)
- Monthly/yearly recurring calendar events expand only their first occurrence

## Review log

**2026-07-11 — full audit (2 independent review agents + manual browser pass).** 16 findings; all HIGH/MEDIUM fixed same day:
- Invariants moved INTO the store (chain lock on complete, one-level nesting, cycle-proof attach, no chain reassignment + prune) — AI path can no longer bypass UI rules
- Scoring rebalanced: size spread narrowed (100/80/60) + default weights 45/30/15/10 so big important work stops sinking below trivial errands
- Levels now XP-based (effort), not count-based (volume) — fixes biased life-balance
- Date-only strings parsed as local dates everywhere (UTC shifted days abroad); done-today already local
- AI hardening: status-patch on completed rejected, ≤3 deletes per reply, snoozedUntil visible to model, prompt boundary for title-injection
- SSRF: calendar feed no longer follows redirects
- UX: snoozed strip on dashboard, lock icon + disabled affordances for locked steps

## Scorecard (2026-07-11)
| Area | Score | Notes |
|------|-------|-------|
| A1 Gate | ✅ | verified light/dark, ?next, rate-limit, 401 JSON |
| A2 Dashboard | ✅ | hero/snooze/done-today/tip verified incl. midnight TZ |
| A3 Task ops | ✅ | store-level guards added; cascade + XP verified |
| A4 Table | ⚠️ | works; title/priority columns not sortable (minor) |
| A5 AI | ✅ | full parity incl. snooze; calendar flows verified on prod |
| A6 Integrations | ⚠️ | ICS import path verified by construction, not by live GCal import; monthly RRULE = first occurrence only |
| A7 Status/Domains | ✅ | XP levels consistent across all views |
| A8 Visual | ✅ | AA contrast measured (8.4:1 worst pill); safe-area; PWA |
| B1 Methodology | ⚠️ | capture/next-action/defer strong; no contexts, no real weekly-review ritual |
| B2 Coherence | ✅ | precedence: chain-lock > snooze > boost > score |
| B3 Code health | ⚠️ | clean boundaries, zod, strict TS; ZERO automated tests — top debt |
| B4 Security | ⚠️ | gate+allowlist+caps solid; in-memory rate limits are per-instance on serverless (accepted, documented) |
| B5 Competitive | ⚠️ | moat = agentic Hebrew AI + calendar bulk ops; blockers to daily-driver: reminders, sync, recurring tasks, backup |
