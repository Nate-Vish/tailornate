import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { BoostMode, Category, Status, Tag, Task, ViewName, Weights } from "./types"
import { defaultWeights, seedCategories, seedTags, seedTasks } from "./seed"
import { calcScore } from "./scoring"

export type Award = {
  xp: number
  tagId?: string
  categoryId: string
  leveledUp: boolean
  taskTitle: string
}

type State = {
  tasks: Task[]
  categories: Category[]
  tags: Tag[]
  weights: Weights
  view: ViewName
  drilldownCategoryId: string | null
  aiOpen: boolean
  lastAward: Award | null
  addTask: (task: Omit<Task, "id" | "createdAt">) => Task
  updateTask: (id: string, patch: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleComplete: (id: string) => void
  setWeights: (w: Weights) => void
  resetWeights: () => void
  boostTask: (id: string, mode: BoostMode, minScore: number) => void
  clearBoost: (id: string) => void
  setView: (v: ViewName) => void
  openDrilldown: (categoryId: string) => void
  setAIOpen: (open: boolean) => void
  clearAward: () => void
}

const uid = () => `t_${Math.random().toString(36).slice(2, 10)}`

function taskXP(task: Task): number {
  const sizeXP = task.size === "short" ? 10 : task.size === "medium" ? 25 : 50
  const priorityBonus = task.priority === "urgent" ? 15 : task.priority === "high" ? 8 : 0
  return sizeXP + priorityBonus
}

export const useTasksStore = create<State>()(
  persist(
    (set) => ({
      tasks: seedTasks,
      categories: seedCategories,
      tags: seedTags,
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

      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      toggleComplete: (id) =>
        set((s) => {
          const task = s.tasks.find((t) => t.id === id)
          if (!task) return {}
          if (task.status === "completed") {
            return {
              tasks: s.tasks.map((t) =>
                t.id === id ? { ...t, status: "not_started" as Status, completedAt: undefined } : t,
              ),
            }
          }
          const doneBefore = s.tasks.filter(
            (t) =>
              t.status === "completed" &&
              (task.tagId ? t.tagId === task.tagId : t.categoryId === task.categoryId && !t.tagId),
          ).length
          const leveledUp = Math.floor((doneBefore + 1) / 3) > Math.floor(doneBefore / 3)
          return {
            tasks: s.tasks.map((t) =>
              t.id === id
                ? { ...t, status: "completed" as Status, completedAt: new Date().toISOString(), boost: null }
                : t,
            ),
            lastAward: {
              xp: taskXP(task),
              tagId: task.tagId,
              categoryId: task.categoryId,
              leveledUp,
              taskTitle: task.title,
            },
          }
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
