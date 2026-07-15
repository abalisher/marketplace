import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { StatusActorType } from "../modules/order-lifecycle/models/statuses"
import { applyOrderTransition } from "./apply-order-transition"

export type ConfirmOrderWorkflowInput = {
  order_id: string
  actor_type: StatusActorType
  actor_id?: string | null
  reason?: string | null
}

// Менеджер подтверждает заявку: new → confirmed. Этап ТЗ, которого нет в ядре
// (чистый статус, ядровый workflow не вызывается).
export const confirmOrderWorkflow = createWorkflow(
  "confirm-order",
  (input: WorkflowData<ConfirmOrderWorkflowInput>) => {
    const result = applyOrderTransition({
      order_id: input.order_id,
      to: "confirmed",
      actor_type: input.actor_type,
      actor_id: input.actor_id,
      reason: input.reason,
    })

    return new WorkflowResponse(result)
  }
)
