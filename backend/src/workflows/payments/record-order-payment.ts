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
import {
  recordOrderPaymentMovementStep,
  RecordOrderPaymentMovementStepInput,
} from "./steps/record-order-payment-movement"

export type RecordOrderPaymentWorkflowInput = RecordOrderPaymentMovementStepInput

// Продавец отмечает движение денег по заказу: перевод получен, долг погашен
// (полностью или частью) или деньги возвращены покупателю. Поступление
// списывает платёж ядра на ту же сумму.
export const recordOrderPaymentWorkflow = createWorkflow(
  "record-order-payment",
  (input: WorkflowData<RecordOrderPaymentWorkflowInput>) => {
    const result = recordOrderPaymentMovementStep(input)

    when("payment-received", { input }, ({ input }) => input.kind === "payment").then(
      () => {
        captureCorePaymentStep(
          transform({ input, result }, (d) => ({
            order_id: d.input.order_id,
            amount: d.input.amount,
          }))
        )
      }
    )

    // Получено всё — счёт перевыпускается со штампом «Оплачено».
    when("payment-completed", { input, result }, ({ input, result }) =>
      input.kind === "payment" && result.status === "paid"
    ).then(() => {
      emitEventStep({
        eventName: ORDER_PAYMENT_PAID_EVENT,
        data: transform({ input }, (d) => ({ order_id: d.input.order_id })),
      }).config({ name: "emit-order-payment-paid" })
    })

    return new WorkflowResponse(result)
  }
)
