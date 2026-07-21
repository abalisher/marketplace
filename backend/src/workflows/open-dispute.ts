import {
  createWorkflow,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "@medusajs/medusa/core-flows"
import { DISPUTE_OPENED_EVENT } from "../modules/reviews/events"
import { DisputeCategory } from "../modules/reviews/models/constants"
import { requireOwnOrderStep } from "./steps/require-own-order"
import { openDisputeStep } from "./steps/open-dispute"

export type OpenDisputeWorkflowInput = {
  order_id: string
  customer_id: string
  category: DisputeCategory
  description: string
}

// Открытие диспута покупателем по своему заказу (проблему можно заявить на любой
// свой заказ, в т.ч. до доставки): гейт принадлежности → создание (блок второго
// активного в сервисе) → событие dispute.opened.
export const openDisputeWorkflow = createWorkflow(
  "open-dispute",
  (input: WorkflowData<OpenDisputeWorkflowInput>) => {
    const ownership = requireOwnOrderStep({
      order_id: input.order_id,
      customer_id: input.customer_id,
    })

    const dispute = openDisputeStep(
      transform({ input, ownership }, (d) => ({
        order_id: d.input.order_id,
        customer_id: d.input.customer_id,
        category: d.input.category,
        description: d.input.description,
      }))
    )

    emitEventStep({
      eventName: DISPUTE_OPENED_EVENT,
      data: transform({ dispute }, (d) => ({
        dispute_id: d.dispute.id,
        order_id: d.dispute.order_id,
        category: d.dispute.category,
      })),
    })

    return new WorkflowResponse(dispute)
  }
)
