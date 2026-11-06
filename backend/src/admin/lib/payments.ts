// DTO и подписи оплат: способы оплаты продавца (GET/POST /admin/payment-settings),
// оплата заказа (GET /admin/orders/:id/payment, receive, refund) и отчёт
// (GET /admin/payment-report, /debts, /export). Типы дублируют бэкенд намеренно:
// бандл панели не тянет модули сервера (src/admin/README.md).

import type { OrderPaymentMethod } from "./order"

export type PaymentChannel = "kaspi_qr" | "kaspi_transfer" | "cash" | "card" | "other"

export type OrderPaymentStatus =
  | "awaiting"
  | "debt_requested"
  | "debt"
  | "paid"
  | "canceled"
  | "refund_due"
  | "refunded"

export type AdminPaymentSettings = {
  kaspi_qr_enabled: boolean
  kaspi_mode: "mock" | "live"
  kaspi_merchant_id: string | null
  has_kaspi_api_key: boolean
  has_kaspi_webhook_secret: boolean
  // Фактический режим: на стенде (KASPI_MODE=mock) всегда тестовый.
  effective_kaspi_mode: "mock" | "live"
  // Постоянный QR магазина: ссылка и работает ли Kaspi QR через него.
  kaspi_static_qr_url: string | null
  kaspi_static_active: boolean
  platform_kaspi_mode: "mock" | "live"
  transfer_enabled: boolean
  transfer_phone: string | null
  transfer_recipient: string | null
  transfer_note: string | null
  debt_enabled: boolean
  debt_max_amount: number | null
  debt_term_days: number
  configured: boolean
  updated_at: string | null
}

export type AdminPaymentSeller = {
  sales_channel_id: string
  name: string
  tenant_id: string | null
}

export type AdminPaymentSettingsResponse = {
  seller: AdminPaymentSeller
  settings: AdminPaymentSettings
}

export type AdminPaymentSellersResponse = {
  sellers: (AdminPaymentSeller & { settings: AdminPaymentSettings })[]
}

export type AdminPaymentEntry = {
  id: string
  kind: "payment" | "refund"
  channel: PaymentChannel
  amount: number
  actor_type: "system" | "seller" | "admin"
  actor_name: string | null
  note: string | null
  occurred_at: string | null
}

export type ReceiptStatus = "pending" | "flagged" | "accepted" | "rejected"

// Чек Kaspi покупателя: файл, прочитанное, проверки и решение продавца.
export type AdminPaymentReceipt = {
  id: string
  status: ReceiptStatus
  verdict: "ok" | "warning" | "fail"
  file_url: string | null
  file_name: string | null
  mime_type: string
  amount: number | null
  paid_at: string | null
  receipt_number: string | null
  recipient_name: string | null
  recipient_phone: string | null
  // ИИН/БИН получателя — в чеке оплаты по Kaspi QR.
  recipient_bin: string | null
  sender_name: string | null
  comment: string | null
  checks: { code: string; level: "warning" | "fail"; text: string }[]
  review_note: string | null
  reviewed_at: string | null
  created_at: string | null
}

export type AdminReceiptReportRow = AdminPaymentReceipt & {
  order_id: string
  order_display_id: number | null
  // Номер для людей (ORG-26-0007); у заказов до 2026-11-02 — null.
  order_number?: string | null
  customer_name: string | null
  customer_phone: string | null
  method: OrderPaymentMethod
  seller_name: string | null
}

export type AdminReceiptsResponse = {
  receipts: AdminReceiptReportRow[]
  waiting: number
}

export const RECEIPT_STATUS_META: Record<
  ReceiptStatus,
  { label: string; color: "green" | "orange" | "red" | "grey" }
> = {
  pending: { label: "payments.receipts.status.pending", color: "orange" },
  flagged: { label: "payments.receipts.status.flagged", color: "red" },
  accepted: { label: "payments.receipts.status.accepted", color: "green" },
  rejected: { label: "payments.receipts.status.rejected", color: "grey" },
}

export type AdminOrderPayment = {
  method: OrderPaymentMethod
  status: OrderPaymentStatus
  currency_code: string
  amount: number
  paid_amount: number
  refunded_amount: number
  outstanding: number
  refund_due: number
  due_date: string | null
  overdue: boolean
  approved_at: string | null
  approved_by_name: string | null
  transfer: { phone: string; recipient: string | null; note: string | null } | null
  // Срок долга по умолчанию у продавца (только для заказа «в долг»).
  debt_term_days: number | null
  receipts: AdminPaymentReceipt[]
  // Покупатель менял способ оплаты.
  method_history: { from: OrderPaymentMethod; to: OrderPaymentMethod; at: string }[]
  entries: AdminPaymentEntry[]
}

export type AdminPaymentReportEntry = {
  id: string
  occurred_at: string | null
  kind: "payment" | "refund"
  channel: PaymentChannel
  amount: number
  note: string | null
  actor_type: "system" | "seller" | "admin"
  actor_name: string | null
  order_id: string
  order_display_id: number | null
  // Номер для людей (ORG-26-0007); у заказов до 2026-11-02 — null.
  order_number?: string | null
  method: OrderPaymentMethod
  customer_name: string | null
  customer_phone: string | null
  seller_name: string | null
}

export type AdminPaymentReportResponse = {
  entries: AdminPaymentReportEntry[]
  count: number
  limit: number
  offset: number
  totals: {
    received: number
    refunded: number
    net: number
    by_channel: Partial<Record<PaymentChannel, number>>
    count: number
  }
}

export type DebtState = "open" | "requested" | "closed" | "all"

export type AdminDebtRow = {
  order_id: string
  order_display_id: number | null
  // Номер для людей (ORG-26-0007); у заказов до 2026-11-02 — null.
  order_number?: string | null
  customer_name: string | null
  customer_phone: string | null
  status: OrderPaymentStatus
  amount: number
  paid_amount: number
  outstanding: number
  created_at: string | null
  approved_at: string | null
  due_date: string | null
  overdue: boolean
  overdue_days: number
  seller_name: string | null
}

export type AdminDebtsResponse = {
  debts: AdminDebtRow[]
  totals: {
    outstanding: number
    overdue: number
    open_count: number
    buyers: number
    requested_count: number
    requested_amount: number
  }
}

export const PAYMENT_CHANNELS: PaymentChannel[] = [
  "kaspi_transfer",
  "cash",
  "kaspi_qr",
  "card",
  "other",
]

export const PAYMENT_CHANNEL_LABEL: Record<PaymentChannel, string> = {
  kaspi_qr: "payments.channel.kaspi_qr",
  kaspi_transfer: "payments.channel.kaspi_transfer",
  cash: "payments.channel.cash",
  card: "payments.channel.card",
  other: "payments.channel.other",
}

export const ORDER_PAYMENT_STATUS_META: Record<
  OrderPaymentStatus,
  { label: string; color: "green" | "orange" | "red" | "blue" | "grey" }
> = {
  awaiting: { label: "payments.status.awaiting", color: "orange" },
  debt_requested: { label: "payments.status.debt_requested", color: "blue" },
  debt: { label: "payments.status.debt", color: "orange" },
  paid: { label: "payments.status.paid", color: "green" },
  canceled: { label: "payments.status.canceled", color: "grey" },
  refund_due: { label: "payments.status.refund_due", color: "red" },
  refunded: { label: "payments.status.refunded", color: "grey" },
}

// Ответ ошибкой — текстом для тоста (бэкенд пишет понятные сообщения сам).
export const errorText = (error: unknown, fallback: string): string => {
  const message = (error as { message?: string } | null)?.message?.trim()
  return message || fallback
}
