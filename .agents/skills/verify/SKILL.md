---
name: verify
description: Quality gate. Spawns the reviewer subagent to check all changes made in this session. Use after implementation, before committing.
---

# $verify — Quality Gate

Spawn the **reviewer** subagent to independently check all changes from this session.

## Process

### Step 1: Gather what changed
Identify all files modified in this session (use git diff or recall from conversation).

### Step 2: Spawn reviewer
Use the reviewer subagent. Pass it:
- The list of changed files
- A brief description of what was implemented and why
- Any specific concerns (e.g., "this touches auth" or "new dependency added")

### Step 3: Act on findings

**If PASS:**
→ Tell the user: "Clean review. Ready to commit."

**If ISSUES found:**
- **HIGH severity:** Fix immediately. No discussion needed.
- **MEDIUM severity:** Present to the user with the suggested fix. Ask whether to fix or accept the risk.
- **LOW severity:** Mention but don't block. Fix if trivial.

After fixing HIGH/MEDIUM issues, re-run the reviewer to confirm fixes didn't introduce new problems.

### Step 4: Suggest next action

After clean review:
→ "Ready to commit. Want me to create a commit with a descriptive message?"

If the task was large:
→ Also suggest: "Want me to use the evaluator subagent to check this from a user perspective?"
