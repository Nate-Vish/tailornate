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

function doneCountInBucket(tasks: Task[], categoryId: string, tagId?: string): number {
  return tasks.filter(
    (t) =>
      t.status === "completed" &&
      (tagId ? t.tagId === tagId : t.categoryId === categoryId && !t.tagId),
  ).length
}

function pruneChains(chains: Chain[], tasks: Task[]): Chain[] {
  return chains.filter((c) => tasks.some((t) => t.chainId === c.id))
}

export const useTasksStore = create<State>()(
  persist(
    (set) => ({
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
          const before = doneCountInBucket(s.tasks, task.categoryId, task.tagId)
          const after = before + [...completeIds].filter((cid) => {
            const t = s.tasks.find((x) => x.id === cid)
            return t && (task.tagId ? t.tagId === task.tagId : t.categoryId === task.categoryId && !t.tagId)
          }).length
          const leveledUp = Math.floor(after / 3) > Math.floor(before / 3)

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
          if (!parent) return {}
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
        set((s) => ({
          tasks: s.tasks.map((t) =>
            childIds.includes(t.id) && t.id !== parentId && !t.parentId
              ? { ...t, parentId }
              : t,
          ),
        })),

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
          return {
            chains: [...s.chains, { id: chainId, title: title.trim() }],
            tasks: [
              ...newTasks,
              ...s.tasks.map((t) => (patched.has(t.id) ? { ...t, ...patched.get(t.id) } : t)),
            ],
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

      setView: (v) => set({ view: v, drilldownCategoryId: null }),
      openDrilldown: (categoryId) => set({ view: "projects", drilldownCategoryId: categoryId }),
      setAIOpen: (open) => set({ aiOpen: open }),
      clearAward: () => set({ lastAward: null }),
    }),
    {
      name: "sidra-tasks-v1",
      partialize: (s) => ({
        tasks: s.tasks,
        categories: s.categories,
        tags: s.tags,
        chains: s.chains,
        weights: s.weights,
      }),
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

// The "today" list: top-level tasks only (children render nested under their
// parent), and for chains only the current actionable step surfaces.
export function selectTodayList(s: Pick<State, "tasks" | "weights">): Task[] {
  return selectSortedActive(s).filter((t) => {
    if (t.parentId) return false
    if (t.chainId && isChainLocked(t, s.tasks)) return false
    return true
  })
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

export function levelFor(count: number): number {
  return Math.floor(count / 3) + 1
}

export function progressInLevel(count: number): number {
  return ((count % 3) / 3) * 100
}
