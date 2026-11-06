import {
  createWorkflow,
  transform,
  when,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "@medusajs/medusa/core-flows"
import { ORDER_PAYMENT_METHOD_CHANGED_EVENT } from "../../lib/payments/events"
import {
  changeOrderPaymentMethodStep,
  ChangeOrderPaymentMethodStepInput,
} from "./steps/change-order-payment-method"

export { ORDER_PAYMENT_METHOD_CHANGED_EVENT }

// Покупатель сменил способ оплаты оформленного заказа (см. шаг). Событие —
// перевыпуск счёта: в нём напечатано, как платить (subscribers/order-payment-
// method-changed.ts).
export const changeOrderPaymentMethodWorkflow = createWorkflow(
  "change-order-payment-method",
  (input: WorkflowData<ChangeOrderPaymentMethodStepInput>) => {
    const result = changeOrderPaymentMethodStep(input)
    when("payment-method-changed", { result }, ({ result }) => result.changed).then(() => {
      emitEventStep({
        eventName: ORDER_PAYMENT_METHOD_CHANGED_EVENT,
        data: transform({ input }, (d) => ({ order_id: d.input.order_id })),
      })
    })
    return new WorkflowResponse(result)
  }
)
