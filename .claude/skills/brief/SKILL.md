---
name: brief
description: Check project status. Reads Brief.md and summarizes current focus, recent activity, and next steps. On-demand only.
---

# /brief — Project Status Check

Read `Brief.md` (in project root or Workspace/) and give the user a concise summary:

1. **Current Focus** — what's the priority right now?
2. **Recent Activity** — last 3-5 entries from the activity table
3. **Next Steps** — what's queued up?
4. **Blockers** — anything waiting on someone or something?

Keep it to 10 lines or less. The user wants a quick pulse, not a full report.

If Brief.md is stale (last update > 7 days ago), mention it: "Brief.md hasn't been updated since [date]. Want me to refresh it?"
