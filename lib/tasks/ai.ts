import { z } from "zod"

const prioritySchema = z.enum(["urgent", "high", "medium", "low"])
const sizeSchema = z.enum(["short", "medium", "long"])

export const aiActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("create_task"),
    title: z.string().min(1).max(120),
    priority: prioritySchema.default("medium"),
    size: sizeSchema.default("short"),
    categoryId: z.string(),
    tagId: z.string().optional(),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    // Log work that already happened (e.g. calendar events that took place):
    // the task is created directly in completed state and earns its XP.
    completed: z.boolean().optional(),
  }),
  z.object({ type: z.literal("complete_task"), taskId: z.string() }),
  z.object({ type: z.literal("reopen_task"), taskId: z.string() }),
  z.object({
    type: z.literal("update_task"),
    taskId: z.string(),
    patch: z.object({
      title: z.string().max(120).optional(),
      priority: prioritySchema.optional(),
      size: sizeSchema.optional(),
      status: z.enum(["not_started", "in_progress", "blocked"]).optional(),
      dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
      snoozedUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
      categoryId: z.string().optional(),
      tagId: z.string().nullable().optional(),
    }),
  }),
  z.object({ type: z.literal("delete_task"), taskId: z.string() }),
  z.object({ type: z.literal("boost_task"), taskId: z.string() }),
  z.object({ type: z.literal("show_top"), taskIds: z.array(z.string()).max(6) }),
  // Branch: split an existing task into sub-tasks (completing all completes the parent).
  z.object({
    type: z.literal("branch_task"),
    taskId: z.string(),
    subtitles: z.array(z.string().min(1).max(120)).min(1).max(10),
  }),
  // Attach existing standalone tasks as sub-tasks of a parent.
  z.object({
    type: z.literal("attach_children"),
    parentId: z.string(),
    childIds: z.array(z.string()).min(1).max(10),
  }),
  // Chain: an ordered step-by-step plan. Steps unlock one at a time.
  z.object({
    type: z.literal("create_chain"),
    title: z.string().min(1).max(80),
    steps: z
      .array(
        z.object({
          existingId: z.string().optional(),
          title: z.string().max(120).optional(),
        }),
      )
      .min(2)
      .max(12),
    categoryId: z.string(),
    tagId: z.string().optional(),
    priority: prioritySchema.default("medium"),
  }),
])

export const aiResponseSchema = z.object({
  reply: z.string().max(2400),
  // Generous cap: bulk calendar operations legitimately touch many tasks.
  actions: z.array(aiActionSchema).max(24).default([]),
})

export type AIAction = z.infer<typeof aiActionSchema>
export type AIResponse = z.infer<typeof aiResponseSchema>

export type AIStatePayload = {
  today: string
  categories: { id: string; name: string }[]
  tags: { id: string; name: string; categoryId: string }[]
  chains: { id: string; title: string }[]
  tasks: {
    id: string
    title: string
    priority: string
    size: string
    status: string
    categoryId: string
    tagId?: string
    dueDate?: string
    createdAt?: string
    completedAt?: string
    parentId?: string
    chainId?: string
    chainOrder?: number
    score: number
  }[]
}

export type CalendarPayload = {
  connected: boolean
  events?: { title: string; date: string; time?: string; allDay?: boolean }[]
}

export type AIRequestBody = {
  messages: { role: "user" | "assistant"; content: string }[]
  state: AIStatePayload
  mode?: "chat" | "analyze"
  calendar?: CalendarPayload
}
