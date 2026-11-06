import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  findAuthorizedOrderKaspiSession,
  findOpenOfflinePayments,
  findPendingOrderKaspiSession,
} from "../../../lib/payments/order-kaspi"
import { settleKaspiPaymentSession } from "../../utils/settle-kaspi-payment-session"
import {
  factsOf,
  OrderPaymentRow,
  resolveOrderPaymentService,
} from "./order-payment-row"

export type SettleOrderKaspiPaymentStepInput = {
  order_id: string
}

// Опрос счёта Kaspi, выставленного на оформленный заказ (покупатель сменил
// способ на Kaspi QR). Оплачен — «обещания» прежнего способа (авторизованные
// платежи перевода/долга) отменяются: денег по ним не будет, а списывать
// будем платёж Kaspi. Сам приход денег пишет следующий шаг workflow. Не
// оплачен — ничего не меняется (штатное состояние опроса). Отката нет: факт
// оплаты необратим.
export const settleOrderKaspiPaymentStep = createStep(
  "settle-order-kaspi-payment",
  async (input: SettleOrderKaspiPaymentStepInput, { container }) => {
    const service = resolveOrderPaymentService(container)
    const [found] = await service.listOrderPayments({ order_id: input.order_id }, { take: 1 })
    const row = found as unknown as OrderPaymentRow | undefined
    if (!row || row.method !== "kaspi_qr" || row.status !== "awaiting") {
      return new StepResponse({ paid: false, amount: 0 })
    }

    const paymentModule = container.resolve(Modules.PAYMENT)
    const pending = await findPendingOrderKaspiSession(container, input.order_id)
    let authorized = !!(await findAuthorizedOrderKaspiSession(container, input.order_id))
    if (!authorized && pending) {
      const settled = await settleKaspiPaymentSession(paymentModule, pending.id)
      authorized = settled.status === "authorized" || settled.status === "captured"
    }
    if (!authorized) {
      return new StepResponse({ paid: false, amount: 0 })
    }

    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    for (const paymentId of await findOpenOfflinePayments(container, input.order_id)) {
      try {
        await paymentModule.cancelPayment(paymentId)
      } catch (e) {
        logger.error(
          `[payments] cannot cancel offline payment ${paymentId} of order ${input.order_id}: ${(e as Error).message}`
        )
      }
    }

    return new StepResponse({ paid: true, amount: factsOf(row).amount })
  }
)
