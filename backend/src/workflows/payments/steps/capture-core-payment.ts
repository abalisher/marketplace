import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { capturePaymentWorkflow } from "@medusajs/medusa/core-flows"
import { numericAmount } from "../../../lib/payments/amount"
import { roundMoney } from "../../../lib/payments/order-payment-state"

export type CaptureCorePaymentStepInput = {
  order_id: string
  amount: number
}

type PaymentRow = {
  id: string
  amount?: unknown
  canceled_at?: string | Date | null
  captures?: { amount?: unknown }[] | null
}

// Поступление, отмеченное продавцом, — списание платежа ядра на ту же сумму:
// ядро перестаёт показывать «остаток к оплате», а заказ — «не оплачен».
// Шаг НЕ роняет отметку и НЕ компенсируется (идиома capture-order-payment):
// деньги уже у продавца, журнал — источник правды; расхождение с ядром видно
// в логе.
export const captureCorePaymentStep = createStep(
  "capture-core-payment",
  async (input: CaptureCorePaymentStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    let left = roundMoney(input.amount)
    const captured: string[] = []

    try {
      const { data } = await query.graph({
        entity: "order",
        fields: [
          "id",
          "payment_collections.payments.id",
          "payment_collections.payments.amount",
          "payment_collections.payments.canceled_at",
          "payment_collections.payments.captures.amount",
        ],
        filters: { id: input.order_id },
      })
      const payments = (
        (data[0] as { payment_collections?: { payments?: PaymentRow[] | null }[] | null })
          ?.payment_collections ?? []
      ).flatMap((collection) => collection.payments ?? [])

      for (const payment of payments) {
        if (left <= 0 || payment.canceled_at) {
          continue
        }
        const already = (payment.captures ?? []).reduce(
          (sum, capture) => sum + (numericAmount(capture.amount) ?? 0),
          0
        )
        const room = roundMoney((numericAmount(payment.amount) ?? 0) - already)
        const amount = Math.min(room, left)
        if (amount <= 0) {
          continue
        }
        await capturePaymentWorkflow(container).run({
          input: { payment_id: payment.id, amount },
        })
        captured.push(payment.id)
        left = roundMoney(left - amount)
      }
    } catch (e) {
      logger.error(
        `[payments] core capture failed for order ${input.order_id}: ${(e as Error).message}`
      )
    }

    return new StepResponse({ captured })
  }
)
