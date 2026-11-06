import {
  createWorkflow,
  transform,
  when,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { StatusActorType } from "../modules/order-lifecycle/models/statuses"
import { emitEventStep } from "@medusajs/medusa/core-flows"
import { ORDER_PAYMENT_DEBT_APPROVED_EVENT } from "../lib/payments/events"
import { applyOrderTransition } from "./apply-order-transition"
import { settleOrderPaymentOnConfirmStep } from "./payments/steps/settle-order-payment-on-confirm"

export type ConfirmOrderWorkflowInput = {
  order_id: string
  actor_type: StatusActorType
  actor_id?: string | null
  reason?: string | null
  // Срок погашения, если заказ «в долг» (подтверждение — одобрение долга).
  debt_due_date?: string | null
}

// Менеджер подтверждает заявку: new → confirmed. Этап ТЗ, которого нет в ядре
// (ядровый workflow не вызывается). Сначала — оплата: заказ по переводу без
// полученных денег не подтверждается, заказ «в долг» подтверждением одобряется
// (срок погашения — из запроса или настроек продавца).
export const confirmOrderWorkflow = createWorkflow(
  "confirm-order",
  (input: WorkflowData<ConfirmOrderWorkflowInput>) => {
    const settled = settleOrderPaymentOnConfirmStep({
      order_id: input.order_id,
      actor_id: input.actor_id,
      debt_due_date: input.debt_due_date,
    })

    const result = applyOrderTransition({
      order_id: input.order_id,
      to: "confirmed",
      actor_type: input.actor_type,
      actor_id: input.actor_id,
      reason: input.reason,
    })

    // Долг одобрен — в счёте появляется срок возврата.
    when("debt-approved", { settled }, ({ settled }) => settled.approved).then(() => {
      emitEventStep({
        eventName: ORDER_PAYMENT_DEBT_APPROVED_EVENT,
        data: transform({ input }, (d) => ({ order_id: d.input.order_id })),
      }).config({ name: "emit-debt-approved" })
    })

    return new WorkflowResponse(result)
  }
)
