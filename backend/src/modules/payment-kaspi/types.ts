import type { BigNumberInput } from "@medusajs/framework/types"

// Контракт транспорта к Kaspi Pay / QR. Провайдер (`service.ts`) зависит ТОЛЬКО
// от этого интерфейса — за ним прячется реализация: `KaspiMockClient` (dev/тесты,
// без сети) и будущий `KaspiHttpClient` (реальный эквайринг). Выбор — по env
// `KASPI_MODE` (см. `create-kaspi-client.ts`). Дизайн — docs/modules/payment-kaspi.md.

// Состояние инвойса Kaspi в терминах нашего домена (не сырые коды эквайера —
// их маппит конкретная реализация клиента).
export type KaspiInvoiceState = "pending" | "paid" | "canceled" | "error"

// Сценарий для мока: детерминированный исход оплаты. В live-режиме игнорируется.
// Прокидывается покупателем/оформлением через `data.kaspi_scenario` платёжной
// сессии; по умолчанию `pending` (инвойс создан, ждём оплату) — честное
// начальное состояние реального QR-флоу.
export type KaspiScenario = KaspiInvoiceState

// Инвойс Kaspi: идентификатор + данные для показа QR покупателю.
export interface KaspiInvoice {
  invoice_id: string
  qr_payload: string
  payment_url: string
  state: KaspiInvoiceState
  amount: BigNumberInput
  currency_code: string
}

export interface KaspiRefundResult {
  refund_id: string
  invoice_id: string
  amount: BigNumberInput
}

// Разобранное webhook-событие Kaspi. `invoice_id` — идентификатор, который мы
// вернули из `createInvoice` и ядро сохранило как id платёжной сессии провайдера
// (по нему ядро находит сессию при обработке webhook).
export interface KaspiWebhookEvent {
  invoice_id: string
  state: KaspiInvoiceState
  amount?: BigNumberInput
}

export interface CreateInvoiceInput {
  amount: BigNumberInput
  currency_code: string
  // Внешняя ссылка (id корзины/сессии) — для сопоставления и идемпотентности.
  reference?: string
  // Только мок: желаемый исход. В live игнорируется.
  scenario?: KaspiScenario
}

// Транспортный webhook-пейлоуд, как его отдаёт ядровый роут /hooks/payment/kaspi.
export interface KaspiWebhookPayload {
  data: Record<string, unknown>
  rawData: string | Buffer
  headers: Record<string, unknown>
}

export interface KaspiClient {
  createInvoice(input: CreateInvoiceInput): Promise<KaspiInvoice>
  getInvoiceStatus(invoiceId: string): Promise<KaspiInvoiceState>
  refund(invoiceId: string, amount: BigNumberInput): Promise<KaspiRefundResult>
  cancel(invoiceId: string): Promise<void>
  parseWebhook(payload: KaspiWebhookPayload): KaspiWebhookEvent
}
