import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { startAssemblyTaskStep } from "./steps/start-assembly-task"

export type StartAssemblyTaskWorkflowInput = {
  task_id: string
  actor_id?: string | null
}

// Сборщик взял задание своей категории: pending → picking. Жизненный цикл
// заказа здесь не трогаем — он догоняет факт сборки один раз, когда закрыто
// последнее задание (ensure-order-assembling в complete-assembly-task).
export const startAssemblyTaskWorkflow = createWorkflow(
  "start-assembly-task",
  (input: WorkflowData<StartAssemblyTaskWorkflowInput>) => {
    const result = startAssemblyTaskStep(input)

    return new WorkflowResponse(result)
  }
)
