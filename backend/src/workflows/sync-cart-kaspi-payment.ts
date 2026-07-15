import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { syncKaspiPaymentSessionStep } from "./steps/sync-kaspi-payment-session"

export type SyncCartKaspiPaymentWorkflowInput = {
  payment_session_id: string
}

// Опрос статуса оплаты Kaspi (polling клиентом): синхронизирует сессию с
// инвойсом — оплаченная сессия становится authorized (и получает Payment
// ядра), неоплаченная остаётся pending. Второй путь подтверждения — ядровый
// webhook /hooks/payment/kaspi (живой разбор — подзадача 3).
export const syncCartKaspiPaymentWorkflow = createWorkflow(
  "sync-cart-kaspi-payment",
  (input: WorkflowData<SyncCartKaspiPaymentWorkflowInput>) => {
    const session = syncKaspiPaymentSessionStep({
      payment_session_id: input.payment_session_id,
    })

    return new WorkflowResponse(session)
  }
)
