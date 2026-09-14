import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  capturePendingPayments,
  findPendingCaptures,
} from "../../lib/payments/pending-captures"

export type CaptureOrderPaymentStepInput = {
  order_id: string
}

// Списание сразу после оформления (T4.14). При оплате Kaspi QR авторизация И
// ЕСТЬ оплата: покупатель уже перевёл деньги, а ядро без capture продолжает
// считать заказ неоплаченным — очередь показывала «Оплачен», а ядровая
// страница того же заказа «Остаток к оплате ₸ 930 000» (Ф-прогон 2026-08-18).
// Кнопку «Получить платеж» продавец нажимать не должен: подтверждать оплату,
// которую он не проводил, — это второй управляющий слой поверх нашего цикла.
//
// Шаг НЕ компенсируется и НЕ роняет оформление: деньги уже у эквайера,
// откатывать заказ из-за неудавшегося подтверждения нельзя (та же причина, по
// которой не компенсируется ядровый capturePaymentStep). Оставшиеся
// несписанными платежи находит и дожимает `check-order-captures`.
export const captureOrderPaymentStep = createStep(
  "capture-order-payment",
  async (input: CaptureOrderPaymentStepInput, { container }) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

    let pending: Awaited<ReturnType<typeof findPendingCaptures>> = []
    try {
      pending = await findPendingCaptures(container, input.order_id)
    } catch (e) {
      // Даже упавшая ВЫБОРКА платежей не должна ронять оформление: заказ уже
      // создан, а деньги уже у эквайера.
      logger.error(
        `[order] cannot list payments to capture for order ${input.order_id}: ${(e as Error).message}`
      )
      return new StepResponse({ captured: [], failed: [] })
    }

    const outcomes = await capturePendingPayments(container, pending)

    for (const { capture, error } of outcomes) {
      if (error) {
        logger.error(
          `[order] capture failed for payment ${capture.payment_id} of order ${capture.order_id}: ${error}`
        )
      } else {
        logger.info(
          `[order] payment ${capture.payment_id} captured for order ${capture.order_id}`
        )
      }
    }

    return new StepResponse({
      captured: outcomes.filter((o) => !o.error).map((o) => o.capture.payment_id),
      failed: outcomes.filter((o) => !!o.error).map((o) => o.capture.payment_id),
    })
  }
)
