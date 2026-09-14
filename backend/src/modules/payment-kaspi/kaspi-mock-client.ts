import { randomUUID } from "crypto"
import type { BigNumberInput } from "@medusajs/framework/types"
import type {
  CreateInvoiceInput,
  KaspiClient,
  KaspiInvoice,
  KaspiInvoiceState,
  KaspiScenario,
  KaspiRefundResult,
  KaspiWebhookEvent,
  KaspiWebhookPayload,
} from "./types"

// Детерминированный мок транспорта Kaspi для dev и тестов: НИКАКИХ сетевых
// вызовов. Ключевое свойство — клиент СТАТЕЛЕСС: исход оплаты кодируется прямо
// в `invoice_id` (сегмент сценария), поэтому `getInvoiceStatus` — чистая функция
// от идентификатора, а тесты управляют исходом через `data.kaspi_scenario`
// платёжной сессии, не залезая во внутреннее состояние мока.

const PREFIX = "kaspi_mock"
const VALID_STATES: readonly KaspiInvoiceState[] = ["pending", "paid", "canceled", "error"]

// Исход, назначенный УЖЕ СОЗДАННОМУ инвойсу (T8.6): сценарий кодируется в
// invoice_id при создании, а покупатель платит позже — на стенде это единственный
// способ пройти «чат → оплата → заказ» руками (публичной песочницы Kaspi нет).
// Живёт в памяти процесса и только в mock-режиме: перезапуск бэкенда сбрасывает,
// в live-транспорте механизма нет вовсе. Меняется dev-роутом
// POST /store/carts/:id/payment/kaspi/mock-pay.
const stateOverrides = new Map<string, KaspiInvoiceState>()

// Назначить инвойсу исход (как будто плательщик подтвердил оплату в Kaspi).
export function setMockInvoiceState(
  invoiceId: string,
  state: KaspiInvoiceState
): void {
  stateOverrides.set(invoiceId, state)
}

// Сброс назначенных исходов (тесты: мок обязан остаться стателесс по умолчанию).
export function clearMockInvoiceStates(): void {
  stateOverrides.clear()
}

function encodeInvoiceId(scenario: KaspiScenario): string {
  return `${PREFIX}_${scenario}_${randomUUID()}`
}

// Извлекает состояние из invoice_id (`kaspi_mock_<state>_<uuid>`); назначенный
// исход (см. выше) главнее закодированного. Незнакомый формат трактуем как
// ошибку — это признак рассинхрона, а не «оплачено».
function decodeState(invoiceId: string): KaspiInvoiceState {
  const override = stateOverrides.get(invoiceId)
  if (override) {
    return override
  }
  const parts = invoiceId.split("_")
  const candidate = parts[2] as KaspiInvoiceState
  return VALID_STATES.includes(candidate) ? candidate : "error"
}

export class KaspiMockClient implements KaspiClient {
  async createInvoice(input: CreateInvoiceInput): Promise<KaspiInvoice> {
    const scenario: KaspiScenario = input.scenario ?? "pending"
    const invoiceId = encodeInvoiceId(scenario)
    return {
      invoice_id: invoiceId,
      qr_payload: `kaspi://pay?invoice=${invoiceId}`,
      payment_url: `https://kaspi.kz/pay/${invoiceId}`,
      state: scenario,
      amount: input.amount,
      currency_code: input.currency_code,
    }
  }

  async getInvoiceStatus(invoiceId: string): Promise<KaspiInvoiceState> {
    return decodeState(invoiceId)
  }

  async refund(invoiceId: string, amount: BigNumberInput): Promise<KaspiRefundResult> {
    return {
      refund_id: `${PREFIX}_refund_${randomUUID()}`,
      invoice_id: invoiceId,
      amount,
    }
  }

  async cancel(_invoiceId: string): Promise<void> {
    // Мок: отмена неоплаченного инвойса — no-op (сеть не задействована).
  }

  parseWebhook(payload: KaspiWebhookPayload): KaspiWebhookEvent {
    const data = payload.data ?? {}
    const invoiceId = String(data.invoice_id ?? "")
    const state = VALID_STATES.includes(data.state as KaspiInvoiceState)
      ? (data.state as KaspiInvoiceState)
      : decodeState(invoiceId)
    const amount = data.amount as BigNumberInput | undefined
    return { invoice_id: invoiceId, state, amount }
  }
}
