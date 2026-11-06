import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  orderPaymentStatus,
  roundMoney,
} from "../../../lib/payments/order-payment-state"
import {
  factsOf,
  OrderPaymentRow,
  resolveOrderPaymentService,
} from "./order-payment-row"

export type CancelOrderPaymentStepInput = {
  order_id: string
}

// Заказ отменён: долг снимается, а полученные деньги нужно вернуть.
// - Kaspi QR — возврат делает ядро при отмене (refund провайдера Kaspi), он
//   сразу пишется в журнал как возврат системой.
// - Перевод и погашения долга продавец получил сам — и вернуть их должен сам:
//   оплата уходит в «Нужно вернуть», пока продавец не отметит возврат.
// Повторная отмена ничего не меняет (подписчик ядра срабатывает и на нашу
// собственную отмену).
export const cancelOrderPaymentStep = createStep(
  "cancel-order-payment",
  async (input: CancelOrderPaymentStepInput, { container }) => {
    const service = resolveOrderPaymentService(container)
    const [found] = await service.listOrderPayments(
      { order_id: input.order_id },
      { take: 1 }
    )
    const row = found as unknown as OrderPaymentRow | undefined
    if (!row || row.canceled_at) {
      return new StepResponse({ status: row?.status ?? null }, null)
    }

    const facts = { ...factsOf(row), canceled: true }
    const autoRefund =
      row.method === "kaspi_qr"
        ? roundMoney(facts.paid_amount - facts.refunded_amount)
        : 0
    const next = {
      ...facts,
      refunded_amount: roundMoney(facts.refunded_amount + Math.max(autoRefund, 0)),
    }

    let entryId: string | null = null
    if (autoRefund > 0) {
      const entry = await service.createPaymentEntries({
        order_payment_id: row.id,
        kind: "refund",
        channel: "kaspi_qr",
        amount: autoRefund,
        sales_channel_id: row.sales_channel_id,
        actor_type: "system",
        actor_id: null,
        note: "Возврат Kaspi при отмене заказа",
        occurred_at: new Date(),
      })
      entryId = entry.id
    }
    const status = orderPaymentStatus(next)
    await service.updateOrderPayments({
      id: row.id,
      canceled_at: new Date(),
      refunded_amount: next.refunded_amount,
      status,
    })

    return new StepResponse(
      { status },
      {
        id: row.id,
        status: row.status,
        refunded_amount: facts.refunded_amount,
        entry_id: entryId,
      }
    )
  },
  async (previous, { container }) => {
    if (!previous) {
      return
    }
    const service = resolveOrderPaymentService(container)
    if (previous.entry_id) {
      await service.deletePaymentEntries(previous.entry_id)
    }
    await service.updateOrderPayments({
      id: previous.id,
      canceled_at: null,
      refunded_amount: previous.refunded_amount,
      status: previous.status,
    })
  }
)
