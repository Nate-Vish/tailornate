# Plan: Accounts + Cloud Sync (Supabase) — v2, post red-team

Implementation-ready spec for turning Madko from a single-device local tool into
a synced, multi-device product with real accounts. Grounded in 2026 research
(Supabase auth security + local-first sync engines) and hardened by a 4-lens
adversarial red-team (21 confirmed gaps folded in below). Builds on
[PLAN-product-milestone.md](PLAN-product-milestone.md); details Phases 0–2.

> **Why v2.** The red-team's verdict on v1 was "architecture sound, not yet
> buildable": the central data-loss defense was under-specified in three
> load-bearing places (merge mechanism, clock source, seed-id/migration), each of
> which silently lost tasks in the two-device case. The three structural fixes:
> (1) a **three-way merge against a persisted snapshot**, not timestamp per-field
> LWW; (2) **server-authoritative clocks**, never trust the client wall-clock;
> (3) a **seed-data firewall** — re-mint seed ids and never sync seed rows.

## Principle: local-first, cloud-synced
Zustand + localStorage stays the working copy (instant, offline, private).
Supabase is the shared source of truth, synced in the background. Logged-out
users keep today's behavior. No sync framework (PowerSync/Zero solve multi-user
collaboration; Legend-State/TanStack-DB are beta/alpha in 2026) — hand-rolled
keeps our architecture intact, costs nothing, no lock-in, and is auditable line
by line, which is what you want holding the only copy of a user's tasks.

## Data model (Postgres)
Every syncable table carries `user_id`, `updated_at`, `deleted_at`. We reuse the
client-generated string ids as primary keys so localStorage maps directly. **No
hard foreign keys** (they fight soft-deletes and out-of-order sync; integrity is
maintained app-side as today). Single-valued relations only (`tag_id`,
`chain_id`), so no array-merge hazard.

```sql
create table tasks (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  title text not null, notes text,
  priority text not null, size text not null, status text not null,
  category_id text not null, tag_id text,
  due_date date, created_at timestamptz not null, completed_at timestamptz,
  snoozed_until date, boost jsonb,
  parent_id text, chain_id text, chain_order int,
  checklist jsonb,                 -- [{id,text,done}] — the lightweight tier (Phase 0.5)
  remind_at timestamptz, reminded_at timestamptz,   -- Phase 3 (reserved)
  recurrence jsonb,                                  -- Phase 4 (reserved)
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  device_id text,                  -- last writer, for deterministic tie-break
  primary key (user_id, id)
);
create index on tasks (user_id, updated_at);
-- categories / tags / chains: same shape (user_id, id, its fields, updated_at, deleted_at, device_id)
-- settings: (user_id pk, weights jsonb, notif jsonb, updated_at, device_id)
```
`updated_at` is **server-set** on every write (DB default / trigger); the client
never supplies it as the merge authority (client clocks are unreliable). Ties on
the same field break deterministically by `(updated_at, device_id)`.

## Row-Level Security (the security floor)
RLS is the real boundary; app `.eq('user_id',…)` filters are UX/perf only.
Enable RLS on **every** table the moment it's created — a table with RLS
*disabled* is world-readable to anyone with the publishable key (root of
CVE-2025-48757). Per table:
```sql
alter table tasks enable row level security;
create policy "own rows" on tasks for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
```
Test adversarially: pgTAP two-user isolation + raw `curl` to PostgREST with each
user's JWT (a policy gap can hide behind the app's own query filters).

## Sync engine (`lib/tasks/sync.ts`) — three-way merge, not timestamp LWW
The v1 "per-field LWW by timestamp" was un-implementable (no per-field clocks
exist) and unsafe (client-clock skew). Replaced with a **three-way merge against
a persisted last-synced snapshot** — no per-field DB clocks needed, and it's the
standard correct approach.

- **Snapshot:** on every successful sync, persist the exact server state we last
  saw (`sidra-sync-base` in localStorage) *atomically* with the dirty set. This is
  the merge base and it survives reload.
- **Dirty tracking is field-granular.** Each mutator records which fields changed.
  Push sends only changed fields (`UPDATE … SET only-those`), or `INSERT` if new.
  On ack, **compare-and-clear**: clear a field's dirty flag only if its pushed
  value still matches current — a field edited *during* the in-flight push stays
  dirty (fixes the "edit lost while pushing" gap).
