import {
  AbstractPaymentProvider,
  MedusaError,
  PaymentActions,
  PaymentSessionStatus,
} from "@medusajs/framework/utils"
import type { BigNumberValue, Logger } from "@medusajs/framework/types"
import type {
  AuthorizePaymentInput, AuthorizePaymentOutput,
  CancelPaymentInput, CancelPaymentOutput,
  CapturePaymentInput, CapturePaymentOutput,
  DeletePaymentInput, DeletePaymentOutput,
  GetPaymentStatusInput, GetPaymentStatusOutput,
  InitiatePaymentInput, InitiatePaymentOutput,
  ProviderWebhookPayload, WebhookActionResult,
  RefundPaymentInput, RefundPaymentOutput,
  RetrievePaymentInput, RetrievePaymentOutput,
  UpdatePaymentInput, UpdatePaymentOutput,
} from "@medusajs/framework/types"
import { createKaspiClient, KaspiProviderOptions } from "./create-kaspi-client"
import type { KaspiClient, KaspiInvoiceState, KaspiRefundResult, KaspiScenario } from "./types"

// Провайдер оплаты Kaspi за ядровым шлюзом @medusajs/payment. Реализует Payment
// Provider API ядра; вся платёжная механика (collection/session/Payment/Refund/
// webhook-роут) — ядро, мы лишь исполняем платёж через транспорт `KaspiClient`.
// Полный id у ядра — pp_kaspi_kaspi. Дизайн — docs/modules/payment-kaspi.md.

// Состояние Kaspi в data сессии (jsonb) — своих моделей домена для MVP не заводим.
interface KaspiSessionData {
  kaspi_invoice_id?: string
  qr_payload?: string
  payment_url?: string
  kaspi_state?: KaspiInvoiceState
  kaspi_scenario?: KaspiScenario
  reference?: string
  captured?: boolean
  refunds?: KaspiRefundResult[]
  [key: string]: unknown
}

// Kaspi-состояние → статус платёжной сессии ядра. `paid` → authorized:
// подтверждение оплаты; фактическое списание — отдельный явный capture.
function stateToSessionStatus(state: KaspiInvoiceState): PaymentSessionStatus {
  switch (state) {
    case "paid":
      return PaymentSessionStatus.AUTHORIZED
    case "canceled":
      return PaymentSessionStatus.CANCELED
    case "error":
      return PaymentSessionStatus.ERROR
    case "pending":
    default:
      return PaymentSessionStatus.PENDING
  }
}

// Kaspi-состояние → действие webhook для ядра.
function stateToWebhookAction(state: KaspiInvoiceState): PaymentActions {
  switch (state) {
    case "paid":
      return PaymentActions.AUTHORIZED
    case "canceled":
      return PaymentActions.CANCELED
    case "error":
      return PaymentActions.FAILED
    case "pending":
    default:
      return PaymentActions.PENDING
  }
}

function requireInvoiceId(data: KaspiSessionData | undefined): string {
  const id = data?.kaspi_invoice_id
  if (typeof id !== "string" || !id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Kaspi payment session is missing kaspi_invoice_id"
    )
  }
  return id
}

export default class KaspiPaymentProvider extends AbstractPaymentProvider<KaspiProviderOptions> {
  static identifier = "kaspi"

  protected readonly client_: KaspiClient
  protected readonly logger_: Logger

  constructor(
    cradle: { logger: Logger },
    options: KaspiProviderOptions = {}
  ) {
    super(cradle, options)
    this.logger_ = cradle.logger
    this.client_ = createKaspiClient(options)
  }

  // Создать инвойс Kaspi + получить QR/ссылку; положить в data сессии.
  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const data = (input.data ?? {}) as KaspiSessionData
    const invoice = await this.client_.createInvoice({
      amount: input.amount,
      currency_code: input.currency_code,
      reference: data.reference,
      scenario: data.kaspi_scenario,
    })
    this.logger_.info(`[kaspi] invoice created ${invoice.invoice_id} (${invoice.state})`)
    return {
      id: invoice.invoice_id,
      status: stateToSessionStatus(invoice.state),
      data: {
        ...data,
        kaspi_invoice_id: invoice.invoice_id,
        qr_payload: invoice.qr_payload,
        payment_url: invoice.payment_url,
        kaspi_state: invoice.state,
        amount: input.amount,
        currency_code: input.currency_code,
      },
    }
  }

  // Проверить оплату: пока не оплачено → pending, после подтверждения → authorized.
  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    const data = (input.data ?? {}) as KaspiSessionData
    const state = await this.client_.getInvoiceStatus(requireInvoiceId(data))
    return {
      status: stateToSessionStatus(state),
      data: { ...data, kaspi_state: state },
    }
  }

  // Опрос статуса инвойса (polling клиентом/джобой).
  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    const data = (input.data ?? {}) as KaspiSessionData
    const state = await this.client_.getInvoiceStatus(requireInvoiceId(data))
    return {
      status: stateToSessionStatus(state),
      data: { ...data, kaspi_state: state },
    }
  }

  // Списание. Для QR оплата и есть списание — подтверждаем идемпотентно.
  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    const data = (input.data ?? {}) as KaspiSessionData
    return { data: { ...data, captured: true } }
  }

  // Возврат средств (частичный/полный) по регламенту эквайера.
  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const data = (input.data ?? {}) as KaspiSessionData
    const result = await this.client_.refund(requireInvoiceId(data), input.amount)
    const refunds = Array.isArray(data.refunds) ? data.refunds : []
    return { data: { ...data, refunds: [...refunds, result] } }
  }

  // Отменить неоплаченный инвойс.
  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    const data = (input.data ?? {}) as KaspiSessionData
    if (data.kaspi_invoice_id) {
      await this.client_.cancel(data.kaspi_invoice_id)
    }
    return { data: { ...data, kaspi_state: "canceled" } }
  }

  // Удалить сессию/инвойс (корзина брошена) — best-effort отмена.
  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    const data = (input.data ?? {}) as KaspiSessionData
    if (data.kaspi_invoice_id) {
      try {
        await this.client_.cancel(data.kaspi_invoice_id)
      } catch (e) {
        this.logger_.warn(`[kaspi] cancel on delete failed: ${(e as Error).message}`)
      }
    }
    return { data }
  }

  // Актуальные данные инвойса из Kaspi.
  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    const data = (input.data ?? {}) as KaspiSessionData
    if (!data.kaspi_invoice_id) {
      return { data }
    }
    const state = await this.client_.getInvoiceStatus(data.kaspi_invoice_id)
    return { data: { ...data, kaspi_state: state } }
  }

  // Пересчёт суммы сессии (частичное исполнение — отложенный сценарий). Для мока
  // обновляем сумму в data; статус не меняем.
  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    const data = (input.data ?? {}) as KaspiSessionData
    return {
      status: PaymentSessionStatus.PENDING,
      data: { ...data, amount: input.amount, currency_code: input.currency_code },
    }
  }

  // Разбор webhook Kaspi → действие + ссылка на сессию (по нашему invoice_id,
  // который ядро сохранило как id сессии провайдера) и сумма.
  async getWebhookActionAndData(
    payload: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    const event = this.client_.parseWebhook(payload)
    return {
      action: stateToWebhookAction(event.state),
      data: {
        session_id: event.invoice_id,
        amount: (event.amount ?? 0) as BigNumberValue,
      },
    }
  }
}
