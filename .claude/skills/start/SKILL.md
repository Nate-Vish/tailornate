---
name: start
description: Begin a new task with the AutoMates pipeline. Assesses complexity, picks the right methodology (direct, agile, V-model), auto-triggers research when needed, and guides through stages.
---

# /start — Begin a New Task

The orchestrator. Assesses what you're dealing with and picks the right workflow.

Be decisive — when the task is clear, just head to it. Don't ask 5 clarifying questions for a one-file fix.

## When invoked:

### Step 1: Understand the task
Listen for:
- **Scope**: one file or many? Clear or ambiguous?
- **Familiarity**: has this codebase/tech been worked with before?
- **Risk**: does it touch auth, data, money, or production?
- **Knowledge gaps**: does this involve tech, libraries, or patterns we haven't used?

### Step 2: Auto-research if needed

**Before routing, check: do we know enough to proceed?**

Spawn the **researcher** subagent automatically when:
- The task mentions a library/API/tool Claude hasn't worked with in this project
- The bug is in a system nobody has touched in weeks
- The user says "I'm not sure how to approach this"
- The task requires understanding an external service or specification

Don't ask "should I research this?" — just do it when the gap is clear. Be decisive.

### Step 3: Route to the right methodology

**Direct** — simple, clear, one file, low risk:
→ Implement → verify → done. No ceremony.
"This is straightforward. Doing it now."

**Agile** — feature work, 2-5 files, moderate complexity:
→ /spec (lightweight) → implement incrementally → /verify each piece → ship.
Work in small iterations. Deliver working pieces, not a big bang.
"Medium scope. I'll spec the requirements, then build incrementally."

**V-Model** — large system, many files, high risk, unfamiliar territory:
→ Full pipeline with verification defined at every level before implementation starts.

```
Requirements (acceptance criteria)     ←→  Acceptance testing
  ↓                                         ↑
System design (integration criteria)   ←→  Integration testing
  ↓                                         ↑
Detailed design (unit criteria)        ←→  Unit testing
  ↓                                         ↑
            Implementation
```

Define success criteria TOP-DOWN. Implement BOTTOM-UP. Verify at each level.

"This is complex. Let me research first, then we'll define acceptance criteria before designing the implementation."

**Exploration** — no clear deliverable yet:
→ Route to /brainstorm.
"Let's explore this first."

### Step 4: After each stage, suggest the next

After brainstorm → suggest /spec
After spec → suggest /plan
After plan approval → implement
After implementation → suggest /verify
After clean verify → suggest commit

Tell the user what stage they're in and what comes next. They can skip ahead or go back anytime. The pipeline guides — it doesn't lock you in.

### Step 5: Manage artifacts

Each stage can produce a file that feeds the next:
- /brainstorm → ideas inline or captured via /idea
- /spec → spec (inline for small, SPEC.md for large)
- /plan → plan (inline for small, PLAN.md for large)
- /verify → review results

For small tasks: keep everything inline.
For large tasks: write to files so they survive /compact.
