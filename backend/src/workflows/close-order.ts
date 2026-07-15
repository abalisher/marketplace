import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { completeOrderWorkflow } from "@medusajs/medusa/core-flows"
import { StatusActorType } from "../modules/order-lifecycle/models/statuses"
import { applyOrderTransition } from "./apply-order-transition"

export type CloseOrderWorkflowInput = {
  order_id: string
  actor_type: StatusActorType
  actor_id?: string | null
}

// Закрытие заказа после окна возврата: ядровый completeOrder (order.status →
// completed), наш статус → closed. Обычно вызывается джобой по истечении окна
// возврата; событие order_lifecycle.status_changed (to=closed) — хук для
// начисления бонуса и пересчёта скоринга (модули появятся позже).
export const closeOrderWorkflow = createWorkflow(
  "close-order",
  (input: WorkflowData<CloseOrderWorkflowInput>) => {
    completeOrderWorkflow.runAsStep({
      input: { orderIds: [input.order_id] },
    })

    const result = applyOrderTransition({
      order_id: input.order_id,
      to: "closed",
      actor_type: input.actor_type,
      actor_id: input.actor_id,
    })

    return new WorkflowResponse(result)
  }
)
