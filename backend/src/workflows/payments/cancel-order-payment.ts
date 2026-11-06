import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { cancelOrderPaymentStep } from "./steps/cancel-order-payment"

export type CancelOrderPaymentWorkflowInput = {
  order_id: string
}

// Оплата отменённого заказа: долг снят, полученное — к возврату (см. шаг).
// Вызывается подписчиком ядрового order.canceled — так и отмена из панели
// (cancel-order-lifecycle вызывает ядровую отмену), и отмена мимо неё.
export const cancelOrderPaymentWorkflow = createWorkflow(
  "cancel-order-payment",
  (input: WorkflowData<CancelOrderPaymentWorkflowInput>) => {
    const result = cancelOrderPaymentStep(input)
    return new WorkflowResponse(result)
  }
)
