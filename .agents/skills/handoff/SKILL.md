---
name: handoff
description: Document a project for whoever comes next, and run a retrospective on the work since the last one. Writes OVERVIEW.md (full project reference), Brief.md (checkpoint), and a dated RETROSPECTIVE (what went wrong, why, what to change). Use at the end of a work session, before a handoff, when onboarding someone, or whenever the user asks to document the project.
---

# $handoff — Document the Project, and Learn From the Session

Produces **three documents**. They serve different readers and must not be merged:

| Document | Reader | Answers | Size |
|---|---|---|---|
| **OVERVIEW.md** | Someone who has never seen this project | "What is this, why is it built this way, where is everything?" | As long as it needs to be |
| **Brief.md** | Someone continuing the work today | "What just happened, where did we stop, what do I do now?" | **Hard cap: 400 words** |
| **docs/RETROSPECTIVE-\<date\>.md** | Us, next time | "What went wrong, why, and what changes because of it?" | One screen. Ruthless. |

The retrospective is **not optional and not a formality**. Documentation stops the next
person repeating a mistake in *this* project; the retrospective stops *us* repeating a
mistake in every project. It is the higher-leverage of the two.

**The rule that makes these worth writing:** code shows *what*. These documents exist to
capture the ***why*** — the decisions, the traps, the constraints, the things learned the
hard way. That knowledge lives only in the conversation and is lost the moment the session
ends. Prioritize it over anything a reader could learn by opening a file.

---

## Process

### Step 1 — Gather facts (do not skip; do not write from memory)

Run these against the actual project. Never state a number you have not verified.

```
ls; find . -maxdepth 3 -iname "*.md" -not -path "./.git/*"   # existing docs
git log --reverse --pretty=format:'%h|%ad|%s' --date=short   # the real history
git status --short; git branch -a; git remote -v             # current state
```

Then read the project's entry point, its models/types, its config file, and any existing
`README`/`Brief`/docs. Run the test suite and the build if they're cheap — a documented
"31/31 passing" is only useful if it's true today.

**Then mine the conversation** for what the repo cannot tell you:
- Decisions and the reasoning behind them, especially rejected alternatives
- Bugs that were hard to find, and *why* the obvious fix was wrong
- Constraints the user stated (explicit rules, things that must never happen)
- Verbatim user requirements worth preserving as quotes
- What is approved but not yet built

### Step 2 — Write or update OVERVIEW.md

If it exists, **update it** — preserve accurate content, correct what drifted, add what's new.
Don't regenerate from scratch and lose detail someone wrote deliberately.