- **Merge (pull + realtime):** for each incoming server row, `serverΔ =
  diff(server, base)`, `localΔ = diff(local, base)`. Apply `serverΔ`; where a
  field is in *both* deltas (a true conflict), break the tie by
  `(server.updated_at, device_id)` and surface a quiet "changed on another device"
  note. Update the snapshot. No field the user didn't touch is ever clobbered.
- **Deletes are tombstones** (`deleted_at`), never hard-delete. **Precedence:
  delete wins** over a concurrent edit; on applying a tombstone, replicate the
  store's referential repair on the receiving device (reassign orphaned
  `categoryId` to a surviving category, clear a dangling `parentId`/`chainId`) so
  a task can't vanish into an invisible state.
- **Offline:** the dirty set is the queue; replay on reconnect. Cold-start
  tolerant (a paused/re-provisioned backend that returns empty for a migrated
  user triggers a full re-push, not a local wipe).
- **Honest sync state, always:** `synced` only when dirty set empty AND last push
  2xx AND session valid; otherwise `pending` (offline/queued) or `error`
  (non-2xx/auth/RLS). The UI never shows "synced" over a stuck queue — the exact
  never-lose-data failure to avoid.

## Seed-data firewall (do this BEFORE Phase 1)
Today `seed.ts` ships **deterministic ids** (`t_1..t_15`, `cat_*`, `tag_*`) on
every install. Under "reuse client ids as PKs + union by id," two devices'
divergent copies of the same seed id would be merged and one side destroyed, and
fresh/reinstalled devices would push demo rows into the real account. Fix, as a
pre-Phase-1 persist migration (irreversible once users sync, so ship it first):
1. Re-mint every seed record id with `uid()` at first run, namespaced per device,
   so no two installs collide.
2. Tag seed-origin rows (`seed: true` / known-id set).
3. First-login migration **never pushes unmodified seed rows**; a pristine-seed
   store pulls-only.
4. The `migrated` flag is keyed to the server install, not only local, so a reset
   backend forces a correct re-migration.

## First-login migration + device merge (seed-safe, loss-proof)
One-time per device, gated by a server-aware `migrated` flag:
1. Backfill a missing `updatedAt` to a **sentinel** (not `now()` — that makes the
   later-migrating device win everything), and treat sentinel clocks as lowest
   priority.
2. **First device:** server empty → push only the user's *non-seed* records.
3. **Second device (already has divergent local data):** fetch server; diff by id.
   id only local → push; id only server → pull; **id in both and the records
   differ → keep BOTH** (the divergent copy gets a fresh id) and show a "review N
   merged tasks" prompt. We do **not** timestamp-LWW legacy records — their
   per-field edit recency is unrecoverable, and a duplicate is far cheaper than a
   silently-dropped task.
4. Genuine typed-twice duplicates (different ids): keep both, delete manually.

## Auth (`@supabase/ssr`, Next 16)
- **Methods:** Email **OTP code** (not magic link — corporate scanners consume
  single-use links) + Google OAuth, PKCE.
- **`proxy.ts`** (renamed from middleware in Next 16): refresh via `getUser()`,
  forward cookies to request+response, `Cache-Control: private, no-store` on
  authed routes. It is **not** the only gate.
