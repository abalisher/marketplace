import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import {
  confirmBlock,
  defaultDueDate,
  orderPaymentStatus,
} from "../../../lib/payments/order-payment-state"
import { loadPaymentSettings } from "../../../lib/payments/settings"
import {
  factsOf,
  OrderPaymentRow,
  resolveOrderPaymentService,
} from "./order-payment-row"

export type SettleOrderPaymentOnConfirmStepInput = {
  order_id: string
  actor_id?: string | null
  // Срок долга, выбранный продавцом; нет — по умолчанию из его настроек.
  debt_due_date?: Date | string | null
}

// Оплата при подтверждении заказа (new → confirmed):
// - перевод не получен — подтверждать нельзя: заказ пошёл бы в сборку без
//   денег; продавец сначала отмечает поступление;
// - «в долг» — подтверждение и есть одобрение долга: ставится срок погашения и
//   кто одобрил. Отказать в долге — отменить заказ с причиной.
// Заказы без записи об оплате (оформлены раньше) подтверждаются как прежде.
export const settleOrderPaymentOnConfirmStep = createStep(
  "settle-order-payment-on-confirm",
  async (input: SettleOrderPaymentOnConfirmStepInput, { container }) => {
    const service = resolveOrderPaymentService(container)
    const [found] = await service.listOrderPayments(
      { order_id: input.order_id },
      { take: 1 }
    )
    const row = found as unknown as OrderPaymentRow | undefined
    if (!row) {
      return new StepResponse({ approved: false }, null)
    }

    const block = confirmBlock(row.method, row.status)
    if (block === "transfer_not_received") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Перевод по заказу ещё не получен. Отметьте поступление денег, потом подтверждайте заказ."
      )
    }
    if (block === "kaspi_not_paid") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Счёт Kaspi по заказу ещё не оплачен. Подтверждайте заказ после оплаты."
      )
    }

    if (row.method !== "debt" || row.status !== "debt_requested") {
      return new StepResponse({ approved: false }, null)
    }

    const now = new Date()
    let dueDate: Date
    if (input.debt_due_date) {
      dueDate = new Date(input.debt_due_date)
      if (Number.isNaN(dueDate.getTime()) || dueDate.getTime() < now.getTime() - 24 * 3_600_000) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Срок долга должен быть датой не раньше сегодняшней"
        )
      }
    } else {
      const settings = await loadPaymentSettings(container, row.sales_channel_id)
      dueDate = defaultDueDate(now, settings.debt_term_days)
    }

    const facts = { ...factsOf(row), approved: true }
    await service.updateOrderPayments({
      id: row.id,
      approved_at: now,
      approved_by: input.actor_id ?? null,
      due_date: dueDate,
      status: orderPaymentStatus(facts),
    })

    return new StepResponse(
      { approved: true, due_date: dueDate.toISOString() },
      { id: row.id, status: row.status }
    )
  },
  async (previous, { container }) => {
    if (!previous) {
      return
    }
    const service = resolveOrderPaymentService(container)
    await service.updateOrderPayments({
      id: previous.id,
      approved_at: null,
      approved_by: null,
      due_date: null,
      status: previous.status,
    })
  }
)
