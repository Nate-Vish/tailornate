---
name: remember
description: Explicitly save a learning, decision, or preference that should persist across sessions. Use when auto-memory might miss something important.
---

# /remember — Save What Matters

For things too important to leave to auto-memory's judgment.

## Usage
```
/remember always deploy LOS with bun run build:prod, not bun run build
/remember we chose MeiliSearch over Elasticsearch because of Hebrew tokenizer support
/remember Nathan prefers dark sidebar layouts for dashboards
```

## Process

1. Determine the scope:
   - **This project only** → save to auto-memory (tell Claude "remember that..." naturally)
   - **All projects** → append to `~/Desktop/AgenTeam/LEARNINGS.md`

2. For cross-project learnings, append to LEARNINGS.md:

```markdown
## [YYYY-MM-DD] — [brief title]
[What was learned and why it matters]
```

3. Confirm: "Saved. [one-line summary of what was remembered and where]"

That's it. No 11-step protocol. No session logs. Just save the thing that matters.
