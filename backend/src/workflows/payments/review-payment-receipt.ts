import {
  createWorkflow,
  transform,
  when,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "@medusajs/medusa/core-flows"
import { ORDER_PAYMENT_PAID_EVENT } from "../../lib/payments/events"
import { captureCorePaymentStep } from "./steps/capture-core-payment"
import { recordOrderPaymentMovementStep } from "./steps/record-order-payment-movement"
import {
  finishReceiptReviewStep,
  prepareReceiptReviewStep,
} from "./steps/review-payment-receipt"

export type ReviewPaymentReceiptWorkflowInput = {
  receipt_id: string
  decision: "accept" | "reject"
  amount?: number | null
  note?: string | null
  actor_type: "seller" | "admin"
  actor_id: string | null
}

// Продавец решил по чеку покупателя: засчитать — поступление в журнал
// (перевод Kaspi, сумма из чека или поправленная) и списание платежа ядра;
// отклонить — чек помечается отклонённым с причиной. Деньги заказа — только
// через засчитанный чек, сам чек их не двигает.
export const reviewPaymentReceiptWorkflow = createWorkflow(
  "review-payment-receipt",
  (input: WorkflowData<ReviewPaymentReceiptWorkflowInput>) => {
    const review = prepareReceiptReviewStep(
      transform({ input }, (d) => ({
        receipt_id: d.input.receipt_id,
        decision: d.input.decision,
        amount: d.input.amount,
      }))
    )

    const movement = when("receipt-accepted", { review }, ({ review }) => review.accept).then(
      () => {
        const recorded = recordOrderPaymentMovementStep(
          transform({ input, review }, (d) => ({
            order_id: d.review.order_id,
            kind: "payment" as const,
            channel: d.review.channel,
            amount: d.review.amount,
            note: [d.review.note, d.input.note?.trim()].filter(Boolean).join(" · "),
            actor_type: d.input.actor_type,
            actor_id: d.input.actor_id,
          }))
        )
        captureCorePaymentStep(
          transform({ review }, (d) => ({ order_id: d.review.order_id, amount: d.review.amount }))
        ).config({ name: "capture-receipt-payment" })
        return recorded
      }
    )

    const result = finishReceiptReviewStep(
      transform({ input, review, movement }, (d) => ({
        receipt_id: d.input.receipt_id,
        accept: d.review.accept,
        entry_id: d.movement?.entry_id ?? null,
        actor_id: d.input.actor_id,
        note: d.input.note ?? null,
      }))
    )

    when("receipt-paid-order", { movement }, ({ movement }) => movement?.status === "paid").then(
      () => {
        emitEventStep({
          eventName: ORDER_PAYMENT_PAID_EVENT,
          data: transform({ review }, (d) => ({ order_id: d.review.order_id })),
        }).config({ name: "emit-receipt-order-paid" })
      }
    )

    return new WorkflowResponse(result)
  }
)
