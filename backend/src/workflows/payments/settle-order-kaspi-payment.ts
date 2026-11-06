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
import { settleOrderKaspiPaymentStep } from "./steps/settle-order-kaspi-payment"

export type SettleOrderKaspiPaymentWorkflowInput = {
  order_id: string
}

// Опрос счёта Kaspi оформленного заказа: оплачен — поступление в журнал
// (система, Kaspi QR) и списание платежа Kaspi в ядре; заказ оплачен.
export const settleOrderKaspiPaymentWorkflow = createWorkflow(
  "settle-order-kaspi-payment",
  (input: WorkflowData<SettleOrderKaspiPaymentWorkflowInput>) => {
    const settled = settleOrderKaspiPaymentStep(input)

    when("order-kaspi-paid", { settled }, ({ settled }) => settled.paid).then(() => {
      recordOrderPaymentMovementStep(
        transform({ input, settled }, (d) => ({
          order_id: d.input.order_id,
          kind: "payment" as const,
          channel: "kaspi_qr" as const,
          amount: d.settled.amount,
          actor_type: "system" as const,
          note: "Оплата счёта Kaspi по заказу",
        }))
      )
      captureCorePaymentStep(
        transform({ input, settled }, (d) => ({
          order_id: d.input.order_id,
          amount: d.settled.amount,
        }))
      ).config({ name: "capture-order-kaspi-payment" })
      emitEventStep({
        eventName: ORDER_PAYMENT_PAID_EVENT,
        data: transform({ input }, (d) => ({ order_id: d.input.order_id })),
      }).config({ name: "emit-order-kaspi-paid" })
    })

    return new WorkflowResponse(settled)
  }
)
