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
}

// Доставка: ядровый markOrderFulfillmentAsDelivered (fulfillment → delivered),
// наш статус → delivered. Дальше — окно возврата, затем закрытие (close-order).
export const deliverOrderWorkflow = createWorkflow(
  "deliver-order",
  (input: WorkflowData<DeliverOrderWorkflowInput>) => {
    markOrderFulfillmentAsDeliveredWorkflow.runAsStep({
      input: {
        orderId: input.order_id,
        fulfillmentId: input.fulfillment_id,
      },
    })

    const result = applyOrderTransition({
      order_id: input.order_id,
      to: "delivered",
      actor_type: input.actor_type,
      actor_id: input.actor_id,
    })

    return new WorkflowResponse(result)
  }
)
