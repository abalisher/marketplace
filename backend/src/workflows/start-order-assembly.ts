import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { StatusActorType } from "../modules/order-lifecycle/models/statuses"
import { applyOrderTransition } from "./apply-order-transition"

export type StartOrderAssemblyWorkflowInput = {
  order_id: string
  actor_type: StatusActorType
  actor_id?: string | null
  reason?: string | null
}

// Кладовщик начал комплектацию: confirmed → assembling. Этап ТЗ, которого нет
// в ядре (сама сборка — createOrderFulfillment в complete-order-assembly).
export const startOrderAssemblyWorkflow = createWorkflow(
  "start-order-assembly",
  (input: WorkflowData<StartOrderAssemblyWorkflowInput>) => {
    const result = applyOrderTransition({
      order_id: input.order_id,
      to: "assembling",
      actor_type: input.actor_type,
      actor_id: input.actor_id,
      reason: input.reason,
    })

    return new WorkflowResponse(result)
  }
)
