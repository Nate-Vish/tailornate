---
name: idea
description: Quick-capture an idea. Appends to IDEAS.md with a timestamp. Works anytime, no context switch needed.
allowed-tools:
  - Read
  - Write
  - Edit
---

# /idea — Quick Idea Capture

Capture an idea instantly. No analysis, no judgment — just save it.

## Usage
```
/idea build a CLI tool that generates CLAUDE.md from codebase analysis
/idea what if subagents could share a knowledge base?
```

## Process

1. Read `IDEAS.md` in the project root (create if it doesn't exist)
2. Append the idea with a timestamp:

```markdown
## [YYYY-MM-DD] — [brief title derived from the idea]
[The idea as the user stated it]
```

3. Confirm: "Captured. [one-line summary]"

That's it. No analysis, no follow-up unless the user asks. Speed is the point.
