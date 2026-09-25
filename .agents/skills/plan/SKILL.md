---
name: plan
description: Design an implementation plan for a task. Reads codebase, auto-researches if needed, proposes approach with steps and verification criteria. Use after $spec or when the approach is unclear.
---

# $plan — Plan Before Building

Create a concrete implementation plan. The plan becomes the prompt for building.

## Process

### Step 1: Research first

Before designing anything:
- Read the files that will be affected
- Understand existing patterns and conventions
- Identify dependencies and constraints

**Auto-trigger the researcher subagent when:**
- The task involves a library or API not already used in the project
- The existing code is unfamiliar or undocumented
- There are multiple possible approaches and you need data to choose

Don't ask permission to research. If there's a knowledge gap, fill it.

### Step 2: Design the approach
Consider:
- What's the simplest approach that meets the spec?
- Are there existing patterns in the codebase to follow?
- What are the alternatives and why is this one better?
- What's the risk? What could go wrong?

Explain WHY this approach over alternatives. The user wants to learn, not just receive orders.

### Step 3: Break into steps
Create ordered steps, each with:
- What to do
- Which files to touch
- How to verify it worked

### Step 4: Present the plan

```
## Plan: [Task Name]

### Approach
[What we'll do and WHY this approach over alternatives]

### Steps
1. [ ] [Step description] — files: [x, y] — verify: [how]
2. [ ] [Step description] — files: [x, y] — verify: [how]
...

### Risks
- [What could go wrong → mitigation]

### Done When
- [Success criteria — concrete, testable]
```

For large tasks, write to PLAN.md. For small tasks, present inline.

### Step 5: Wait for approval

Present the plan and ask: **"Approve this plan? I'll implement it step by step."**

DO NOT implement until the user approves. If they have changes, revise the plan first.

Once approved, implement step by step. Mark each step complete as you go. Run verification after each major step. When all steps pass, suggest `$verify` for a final quality check.
