export type Priority = "urgent" | "high" | "medium" | "low"
export type Size = "short" | "medium" | "long"
export type Status = "not_started" | "in_progress" | "completed" | "blocked"
export type BoostMode = "today" | "until_done"

export type Category = {
  id: string
  name: string
  nameEn: string
  color: string
  icon: string
}

export type Tag = {
  id: string
  name: string
  categoryId: string
  color: string
  icon: string
}

export type Task = {
  id: string
  title: string
  notes?: string
  priority: Priority
  size: Size
  status: Status
  categoryId: string
  tagId?: string
  dueDate?: string
  createdAt: string
  completedAt?: string
  boost?: { mode: BoostMode; setAt: string; minScore: number } | null
}

export type Weights = {
  priority: number
  deadline: number
  status: number
  size: number
}

export type ViewName = "today" | "projects" | "squad" | "settings"
