import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { BoostMode, Category, Chain, Priority, Size, Status, Tag, Task, ViewName, Weights } from "./types"
import { defaultWeights, seedCategories, seedTags, seedTasks } from "./seed"
import { calcScore } from "./scoring"

export type Award = {
  xp: number
  tagId?: string
  categoryId: string
  leveledUp: boolean
  taskTitle: string
  cascadeCount?: number
}

export type ChainStepInput = { existingId?: string; title?: string }

type State = {
  tasks: Task[]
  categories: Category[]
  tags: Tag[]
  chains: Chain[]
  weights: Weights
  view: ViewName
  drilldownCategoryId: string | null
  aiOpen: boolean
  lastAward: Award | null
  addTask: (task: Omit<Task, "id" | "createdAt">) => Task
  updateTask: (id: string, patch: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleComplete: (id: string) => void
  branchTask: (parentId: string, titles: string[]) => void
  attachChildren: (parentId: string, childIds: string[]) => void
  detachFromParent: (id: string) => void
  createChain: (
    title: string,
    steps: ChainStepInput[],
    base: { categoryId: string; tagId?: string; priority?: Priority; size?: Size },
  ) => string | null
  unchain: (taskId: string) => void
  setWeights: (w: Weights) => void
  resetWeights: () => void
  boostTask: (id: string, mode: BoostMode, minScore: number) => void
  clearBoost: (id: string) => void
  snoozeTask: (id: string, untilISO: string | null) => void
  addCategory: (input: { name: string; color: string; icon: string }) => Category
  updateCategory: (id: string, patch: Partial<Pick<Category, "name" | "color" | "icon">>) => void
  deleteCategory: (id: string, reassignToId?: string) => void
  addTag: (input: { name: string; categoryId: string; color: string; icon: string }) => Tag
  updateTag: (id: string, patch: Partial<Pick<Tag, "name" | "color" | "icon" | "categoryId">>) => void
  deleteTag: (id: string) => void
  setView: (v: ViewName) => void
  openDrilldown: (categoryId: string) => void
  setAIOpen: (open: boolean) => void
  clearAward: () => void
}

const uid = (prefix = "t") => `${prefix}_${Math.random().toString(36).slice(2, 10)}`

export function taskXP(task: Task): number {
  const sizeXP = task.size === "short" ? 10 : task.size === "medium" ? 25 : 50
  const priorityBonus = task.priority === "urgent" ? 15 : task.priority === "high" ? 8 : 0
  return sizeXP + priorityBonus
}

function bucketXP(tasks: Task[], categoryId: string, tagId?: string): number {
  return tasks
    .filter(
      (t) =>
        t.status === "completed" && (tagId ? t.tagId === tagId : t.categoryId === categoryId),
    )
    .reduce((sum, t) => sum + taskXP(t), 0)
}

function pruneChains(chains: Chain[], tasks: Task[]): Chain[] {
  return chains.filter((c) => tasks.some((t) => t.chainId === c.id))
}

export const useTasksStore = create<State>()(
  persist(
    (set, get) => ({
      tasks: seedTasks,
      categories: seedCategories,
      tags: seedTags,
      chains: [],
      weights: defaultWeights,
      view: "today",
      drilldownCategoryId: null,
      aiOpen: false,
      lastAward: null,

      addTask: (t) => {
        const task: Task = { ...t, id: uid(), createdAt: new Date().toISOString() }
        set((s) => ({ tasks: [task, ...s.tasks] }))
        return task
      },

      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),

      deleteTask: (id) =>
        set((s) => {
          const remaining = s.tasks
            .filter((t) => t.id !== id)
            .map((t) => (t.parentId === id ? { ...t, parentId: undefined } : t))
          return { tasks: remaining, chains: pruneChains(s.chains, remaining) }
        }),

      toggleComplete: (id) =>
        set((s) => {
          const task = s.tasks.find((t) => t.id === id)
          if (!task) return {}
          // Chain steps unlock in order — enforced here so no entry point
          // (UI, AI, future API) can skip ahead.
          if (task.status !== "completed" && isChainLocked(task, s.tasks)) return {}
          const nowIso = new Date().toISOString()

          if (task.status === "completed") {
            // Reopen. If it was a sub-task of a completed parent, reopen the parent too.
            const reopenIds = new Set([id])
            if (task.parentId) {
              const parent = s.tasks.find((t) => t.id === task.parentId)
              if (parent?.status === "completed") reopenIds.add(parent.id)
            }
            return {
              tasks: s.tasks.map((t) =>
                reopenIds.has(t.id)
                  ? { ...t, status: "not_started" as Status, completedAt: undefined }
                  : t,
              ),
            }
          }

          // Complete: cascade down to children, and up to parent when it was the last sibling.
          const completeIds = new Set([id])
          for (const child of s.tasks.filter((t) => t.parentId === id && t.status !== "completed")) {
            completeIds.add(child.id)
          }
          if (task.parentId) {
            const siblings = s.tasks.filter((t) => t.parentId === task.parentId && t.id !== id)
            const parentDone = siblings.every((t) => t.status === "completed")
            if (parentDone) completeIds.add(task.parentId)
          }

          const xp = s.tasks.filter((t) => completeIds.has(t.id)).reduce((sum, t) => sum + taskXP(t), 0)
          const xpBefore = bucketXP(s.tasks, task.categoryId, task.tagId)
          const xpGained = s.tasks
            .filter(
              (t) =>
                completeIds.has(t.id) &&
                (task.tagId ? t.tagId === task.tagId : t.categoryId === task.categoryId),
            )
            .reduce((sum, t) => sum + taskXP(t), 0)
          const leveledUp = levelFor(xpBefore + xpGained) > levelFor(xpBefore)

          return {
            tasks: s.tasks.map((t) =>
              completeIds.has(t.id)
                ? { ...t, status: "completed" as Status, completedAt: nowIso, boost: null }
                : t,
            ),
            lastAward: {
              xp,
              tagId: task.tagId,
              categoryId: task.categoryId,
              leveledUp,
              taskTitle: task.title,
              cascadeCount: completeIds.size,
            },
          }
        }),

      branchTask: (parentId, titles) =>
        set((s) => {
          const parent = s.tasks.find((t) => t.id === parentId)
          // One level of nesting only, and a chain step can't also be a branch
          // parent — a sub-task or chain member cannot be split.
          if (!parent || parent.parentId || parent.chainId) return {}
          const nowIso = new Date().toISOString()
          const children: Task[] = titles
            .map((raw) => raw.trim())
            .filter(Boolean)
            .map((title) => ({
              id: uid(),
              title,
              priority: parent.priority,
              size: "short" as Size,
              status: "not_started" as Status,
              categoryId: parent.categoryId,
              tagId: parent.tagId,
              parentId,
              createdAt: nowIso,
            }))
          if (children.length === 0) return {}
          return { tasks: [...children, ...s.tasks] }
        }),

      attachChildren: (parentId, childIds) =>
        set((s) => {
          const parent = s.tasks.find((t) => t.id === parentId)
          // Parent must be top-level; children must be free-standing (no
          // parent, no chain, no children of their own). Prevents cycles
          // and >1 level of nesting from any caller, including the AI.
          if (!parent || parent.parentId) return {}
          const eligible = new Set(
            childIds.filter((id) => {
              const t = s.tasks.find((x) => x.id === id)
              return (
                t &&
                t.id !== parentId &&
                !t.parentId &&
                !t.chainId &&
                !s.tasks.some((x) => x.parentId === t.id)
              )
            }),
          )
          if (eligible.size === 0) return {}
          return {
            tasks: s.tasks.map((t) => (eligible.has(t.id) ? { ...t, parentId } : t)),
          }
        }),

      detachFromParent: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, parentId: undefined } : t)),
        })),

      createChain: (title, steps, base) => {
        const clean = steps.filter((st) => st.existingId || st.title?.trim())
        if (clean.length < 2 || !title.trim()) return null
        const chainId = uid("c")
        const nowIso = new Date().toISOString()
        set((s) => {
          const newTasks: Task[] = []
          const patched = new Map<string, Partial<Task>>()
          clean.forEach((st, i) => {
            if (st.existingId) {
              const existing = s.tasks.find((t) => t.id === st.existingId)
              // A task can belong to one chain; silently re-chaining would
              // strand its old chain. Skip instead.
              if (!existing || existing.chainId) return
              patched.set(st.existingId, { chainId, chainOrder: i })
            } else {
              newTasks.push({
                id: uid(),
                title: st.title!.trim(),
                priority: base.priority ?? "medium",
                size: base.size ?? "short",
                status: "not_started",
                categoryId: base.categoryId,
                tagId: base.tagId,
                chainId,
                chainOrder: i,
                createdAt: nowIso,
              })
            }
          })
          const tasks = [
            ...newTasks,
            ...s.tasks.map((t) => (patched.has(t.id) ? { ...t, ...patched.get(t.id) } : t)),
          ]
          return {
            chains: pruneChains([...s.chains, { id: chainId, title: title.trim() }], tasks),
            tasks,
          }
        })
        return chainId
      },

      unchain: (taskId) =>
        set((s) => {
          const tasks = s.tasks.map((t) =>
            t.id === taskId ? { ...t, chainId: undefined, chainOrder: undefined } : t,
          )
          return { tasks, chains: pruneChains(s.chains, tasks) }
        }),

      setWeights: (w) => {
        if (w.priority + w.deadline + w.status + w.size === 0) return
        set({ weights: w })
      },

      resetWeights: () => set({ weights: defaultWeights }),

      boostTask: (id, mode, minScore) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, boost: { mode, setAt: new Date().toISOString(), minScore } } : t,
          ),
        })),

      clearBoost: (id) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, boost: null } : t)) })),

      // Snoozing also drops any manual boost — "not now" beats "top of list".
      snoozeTask: (id, untilISO) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? { ...t, snoozedUntil: untilISO ?? undefined, boost: untilISO ? null : t.boost }
              : t,
          ),
        })),

      addCategory: (input) => {
        // Reuse an existing area with the same name (case-insensitive, name or
        // nameEn) instead of minting a duplicate.
        const key = input.name.trim().toLowerCase()
        const dupe = get().categories.find(
          (c) => c.name.trim().toLowerCase() === key || c.nameEn.trim().toLowerCase() === key,
        )
        if (dupe) return dupe
        const cat: Category = { id: uid("cat"), nameEn: input.name, ...input }
        set((s) => ({ categories: [...s.categories, cat] }))
        return cat
      },

      updateCategory: (id, patch) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id
              ? { ...c, ...patch, nameEn: patch.name ?? c.nameEn }
              : c,
          ),
        })),

      // Deleting a category NEVER orphans data: its tasks and tags move to a
      // target category (user-picked, else the first other one). The last
      // category cannot be deleted.
      deleteCategory: (id, reassignToId) =>
        set((s) => {
          const others = s.categories.filter((c) => c.id !== id)
          if (others.length === 0) return {}
          const target =
            (reassignToId && others.find((c) => c.id === reassignToId)?.id) || others[0].id
          return {
            categories: others,
            tasks: s.tasks.map((t) => (t.categoryId === id ? { ...t, categoryId: target } : t)),
            tags: s.tags.map((t) => (t.categoryId === id ? { ...t, categoryId: target } : t)),
          }
        }),

      addTag: (input) => {
        // Reuse an existing tag of the same name in the same category.
        const key = input.name.trim().toLowerCase()
        const dupe = get().tags.find(
          (t) => t.categoryId === input.categoryId && t.name.trim().toLowerCase() === key,
        )
        if (dupe) return dupe
        const tag: Tag = { id: uid("tag"), ...input }
        set((s) => ({ tags: [...s.tags, tag] }))
        return tag
      },

      updateTag: (id, patch) =>
        set((s) => {
          const tag = s.tags.find((t) => t.id === id)
          // Moving a tag to another category takes its tasks with it, so a
          // task never sits in category A carrying a tag that lives in B.
          const movedTo = patch.categoryId && tag && patch.categoryId !== tag.categoryId ? patch.categoryId : null
          return {
            tags: s.tags.map((t) => (t.id === id ? { ...t, ...patch } : t)),
            tasks: movedTo
              ? s.tasks.map((t) => (t.tagId === id ? { ...t, categoryId: movedTo } : t))
              : s.tasks,
          }
        }),

      // Deleting a tag clears it off any task that carried it (the task keeps
      // its category), so no task is left pointing at a tag that's gone.
      deleteTag: (id) =>
        set((s) => ({
          tags: s.tags.filter((t) => t.id !== id),
          tasks: s.tasks.map((t) => (t.tagId === id ? { ...t, tagId: undefined } : t)),
        })),

      setView: (v) => set({ view: v, drilldownCategoryId: null }),
      openDrilldown: (categoryId) => set({ view: "projects", drilldownCategoryId: categoryId }),
      setAIOpen: (open) => set({ aiOpen: open }),
      clearAward: () => set({ lastAward: null }),
    }),
    {
      name: "sidra-tasks-v1",
      // Bump this whenever the persisted shape changes, and add a matching
      // `if (version < N)` block in migrate() below. The contract: every
      // release LOADS AND PRESERVES data written by any previous release —
      // migrations are additive and never drop or replace the user's data.
      version: 1,
      partialize: (s) => ({
        tasks: s.tasks,
        categories: s.categories,
        tags: s.tags,
        chains: s.chains,
        weights: s.weights,
      }),
      migrate: (persisted, version) => {
        const p = (persisted ?? {}) as {
          tasks?: Task[]
          categories?: Category[]
          tags?: Tag[]
          chains?: Chain[]
          weights?: Weights
        }
        // Future schema changes go here as additive steps, e.g.:
        //   if (version < 2) { /* transform p.tasks, keep everything else */ }
        void version
        // Preserve the user's data as-is; only backfill true gaps so an older
        // or partial payload can't crash a newer build. A task's own fields
        // always win over the defaults — nothing is overwritten.
        const tasks = (Array.isArray(p.tasks) ? p.tasks : seedTasks).map((t) => ({
          ...t,
          // keep the task's own value; fill only if an old payload is missing it
          priority: t.priority ?? ("medium" as Priority),
          size: t.size ?? ("short" as Size),
          status: t.status ?? ("not_started" as Status),
        }))
        return {
          tasks,
          categories: p.categories?.length ? p.categories : seedCategories,
          tags: Array.isArray(p.tags) ? p.tags : seedTags,
          chains: Array.isArray(p.chains) ? p.chains : [],
          weights: p.weights ?? defaultWeights,
        }
      },
    },
  ),
)