- **`getUser()` everywhere on the server**, never `getSession()` (tamperable).
  Re-verify `getUser()` at the top of **every** route that touches data —
  including the existing `tasks-ai`, `tasks-transcribe`, `calendar-feed` (today
  they rely on the passcode proxy; when it retires they'd go public otherwise).
- **Keys:** new `sb_publishable_…` / `sb_secret_…`; secret server-only, never
  `NEXT_PUBLIC_`. A CI grep fails the build if the secret key appears client-side.
- **Preview isolation:** a **separate Supabase project** (or at least separate
  keys + DB) for Vercel Preview, so PR builds can't read/write real user tasks;
  prod redirect URLs stay exact (no `**`).
- Passcode gate stays as an env kill-switch until sync is verified on both your
  devices, then retires.

## Phase 1.5 — Security gate (blocks sync going live)
Each is a task + verification:
- **OTP hygiene:** expiry ≤15–30 min, single-use, ≤5 attempts, resend cooldown,
  send-rate limited. **CAPTCHA** (Turnstile) on auth endpoints.
- **No enumeration:** route `signInWithOtp` through a server handler returning a
  constant body + constant-ish timing regardless of existence; decide
  `shouldCreateUser` policy so OTP sign-up neither leaks existence nor makes
  phantom users.
- **Minimal emails + custom SMTP** (Resend on `mail.tailornate.com`, DKIM/SPF,
  link-tracking off); Hebrew, code only.
- **OAuth:** PKCE; exact redirect allowlist; self-validate `next` (relative only)
  in callbacks; reject unverified-email Google accounts / document linking.
- **Session hygiene:** httpOnly+Secure+SameSite, auto refresh-token rotation.
- **RLS adversarial test:** pgTAP + raw `curl` per user; anon fully denied.
- **Account deletion:** `SECURITY DEFINER` RPC with `SET search_path = ''`,
  schema-qualified, `REVOKE EXECUTE FROM public, anon` + `GRANT` only
  `authenticated`, a fresh re-auth confirmation, a forced backup export first, and
  a soft-delete + grace period before the hard cascade.
- **Dependency hygiene:** pin `@supabase/*`, enable Renovate (2026 had real auth
  CVEs).

## Phased steps (each ships working)
- **Phase 0 — Safety net:** (a) **one shared, versioned serialization** used by
  BOTH backup/restore and sync (so they can't drift; import ignores-and-preserves
  unknown fields, backfills `updatedAt`). (b) JSON backup/restore + the two-export
  **merge** → ships your laptop↔phone consolidation today, off-device backup.
  (c) The **seed-id re-mint** persist migration. (d) vitest: mutators, scoring,
  merge, and the seed/migration cases.
- **Phase 0.5 — Checklist** (`checklist?` on Task; tick UI + `n/m` badge; AI
  support). Plus a written **decision rule in the AI prompt**: checklist = trivial
  in-task ticks (no XP, not in Today); sub-task = a real task; chain = order
  matters. Column already reserved.
- **Phase 1 — Accounts:** Supabase project (Frankfurt) + preview project, schema +
  RLS, auth (OTP + Google) via `@supabase/ssr` in `proxy.ts`, login page,
  `getUser()` added to the three legacy API routes, Vercel env wiring. Verify:
  login on two browsers; all task APIs 401 without a session.
- **Phase 1.5 — Security gate** (above). Blocks Phase 2.
- **Phase 2 — Sync:** `lib/tasks/sync.ts` (three-way merge, persisted snapshot,
  field-granular dirty set, tombstones + repair, honest states), server-set
  `updated_at`, seed-safe first-login migration + keep-both device merge, sync
  lifecycle + a keep-alive ping (free-tier pauses after ~7 days idle). Verify:
  two-device two-way edit; offline edit syncs on reconnect; the red-team vitest
  cases (disjoint legacy edits both survive; seed store never pollutes cloud;
  edit-during-push not lost; delete-vs-edit precedence); RLS re-tested.

## Open decisions for you
1. **Custom SMTP:** Resend on `mail.tailornate.com` (needs a DNS record from you).
2. **Checklist auto-complete:** manual for v1 (progress badge only)? [recommended]
3. **Passcode:** keep as env kill-switch through Phase 2, then retire? [recommended]
4. **Merge review UX:** on second-device login, show a "review N merged tasks"
   screen rather than a silent union? [recommended — the red-team makes this
   non-optional for same-id divergence]
5. **Preview backend:** stand up a second free Supabase project for previews? [recommended]

## Red-team appendix (21 confirmed gaps, all addressed above)
Data-loss: seed-id collision (C1), legacy-timestamp clobber (C2), three-way-merge
spec (H1), edit-during-push (H2), tombstone precedence (H3), reinstall re-seed
(H4), clock source, snapshot persistence, clock-skew, orphan repair. Auth:
legacy routes public, preview shares prod DB, deletion-RPC hardening, enumeration.
Ops/product: false "synced" state, free-tier pause, checklist definition, empty-
backend re-backfill, seed pushed to cloud, backup/sync serialization drift. Full
findings + repros in the red-team transcript for this milestone.
</content>
