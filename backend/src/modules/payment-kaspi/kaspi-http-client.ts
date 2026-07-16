import { createHmac, randomUUID, timingSafeEqual } from "crypto"
import { MedusaError } from "@medusajs/framework/utils"
import type { BigNumberInput } from "@medusajs/framework/types"
import type {
  CreateInvoiceInput,
  KaspiClient,
  KaspiInvoice,
  KaspiInvoiceState,
  KaspiRefundResult,
  KaspiWebhookEvent,
  KaspiWebhookPayload,
} from "./types"

// Живой транспорт Kaspi Pay / QR — порт флоу tapter-dev/kaspi-pos-automation
// (см. docs/modules/payment-kaspi.md → Референсы) за адаптером `KaspiClient`:
// QR-инвойс → polling статуса → refund; webhook с подписью HMAC SHA-256.
// ⚠ Референс — НЕОФИЦИАЛЬНЫЙ API: при получении договора эквайринга этот файл
// заменяется на официальный транспорт, провайдер и оформление не меняются.
// Ходим НЕ напрямую в kaspi.kz, а в развёрнутый инстанс automation-сервера
// (base_url — env `KASPI_API_URL`).

// Минимальная структурная типизация fetch: глобальный fetch Node 18+ подходит,
// а тесты подсовывают фейк без сети (решение — DECISIONS, подзадача 3).
export interface KaspiHttpResponse {
  ok: boolean
  status: number
  json(): Promise<unknown>
}

export type KaspiFetch = (
  url: string,
  init: {
    method: string
    headers: Record<string, string>
    body?: string
    signal?: AbortSignal
  }
) => Promise<KaspiHttpResponse>

export interface KaspiHttpClientOptions {
  base_url: string
  merchant_id: string
  api_key: string
  webhook_secret: string
  fetch?: KaspiFetch
  timeout_ms?: number
}

// Конверт ответов automation-сервера: успех — StatusCode 0 + Data.
interface KaspiApiEnvelope {
  StatusCode?: number
  Message?: string
  StatusDesc?: string
  Data?: Record<string, unknown>
}

const DEFAULT_TIMEOUT_MS = 10_000
const SIGNATURE_HEADER = "x-webhook-signature"

// Статусы Kaspi → наше состояние инвойса. Деньги считаем полученными ТОЛЬКО на
// явный `Processed`; незнакомый статус — pending (продолжаем опрашивать), а не
// error: у неофициального API набор статусов может пополняться.
const PAID_STATUSES: readonly string[] = ["Processed"]
const CANCELED_STATUSES: readonly string[] = [
  "Expired",
  "QrTokenDiscarded",
  "CancelledByUser",
  "RemotePaymentCanceled",
]
const ERROR_STATUSES: readonly string[] = ["Rejected", "RemotePaymentRejected", "Error"]

export function mapKaspiStatus(status: string): KaspiInvoiceState {
  if (PAID_STATUSES.includes(status)) {
    return "paid"
  }
  if (CANCELED_STATUSES.includes(status)) {
    return "canceled"
  }
  if (ERROR_STATUSES.includes(status)) {
    return "error"
  }
  return "pending"
}

// События webhook (payment.success|failed|expired) — запасной маппинг, когда
// поле status отсутствует или незнакомо.
function mapWebhookEvent(event: string): KaspiInvoiceState {
  switch (event) {
    case "payment.success":
      return "paid"
    case "payment.expired":
      return "canceled"
    case "payment.failed":
      return "error"
    default:
      return "pending"
  }
}

