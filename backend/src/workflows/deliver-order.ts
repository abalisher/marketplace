import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { markOrderFulfillmentAsDeliveredWorkflow } from "@medusajs/medusa/core-flows"
import { StatusActorType } from "../modules/order-lifecycle/models/statuses"
import { applyOrderTransition } from "./apply-order-transition"

export type DeliverOrderWorkflowInput = {
  order_id: string
  fulfillment_id: string
  actor_type: StatusActorType
  actor_id?: string | null
  // Код получения от покупателя — обязателен для способа delivery
  // («передан по коду» — способ подтвердить delivered, не статус);
  // pickup подтверждается накладной, код не нужен.
  delivery_code?: string | null
}

// Вручение заказа: наш переход → delivered идёт ПЕРВЫМ — он проверяет
// инвариант приёмки (код получения для delivery; для pickup — переход
// assembled → delivered без кода) и умеет компенсироваться. Затем ядровый
// markOrderFulfillmentAsDelivered фиксирует физику (fulfillment → delivered);
// его сбой откатывает наш переход, событие status_changed не эмитится.
export const deliverOrderWorkflow = createWorkflow(
  "deliver-order",
  (input: WorkflowData<DeliverOrderWorkflowInput>) => {
    const result = applyOrderTransition({
      order_id: input.order_id,
      to: "delivered",
      actor_type: input.actor_type,
      actor_id: input.actor_id,
      delivery_code: input.delivery_code,
    })

    markOrderFulfillmentAsDeliveredWorkflow.runAsStep({
      input: {
        orderId: input.order_id,
        fulfillmentId: input.fulfillment_id,
      },
    })

    return new WorkflowResponse(result)
  }
)
