# Spec — Manage Categories & Tags (create / edit / delete)

Client-side only. Lets the user shape their own תחומים (categories) and תגים
(tags within a category), instead of the fixed seed set.

## Requirements

- **C1** Create a category: name (required), color (from a preset palette),
  icon (from a preset set). Appears immediately in the תחומים list, the
  add/edit task sheets, and everywhere categories render.
- **C2** Edit a category: change name / color / icon. Existing tasks and tags
  keep pointing at it (id stable) and re-render with the new look.
- **C3** Delete a category — **never orphans data**: its tasks and its tags
  move to a target category the user picks (default: another existing one).
  The last remaining category cannot be deleted. Confirmation shows how many
  tasks/tags will move.
- **T1** Create a tag inside a category: name (required), color, icon. Appears
  under that category and in the task sheets' tag picker for that category.
- **T2** Edit a tag: name / color / icon (and optionally move it to another
  category). Tasks keep their tagId.
- **T3** Delete a tag: tasks that had it keep their category, their tagId is
  cleared (no dangling tagId). Confirmation shown.
- **G1** All state changes go through store mutators (single source of truth),
  persist to localStorage, and cannot orphan a task's categoryId or leave a
  task pointing at a deleted tag. Ids are stable across edits.
- **G2** New categories/tags flow to the AI payload so the assistant can use
  them; a created category gets nameEn = name.
- **G3** Both themes readable; mobile-first; reachable from the תחומים tab
  (list + drill-down) with clear affordances, no nested-button HTML.
- **G4** Build clean on Vercel; adversarial review of the deletion/reassign
  paths passes.

## Verification
1. Create a category → shows in list + task sheet. Add a tag under it → shows
   in tag picker. Edit both → look updates, tasks intact. 
2. Delete a category holding tasks+tags → pick target → tasks & tags moved,
   none orphaned (verify in localStorage). Deleting the last one is blocked.
3. Delete a tag on a task → task keeps category, tagId cleared.
4. Vercel build READY; two-reviewer audit of store mutators passes.

## Verification result (2026-07-11)
Built and verified live in the browser (dev server):
- C1 ✓ created "תחביבים" (color+icon) → appears in תחומים list AND the task
  creation sheet's category chips.
- C2 ✓ edit sheet works (name/color/icon pickers, live preview) in dark mode.
- C3 ✓ deleted "אישי" holding 5 tasks + 2 tags with reassign → all 5 tasks
  and 2 tags moved to target, **0 orphaned tasks**, no tasks lost. Last-
  category delete is guarded.
- T1 ✓ created a tag. T2 ✓ edit sheet works; moving a tag to another category
  now moves its tasks too (no cross-category dangling). T3 ✓ deleted a tag →
  the task kept its category and its tagId was cleared.
- G1–G3 ✓ all via store mutators, persisted, no nested-button HTML.
Build gate: Vercel deployment READY (local next build unaffected — the earlier
semver glitch was a corrupted local install, repaired via frozen-lockfile
reinstall; next dev + preview verified above).