// BigNumberInput ядра → число для API Kaspi (суммы — в тенге, целые).
function toApiAmount(amount: BigNumberInput): number {
  let numeric: number
  if (typeof amount === "number") {
    numeric = amount
  } else if (typeof amount === "string") {
    numeric = Number(amount)
  } else if (typeof amount === "object" && amount !== null && "toNumber" in amount) {
    numeric = (amount as { toNumber(): number }).toNumber()
  } else if (typeof amount === "object" && amount !== null && "value" in amount) {
    numeric = Number((amount as { value: string | number }).value)
  } else {
    numeric = NaN
  }
  if (!Number.isFinite(numeric)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Kaspi: cannot convert amount to a number: ${JSON.stringify(amount)}`
    )
  }
  return numeric
}

// Регистронезависимый поиск заголовка (ядро может отдавать их в разном регистре).
function headerValue(
  headers: Record<string, unknown> | undefined,
  name: string
): string | undefined {
  for (const [key, value] of Object.entries(headers ?? {})) {
    if (key.toLowerCase() !== name) {
      continue
    }
    if (Array.isArray(value)) {
      return typeof value[0] === "string" ? value[0] : undefined
    }
    return typeof value === "string" ? value : undefined
  }
  return undefined
}

export class KaspiHttpClient implements KaspiClient {
  private readonly options_: KaspiHttpClientOptions
  private readonly fetch_: KaspiFetch

  constructor(options: KaspiHttpClientOptions) {
    this.options_ = options
    // globalThis.fetch типизирован шире нашего KaspiFetch — структурно совместим.
    this.fetch_ = options.fetch ?? (globalThis.fetch as unknown as KaspiFetch)
  }

  async createInvoice(input: CreateInvoiceInput): Promise<KaspiInvoice> {
    const data = await this.request_("POST", "/api/qr/create", {
      body: {
        amount: toApiAmount(input.amount),
        // Внешняя ссылка (id корзины) — для сопоставления в выписке мерчанта.
        comment: input.reference,
      },
    })
    const operationId = data.QrOperationId
    const qrToken = data.QrToken
    if (operationId === undefined || typeof qrToken !== "string") {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "Kaspi: /api/qr/create response is missing QrOperationId/QrToken"
      )
    }
    return {
      invoice_id: String(operationId),
      // QrToken — ссылка pay.kaspi.kz: она же содержимое QR и она же payment_url.
      qr_payload: qrToken,
      payment_url: qrToken,
      state: "pending",
      amount: input.amount,
      currency_code: input.currency_code,
    }
  }

  async getInvoiceStatus(invoiceId: string): Promise<KaspiInvoiceState> {
    const data = await this.request_("GET", "/api/qr/status", {
      query: { qrOperationId: invoiceId },
    })
    return mapKaspiStatus(typeof data.Status === "string" ? data.Status : "")
  }

  async refund(invoiceId: string, amount: BigNumberInput): Promise<KaspiRefundResult> {
    const data = await this.request_("POST", "/api/refund/create", {
      body: {
        qrOperationId: Number(invoiceId),
        returnAmount: toApiAmount(amount),
      },
    })
    // Идентификатор возврата в ответе референса не зафиксирован — берём что есть,
    // иначе генерируем свой (для трассировки в data сессии этого достаточно).
    const refundId = data.ReturnOperationId ?? data.Id
    return {
      refund_id: refundId !== undefined ? String(refundId) : `kaspi_refund_${randomUUID()}`,
      invoice_id: invoiceId,
      amount,
    }
  }

  async cancel(invoiceId: string): Promise<void> {
    // У QR-флоу референса нет своей отмены (QR истекает сам по ExpireDate) —
    // используем единственный cancel-эндпоинт референса.
    await this.request_("POST", "/api/invoice/cancel", {
      body: { operationId: invoiceId },
    })
  }

  parseWebhook(payload: KaspiWebhookPayload): KaspiWebhookEvent {
    this.verifyWebhookSignature_(payload)
    const data = payload.data ?? {}
    const invoiceId = data.paymentId !== undefined ? String(data.paymentId) : ""
    if (!invoiceId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Kaspi webhook payload is missing paymentId"
      )
    }
    // Основной источник — сырой статус Kaspi; событие — запасной маппинг.
    const byStatus = mapKaspiStatus(typeof data.status === "string" ? data.status : "")
    const state =
      byStatus !== "pending"
        ? byStatus
        : mapWebhookEvent(typeof data.event === "string" ? data.event : "")
    const amount =
      typeof data.amount === "number" || typeof data.amount === "string"
        ? data.amount
        : undefined
    return { invoice_id: invoiceId, state, amount }
  }

  // Подпись webhook: X-Webhook-Signature: sha256=<hex>, hex = HMAC-SHA256(secret, raw body).
  // Невалидная/отсутствующая подпись — жёсткая ошибка: webhook меняет статус денег.
  private verifyWebhookSignature_(payload: KaspiWebhookPayload): void {
    const header = headerValue(payload.headers, SIGNATURE_HEADER)
    if (!header) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Kaspi webhook is missing the X-Webhook-Signature header"
      )
    }
    const provided = Buffer.from(header.replace(/^sha256=/, ""), "hex")
    const raw =
      typeof payload.rawData === "string" ? Buffer.from(payload.rawData) : payload.rawData
    const expected = createHmac("sha256", this.options_.webhook_secret)
      .update(raw)
      .digest()
    if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Kaspi webhook signature verification failed"
      )
    }
  }

  private async request_(
    method: "GET" | "POST",
    path: string,
    input: { query?: Record<string, string>; body?: Record<string, unknown> } = {}
  ): Promise<Record<string, unknown>> {
    const url = new URL(path, this.options_.base_url)
    for (const [key, value] of Object.entries(input.query ?? {})) {
      url.searchParams.set(key, value)
    }
    let response: KaspiHttpResponse
    try {
      response = await this.fetch_(url.toString(), {
        method,
        headers: {
          "content-type": "application/json",
          // Маппинг наших двух секретов на заголовки референса (X-Token-SN /
          // X-Profile-Id / X-Vtoken-Secret) — временный, до официального API.
          "x-token-sn": this.options_.merchant_id,
          "x-profile-id": this.options_.merchant_id,
          "x-vtoken-secret": this.options_.api_key,
        },
        body: input.body !== undefined ? JSON.stringify(input.body) : undefined,
        signal: AbortSignal.timeout(this.options_.timeout_ms ?? DEFAULT_TIMEOUT_MS),
      })
    } catch (e) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Kaspi API ${path} request failed: ${(e as Error).message}`
      )
    }
    if (!response.ok) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Kaspi API ${path} failed: HTTP ${response.status}`
      )
    }
    const envelope = (await response.json()) as KaspiApiEnvelope
    if (envelope.StatusCode !== 0) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Kaspi API ${path} returned StatusCode ${envelope.StatusCode}: ${
          envelope.Message ?? envelope.StatusDesc ?? "no message"
        }`
      )
    }
    return envelope.Data ?? {}
  }
}