export function selectSortedActive(s: Pick<State, "tasks" | "weights">): Task[] {
  return s.tasks
    .filter((t) => t.status !== "completed")
    .map((t) => ({ t, score: calcScore(t, s.weights) }))
    .sort((a, b) => b.score - a.score)
    .map(({ t }) => t)
}

export function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

// Local calendar date of a UTC timestamp. Comparing raw ISO prefixes breaks
// near midnight (Israel evening = previous day in UTC).
export function localDateOf(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function isSnoozed(t: Task): boolean {
  return !!t.snoozedUntil && t.snoozedUntil > todayISO()
}

// The "today" list: top-level tasks only (children render nested under their
// parent), chains surface only their current step, snoozed tasks wait it out.
export function selectTodayList(s: Pick<State, "tasks" | "weights">): Task[] {
  return selectSortedActive(s).filter((t) => {
    if (t.parentId) return false
    if (t.chainId && isChainLocked(t, s.tasks)) return false
    if (isSnoozed(t)) return false
    return true
  })
}

// Completed today — the dashboard's "already done" strip.
export function selectDoneToday(s: Pick<State, "tasks">): Task[] {
  const today = todayISO()
  return s.tasks
    .filter((t) => t.status === "completed" && t.completedAt && localDateOf(t.completedAt) === today)
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""))
}

