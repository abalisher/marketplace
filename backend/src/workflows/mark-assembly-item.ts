import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { markAssemblyItemStep } from "./steps/mark-assembly-item"

export type MarkAssemblyItemWorkflowInput = {
  task_id: string
  item_id: string
  status: "picked" | "partial" | "missing"
  picked_quantity?: number | null
  actor_id?: string | null
  note?: string | null
}

// Отметка сборщика по позиции задания (набрано / частично / нет в наличии).
// Отдельный workflow, а не просто вызов сервиса: экран сборщика отмечает
// позиции по одной, и каждая отметка должна откатываться самостоятельно.
export const markAssemblyItemWorkflow = createWorkflow(
  "mark-assembly-item",
  (input: WorkflowData<MarkAssemblyItemWorkflowInput>) => {
    const result = markAssemblyItemStep(input)

    return new WorkflowResponse(result)
  }
)
