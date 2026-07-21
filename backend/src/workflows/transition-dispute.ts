import {
  createWorkflow,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "@medusajs/medusa/core-flows"
import { DISPUTE_STATUS_CHANGED_EVENT } from "../modules/reviews/events"
import { DisputeStatus } from "../modules/reviews/models/constants"
import { transitionDisputeStep } from "./steps/transition-dispute"

export type TransitionDisputeWorkflowInput = {
  id: string
  to: DisputeStatus
  resolution?: string | null
}

// Ведение диспута оператором по стейт-машине (open→in_review→resolved|rejected):
// переход через сервис (с компенсацией) → событие dispute.status_changed.
export const transitionDisputeWorkflow = createWorkflow(
  "transition-dispute",
  (input: WorkflowData<TransitionDisputeWorkflowInput>) => {
    const result = transitionDisputeStep(input)

    emitEventStep({
      eventName: DISPUTE_STATUS_CHANGED_EVENT,
      data: transform({ result }, (d) => ({
        dispute_id: d.result.dispute.id,
        order_id: d.result.dispute.order_id,
        from: d.result.from,
        to: d.result.dispute.status,
      })),
    })

    return new WorkflowResponse(result.dispute)
  }
)