export function childrenOf(tasks: Task[], parentId: string): Task[] {
  return tasks.filter((t) => t.parentId === parentId)
}

export function chainSteps(tasks: Task[], chainId: string): Task[] {
  return tasks
    .filter((t) => t.chainId === chainId)
    .sort((a, b) => (a.chainOrder ?? 0) - (b.chainOrder ?? 0))
}

// A chain step is locked while an earlier step is still open.
export function isChainLocked(task: Task, tasks: Task[]): boolean {
  if (!task.chainId) return false
  return tasks.some(
    (t) =>
      t.chainId === task.chainId &&
      (t.chainOrder ?? 0) < (task.chainOrder ?? 0) &&
      t.status !== "completed",
  )
}

export function chainProgress(tasks: Task[], chainId: string): { done: number; total: number } {
  const steps = tasks.filter((t) => t.chainId === chainId)
  return { done: steps.filter((t) => t.status === "completed").length, total: steps.length }
}

export function selectRecentDone(s: Pick<State, "tasks">, limit = 5): Task[] {
  return s.tasks
    .filter((t) => t.status === "completed")
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""))
    .slice(0, limit)
}

export function selectDoneCount(
  s: Pick<State, "tasks">,
  filter: { tagId?: string; categoryId?: string },
): number {
  return s.tasks.filter((t) => {
    if (t.status !== "completed") return false
    if (filter.tagId) return t.tagId === filter.tagId
    if (filter.categoryId) return t.categoryId === filter.categoryId
    return false
  }).length
}

// Levels are earned by XP, not by task count — three trivial errands no longer
// equal one hard deliverable, and "balance" measures effort, not frequency.
const XP_PER_LEVEL = 60

export function selectBucketXP(
  s: Pick<State, "tasks">,
  filter: { tagId?: string; categoryId?: string },
): number {
  return s.tasks
    .filter((t) => {
      if (t.status !== "completed") return false
      if (filter.tagId) return t.tagId === filter.tagId
      if (filter.categoryId) return t.categoryId === filter.categoryId
      return false
    })
    .reduce((sum, t) => sum + taskXP(t), 0)
}

export function levelFor(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1
}

export function progressInLevel(xp: number): number {
  return ((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100
}
