import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import type { SelectablePaymentMethod } from "../../../modules/order-payment/models/values"
import { kaspiStaticQrUrl, paymentMethodUnavailable } from "../../../lib/payments/methods"
import {
  findPendingOrderKaspiSession,
  issueOrderKaspiInvoice,
} from "../../../lib/payments/order-kaspi"
import {
  orderPaymentStatus,
  paymentChangeBlock,
} from "../../../lib/payments/order-payment-state"
import { loadPaymentSettings } from "../../../lib/payments/settings"
import {
  factsOf,
  requireOrderPayment,
  resolveOrderPaymentService,
} from "./order-payment-row"

export type ChangeOrderPaymentMethodStepInput = {
  order_id: string
  method: SelectablePaymentMethod
}

const BLOCK_MESSAGE: Record<string, string> = {
  confirmed: "Продавец уже подтвердил заказ — способ оплаты меняет только он",
  has_money: "По заказу уже есть оплата — способ оплаты не меняется",
  not_changeable: "У этого заказа способ оплаты не меняется",
}

// Покупатель меняет способ оплаты оформленного заказа (пока продавец его не
// подтвердил и денег не было):
// - перевод ↔ долг — меняется способ и состояние оплаты заказа; авторизованный
//   платёж ядра прежнего способа остаётся «обещанием» и спишется отметкой
//   продавца так же;
// - на Kaspi QR — на заказ выставляется счёт Kaspi (своя платёжная коллекция
//   заказа и Kaspi-сессия на продавца); оплатят — его спишет
//   settle-order-kaspi-payment, а «обещание» прежнего способа отменит;
// - с Kaspi QR на другой способ — неоплаченный счёт отменяется.
// Компенсация возвращает способ и состояние; выставленный счёт Kaspi остаётся
// неоплаченным и сам ни на что не влияет.
export const changeOrderPaymentMethodStep = createStep(
  "change-order-payment-method",
  async (input: ChangeOrderPaymentMethodStepInput, { container }) => {
    const service = resolveOrderPaymentService(container)
    const row = await requireOrderPayment(service, input.order_id)
    const facts = factsOf(row)

    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data } = await query.graph({
      entity: "order",
      fields: ["id", "order_lifecycle.status"],
      filters: { id: input.order_id },
    })
    const lifecycleStatus = (data[0] as { order_lifecycle?: { status?: string } | null })
      ?.order_lifecycle?.status

    const block = paymentChangeBlock(lifecycleStatus, row.status, facts)
    if (block) {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, BLOCK_MESSAGE[block])
    }

    const pendingKaspi = await findPendingOrderKaspiSession(container, input.order_id)
    const settings = await loadPaymentSettings(container, row.sales_channel_id)
    // Постоянный QR магазина: счёта на заказ нет — QR и есть «счёт».
    const staticQr = !!kaspiStaticQrUrl(settings)
    if (
      row.method === input.method &&
      (input.method !== "kaspi_qr" || pendingKaspi || staticQr)
    ) {
      return new StepResponse({ method: row.method, status: row.status, changed: false }, null)
    }

    const reason = paymentMethodUnavailable(settings, input.method, facts.amount)
    if (reason) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `payment_method_unavailable:${reason}: продавец не принимает этот способ оплаты для заказа`
      )
    }

    const paymentModule = container.resolve(Modules.PAYMENT)
    if (input.method === "kaspi_qr" && !pendingKaspi && !staticQr) {
      await issueOrderKaspiInvoice(container, {
        order_id: input.order_id,
        amount: facts.amount,
        sales_channel_id: row.sales_channel_id ?? null,
      })
    }
    if (input.method !== "kaspi_qr" && pendingKaspi) {
      // Неоплаченный счёт Kaspi больше не нужен: удаление сессии отменяет
      // инвойс (провайдер Kaspi, deletePayment).
      await paymentModule.deletePaymentSession(pendingKaspi.id)
    }

    // Чеки, присланные под прежний способ и ещё не решённые, закрываются: их
    // никто уже не ждёт, а «чек на проверке» в очереди продавца сбивал бы.
    // Сами чеки остаются в истории заказа.
    const waiting = await service.listPaymentReceipts(
      { order_payment_id: row.id, status: ["pending", "flagged"] } as never,
      { take: null }
    )
    const now = new Date()
    for (const receipt of waiting) {
      await service.updatePaymentReceipts({
        id: receipt.id,
        status: "rejected",
        reviewed_at: now,
        review_note: "Покупатель сменил способ оплаты",
      })
    }

    const history = Array.isArray(
      (row as unknown as { method_history?: unknown }).method_history
    )
      ? ((row as unknown as { method_history: unknown[] }).method_history)
      : []
    const status = orderPaymentStatus({ ...facts, method: input.method, approved: false })
    await service.updateOrderPayments({
      id: row.id,
      method: input.method,
      status,
      approved_at: null,
      approved_by: null,
      due_date: null,
      receipt_pending: false,
      method_history: [
        ...history,
        { from: row.method, to: input.method, at: now.toISOString() },
      ] as unknown as Record<string, unknown>,
    })

    return new StepResponse(
      { method: input.method, status, changed: true },
      {
        id: row.id,
        method: row.method,
        status: row.status,
        method_history: history,
        receipt_pending: !!(row as unknown as { receipt_pending?: boolean }).receipt_pending,
        receipts: waiting.map((receipt) => ({ id: receipt.id, status: receipt.status })),
      }
    )
  },
  async (previous, { container }) => {
    if (!previous) {
      return
    }
    const service = resolveOrderPaymentService(container)
    for (const receipt of previous.receipts) {
      await service.updatePaymentReceipts({
        id: receipt.id,
        status: receipt.status,
        reviewed_at: null,
        review_note: null,
      })
    }
    await service.updateOrderPayments({
      id: previous.id,
      method: previous.method,
      status: previous.status,
      receipt_pending: previous.receipt_pending,
      method_history: previous.method_history as unknown as Record<string, unknown>,
    })
  }
)
