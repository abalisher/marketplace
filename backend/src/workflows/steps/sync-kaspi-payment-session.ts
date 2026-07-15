import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { settleKaspiPaymentSession } from "../utils/settle-kaspi-payment-session"

export type SyncKaspiPaymentSessionStepInput = {
  payment_session_id: string
}

// Синхронизация Kaspi-сессии с состоянием инвойса (polling): пока сессия
// pending — попытка авторизации (провайдер опрашивает Kaspi); оплачено →
// сессия authorized + Payment ядра, не оплачено → остаётся pending. Отката
// нет: подтверждение факта оплаты необратимо по смыслу.
export const syncKaspiPaymentSessionStep = createStep(
  "sync-kaspi-payment-session",
  async (input: SyncKaspiPaymentSessionStepInput, { container }) => {
    const paymentService = container.resolve(Modules.PAYMENT)
    const session = await settleKaspiPaymentSession(
      paymentService,
      input.payment_session_id
    )

    return new StepResponse({
      id: session.id,
      status: session.status as string,
      data: (session.data ?? {}) as Record<string, unknown>,
    })
  }
)
