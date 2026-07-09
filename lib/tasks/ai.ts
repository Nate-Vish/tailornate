import { z } from "zod"

export const aiActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("create_task"),
    title: z.string().min(1).max(120),
    priority: z.enum(["urgent", "high", "medium", "low"]).default("medium"),
    size: z.enum(["short", "medium", "long"]).default("short"),
    categoryId: z.string(),
    tagId: z.string().optional(),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  }),
  z.object({ type: z.literal("complete_task"), taskId: z.string() }),
  z.object({
    type: z.literal("update_task"),
    taskId: z.string(),
    patch: z.object({
      title: z.string().max(120).optional(),
      priority: z.enum(["urgent", "high", "medium", "low"]).optional(),
      size: z.enum(["short", "medium", "long"]).optional(),
      status: z.enum(["not_started", "in_progress", "blocked"]).optional(),
      dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
      categoryId: z.string().optional(),
      tagId: z.string().nullable().optional(),
    }),
  }),
  z.object({ type: z.literal("delete_task"), taskId: z.string() }),
  z.object({ type: z.literal("boost_task"), taskId: z.string() }),
  z.object({ type: z.literal("show_top"), taskIds: z.array(z.string()).max(6) }),
])

export const aiResponseSchema = z.object({
  reply: z.string().max(600),
  actions: z.array(aiActionSchema).max(8).default([]),
})

export type AIAction = z.infer<typeof aiActionSchema>
export type AIResponse = z.infer<typeof aiResponseSchema>

export type AIStatePayload = {
  today: string
  categories: { id: string; name: string }[]
  tags: { id: string; name: string; categoryId: string }[]
  tasks: {
    id: string
    title: string
    priority: string
    size: string
    status: string
    categoryId: string
    tagId?: string
    dueDate?: string
    score: number
  }[]
}

export type AIRequestBody = {
  messages: { role: "user" | "assistant"; content: string }[]
  state: AIStatePayload
}
