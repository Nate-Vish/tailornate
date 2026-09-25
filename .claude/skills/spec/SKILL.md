---
name: spec
description: Define requirements through structured interrogation. Forces thorough thinking before implementation. Use when scope is unclear or the task is complex.
---

# /spec — Specify Before Building

Interrogate until every requirement is concrete. No vague answers. No assumptions.

## Process

### Phase 1: Understand the intent
Ask the user:
1. **What problem does this solve?** Not "what does it do" — WHY does it exist?
2. **Who uses this and when?** Real scenario, not hypothetical.
3. **What does "done" look like?** How do we verify it works?

### Phase 2: Dig into specifics
Based on the task type, ask targeted questions:

**For features:**
- What's the simplest version that validates the idea?
- What inputs does it take? What outputs does it produce?
- What happens on invalid input? On failure? On edge cases?
- Does it need to integrate with existing systems? Which ones?

**For bug fixes:**
- What's the exact reproduction steps?
- What should happen vs what actually happens?
- When did it start? What changed recently?

**For refactors:**
- What's wrong with the current approach?
- What should NOT change? (preserve these behaviors)
- How do we verify nothing broke?

### Phase 3: Challenge
Push back on anything vague:
- "It should be fast" → "What's the latency target in milliseconds?"
- "Handle errors properly" → "Which errors? What does the user see for each?"
- "Make it scalable" → "For how many users? What's the current load?"

### Phase 4: Summarize
Write a clear spec:
```
## Spec: [Task Name]

### Problem
[Why this needs to exist]

### Requirements
- [Concrete requirement 1]
- [Concrete requirement 2]

### Out of Scope
- [What we're NOT doing]

### Verification
- [How to prove it works]
```

For large tasks, write to SPEC.md. For small tasks, present inline.

Then ask: **"Ready for /plan, or do you want to adjust anything?"**