Include, adapted to the project (skip sections that genuinely don't apply):

1. **Header** — name, repo URL, status in one line, language(s)
2. **The idea** — the problem in concrete terms, and what this replaces or enables.
   Include the *guiding constraints* that shaped everything, as a table
3. **Who uses it** — each user profile: who they really are, what they do, how they get in.
   Then name the **primary customer profile** explicitly
4. **Technology** — a table of layer → choice → **why this and not the obvious alternative**
5. **Architecture** — the smallest number of boxes that explains the system. One paragraph
   tracing a typical request/flow end to end
6. **Features** — screen by screen (or module by module), what each does
7. **Decisions worth knowing** — ⭐ *the most valuable section*. Each: the problem, the fix,
   the trap. Include code snippets for anything a future maintainer would "helpfully" undo.
   Number these so other docs can cite them (§6.1, §6.2…)
8. **What was ruled out** — ⭐ for anything that took a real investigation, a table of
   every approach tried and why it failed. Without it the next person re-runs the whole
   hunt. Record the disproved hypotheses too, not just the winning one — "we checked the
   security zones, both returned Intranet" is exactly what stops a repeat.
8. **Repo map** — an annotated tree, every significant file with a one-line purpose.
   Follow it with a **"I need to… → go to…"** table
9. **Configuration** — every knob and what it means
10. **Version history** — what shipped in each version, as tables
11. **Known trade-offs** — accepted deliberately, with the reasoning
12. **Working on this** — run/test/build commands, then **non-negotiable rules** as a
    numbered list

### Step 3 — Write or update Brief.md

**Never append. Never blindly overwrite.** Read the existing Brief line by line and
decide each line's fate — this is a diff, not a rewrite:

| The line is | Do |
|---|---|
| Still true and still needed | **Keep**, unchanged |
| Still true, now less important | **Compress** to a clause, or move it down |
| Done, resolved, or superseded | **Delete.** A finished checkpoint that reads as pending makes the next reader redo it. |
| Durable knowledge, not current state | **Move** to `OVERVIEW.md`, then delete here |
| Plan detail that keeps growing | **Move** to `docs/PLAN-<version>.md`, leave a pointer |

Appending is how the file rots: nothing is ever wrong enough to delete, so it doubles
every few sessions and the reader stops trusting which parts are current.

**Rank what survives by what the next session needs first.** State and next action at the
top; background and rules below. If two items compete for the budget, keep the one that
changes what someone does next.

#### ⚠️ Hard cap: 400 words. Check it before finishing.

```bash
wc -w Brief.md
```

**Why 400.** Measured degradation ("context rot") starts far below the window limit —
[Chroma](https://www.trychroma.com/research/context-rot) tested 18 frontier models and saw
reasoning accuracy fall from 0.92 to 0.68 between a few hundred and ~3,000 input tokens.
400 words ≈ 550 tokens ≈ **under a fifth of where degradation becomes measurable**, leaving
that budget for AGENTS.md, memory, and the actual task.
[Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
frames it as a finite *attention budget*: every token spends it.

Brief.md is also read **first**, which by the "lost in the middle" effect is the strongest
position in the window. Spending that position on a plan the session may not even need is
the waste — not the disk.

**It is a budget, not a target.** Anthropic: *"minimal does not necessarily mean short."*
328 words is fine. 250 that drop a rule someone would break is not. If you genuinely need
420, take them — then look again at what could have moved to a plan document.

It grows without anyone deciding to grow it — plans, tables and history accumulate one
session at a time. On one client project it reached 1881 words before anyone measured it. When it is
over budget, the content is not wrong, it is in the wrong file:

| What crept in | Where it belongs |
|---|---|
| The next version's scope, feature tables | `docs/PLAN-<version>.md` |
| How the system works, decisions, traps | `OVERVIEW.md` |
| Process that is now permanent (branching, deployment) | The workspace `AGENTS.md` |
| Activity log, finished checkpoints | Delete. Git history already has it. |

Brief.md keeps only: **state, next action, what's blocked on someone else, the rules that
must not be broken, and pointers.**

Structure:

```markdown
# Brief — <Project>

**Read this first.** Then [OVERVIEW.md](OVERVIEW.md) for how it works,
[docs/PLAN-<version>.md](docs/) for what to build.

- **Updated:** <date> · **Branch:** <branch> · **Tests:** <verified, not assumed> · **Tree:** <clean / what's uncommitted>

## State
<Where the project actually is, and what is running where. Then one line:
is anything in flight, or is the next session starting clean?>

## Next
<Numbered, ordered, one line each. Point at the plan document for detail —
do not restate it here.>

## Waiting on others
<Blocked on a person, not on us. Who, and what for. Delete the section if empty.>

## Rules that must not be broken
<Only the ones a newcomer would violate by accident. One line each, with a
pointer to the reasoning. Not a style guide.>

## Read before starting
<The retrospective, if there is a recent one worth heeding.>

```bash
<run>
<test>
```
```

**No activity log.** Git history already holds it, and it is the section that grows
without bound. **No section that is currently empty** — an empty heading still costs
tokens and implies something is missing.

### Step 4 — Run the retrospective ⭐

Cover **everything since the last retrospective** (check `docs/` for the most recent one).
Read back over the session: what took far longer than it should have, what was attempted
and abandoned, what the user had to correct.

Write `docs/RETROSPECTIVE-<YYYY-MM-DD>.md` with four parts:

**1. What happened** — a table of attempts and outcomes. Then one line naming the step that
could have come first. Facts only: how many attempts, how many packages, how much of the
user's time.

**2. Root causes** — the hard part. Aim for 3–6, each with a heading, two or three
sentences, and a **Rule:** line that is actually actionable next time.

A root cause is not "the environment was difficult." It is what *we* did that a different
choice would have avoided. Push past the first answer:
- *"The path format was wrong"* → why did finding that take nine days?
- *"I could not reproduce it"* → then why did I keep proposing fixes instead of building a
  reproduction?

**Include the corrections the user made.** Those are the highest-signal findings in the
document — the user saw something you did not.

**3. What worked — keep doing this** — techniques that actually moved things forward.
Without this half, the document reads as self-flagellation and nobody applies it.

**4. The one-line version** — if the reader remembers one sentence, this is it.

Then propagate, or the document changes nothing:
- Durable working-style lessons → **memory** (`feedback` type)
- Rules that apply to every project → the workspace **AGENTS.md**
- Process changes → **this skill**

#### Writing standard

Every word counts. A retrospective nobody rereads is wasted effort.

- Tables and short lines over paragraphs.
- Concrete over abstract: *"8 packages, ~15 deploy cycles, one line of code"*, not
  *"significant rework occurred"*.
- Name the cost in the user's time, not yours. That is the number that matters.
- No blame, no hedging. *"I called it fixed because the error message changed"* — plainly.
- If a section could be deleted without losing a lesson, delete it.

### Step 5 — Report

Tell the user what was written or changed, and flag anything you could not verify or that
looked contradictory. Do not commit unless asked.

---

## Rules

- **Verify every fact.** Counts, versions, test results, file paths — check them. A confident
  wrong number in a handoff doc gets trusted and propagated.
- **Capture the why, not just the what.** If a future reader could learn it by opening the
  file, it's low value. If they'd learn it only by repeating a painful mistake, it's the
  whole point of the document.
- **Write down the traps explicitly.** "Do not re-add X, here's what broke last time" saves
  a future session. Name the test or guard that pins it, if one exists.
- **Update, don't clobber.** Existing docs may hold detail you don't have. Merge.
- **The Brief is a snapshot, the Overview is a reference.** Keep the split clean: no
  "what do I do next" in the Overview, no deep architecture in the Brief.
- **Cross-link them** so either entry point leads to the other.
- **One document language.** Match the project's existing convention (check `AGENTS.md`);
  keep UI strings in their real language when quoting labels.
- **Don't invent a roadmap.** Only write next steps the user actually agreed to. Mark
  anything proposed-but-unconfirmed as such.

## Related

- `$brief` **reads** `Brief.md` for a quick status pulse. This skill **writes** it.
  Run `$handoff` at the end of a session, `$brief` at the start of the next one.
- `$verify` grades the code. This grades **how the work was done** — a session can ship
  correct code and still have gone badly.
