"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useTasksStore } from "@/lib/tasks/store"
import { planDay, type DayPlan, type PlacedBlock, type PlanContext } from "@/lib/tasks/planner"
import { dayConcerns, type Concern } from "@/lib/tasks/guardian"

export type PlanState =
  | { ready: false }
  | { ready: true; plan: DayPlan; concerns: Concern[]; ctx: PlanContext; now: Date }

/**
 * Runs the planning engine over the current store.
 *
 * The clock lives here, not in the engine: `now` is state so the plan refreshes
 * every minute, and so the server render (which has no clock and no
 * localStorage) never disagrees with the client.
 *
 * The previous placement is fed back in, so a re-plan keeps the day stable
 * instead of reshuffling everything each time a task changes.
 */
export function usePlan(): PlanState {
  const tasks = useTasksStore((s) => s.tasks)
  const weights = useTasksStore((s) => s.weights)
  const [now, setNow] = useState<Date | null>(null)
  const previous = useRef<PlacedBlock[] | undefined>(undefined)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  return useMemo(() => {
    if (!now) return { ready: false }
    const ctx: PlanContext = { now, weights }
    const plan = planDay({ tasks, ctx, previous: previous.current })
    previous.current = plan.blocks
    return { ready: true, plan, concerns: dayConcerns(tasks, plan, ctx), ctx, now }
  }, [tasks, weights, now])
}
