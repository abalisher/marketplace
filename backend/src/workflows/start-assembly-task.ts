import {
  createWorkflow,
  transform,
  when,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { applyOrderTransition } from "./apply-order-transition"
import { checkOrderReadyForAssemblyStep } from "./steps/check-order-ready-for-assembly"
import { startAssemblyTaskStep } from "./steps/start-assembly-task"

export type StartAssemblyTaskWorkflowInput = {
  task_id: string
  actor_id?: string | null
}

// Сборщик взял задание своей категории: pending → picking. Брать можно только
// задание подтверждённого заказа; первое взятое задание переводит заказ из
// «Подтверждён» в «Собирается» — покупатель и продавец видят, что сборка пошла.
// Итог сборки заказ догоняет, когда закрыто последнее задание
// (complete-assembly-task).
export const startAssemblyTaskWorkflow = createWorkflow(
  "start-assembly-task",
  (input: WorkflowData<StartAssemblyTaskWorkflowInput>) => {
    const order = checkOrderReadyForAssemblyStep({ task_id: input.task_id })

    const result = startAssemblyTaskStep(input)

    when("order-awaits-assembly", { order }, ({ order }) =>
      order.status === "confirmed"
    ).then(() =>
      applyOrderTransition(
        transform({ input, order }, (d) => ({
          order_id: d.order.order_id,
          to: "assembling" as const,
          actor_type: "seller" as const,
          actor_id: d.input.actor_id,
        }))
      )
    )

    return new WorkflowResponse(result)
  }
)
