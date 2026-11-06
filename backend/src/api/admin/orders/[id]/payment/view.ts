import { IUserModuleService, MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { ORDER_PAYMENT_MODULE } from "../../../../../modules/order-payment"
import OrderPaymentModuleService from "../../../../../modules/order-payment/service"
import { numericAmount } from "../../../../../lib/payments/amount"
import { transferDetails } from "../../../../../lib/payments/methods"
import {
  isDebtOverdue,
  outstandingAmount,
  refundDueAmount,
} from "../../../../../lib/payments/order-payment-state"
import { loadPaymentSettings } from "../../../../../lib/payments/settings"
import { factsOf, OrderPaymentRow } from "../../../../../workflows/payments/steps/order-payment-row"
import { loadUserNames } from "../../../user-names"
import { adminReceiptView, ReceiptRow } from "../../../../../lib/payments/receipt-view"

type EntryRow = {
  id: string
  kind: string
  channel: string
  amount: unknown
  actor_type: string
  actor_id: string | null
  note: string | null
  occurred_at: Date | string
}

const iso = (value: Date | string | null | undefined) =>
  value ? new Date(value).toISOString() : null

// Оплата заказа для панели: способ, суммы, долг и журнал движений. null —
// заказ оформлен до появления способов оплаты (оплата — по ядру, как раньше).
export const loadOrderPaymentView = async (
  container: MedusaContainer,
  orderId: string,
  now: Date = new Date()
) => {
  const service = container.resolve<OrderPaymentModuleService>(ORDER_PAYMENT_MODULE)
  const [found] = await service.listOrderPayments(
    { order_id: orderId },
    { take: 1, relations: ["entries", "receipts"] }
  )
  if (!found) {
    return null
  }
  const row = found as unknown as OrderPaymentRow & {
    order_display_id: number | null
    order_number?: string | null
    currency_code: string
    entries?: EntryRow[]
    receipts?: ReceiptRow[]
    method_history?: { from: string; to: string; at: string }[] | null
  }
  const facts = factsOf(row)
  const entries = [...(row.entries ?? [])].sort(
    (a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime()
  )
  const names = await loadUserNames(
    container.resolve<IUserModuleService>(Modules.USER),
    [
      ...entries.map((entry) => entry.actor_id),
      row.approved_by,
    ].filter((id): id is string => !!id)
  )
  const settings =
    row.method === "kaspi_transfer" || row.method === "debt"
      ? await loadPaymentSettings(container, row.sales_channel_id)
      : null

  return {
    // Номер для людей (ORG-26-0007): подсказка «Заказ ORG-26-0007» в
    // комментарии к переводу.
    order_number: row.order_number ?? null,
    order_display_id: row.order_display_id ?? null,
    method: row.method,
    status: row.status,
    currency_code: row.currency_code,
    amount: facts.amount,
    paid_amount: facts.paid_amount,
    refunded_amount: facts.refunded_amount,
    outstanding: outstandingAmount(facts),
    refund_due: refundDueAmount(facts),
    due_date: iso(row.due_date),
    overdue: isDebtOverdue(row.status, row.due_date, now),
    approved_at: iso(row.approved_at),
    approved_by_name: row.approved_by ? names.get(row.approved_by) ?? null : null,
    transfer: settings && row.method === "kaspi_transfer" ? transferDetails(settings) : null,
    // Срок долга по умолчанию — подсказка в диалоге одобрения.
    debt_term_days: settings && row.method === "debt" ? settings.debt_term_days : null,
    // Смены способа покупателем — чтобы «вдруг в долг» имело объяснение.
    method_history: Array.isArray(row.method_history) ? row.method_history : [],
    // Чеки покупателя: ждущие решения — первыми.
    receipts: [...(row.receipts ?? [])]
      .sort((a, b) => {
        const waiting = (r: ReceiptRow) => (r.status === "pending" || r.status === "flagged" ? 0 : 1)
        return (
          waiting(a) - waiting(b) ||
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      })
      .map(adminReceiptView),
    entries: entries.map((entry) => ({
      id: entry.id,
      kind: entry.kind,
      channel: entry.channel,
      amount: numericAmount(entry.amount) ?? 0,
      actor_type: entry.actor_type,
      actor_name: entry.actor_id ? names.get(entry.actor_id) ?? null : null,
      note: entry.note,
      occurred_at: iso(entry.occurred_at),
    })),
  }
}
