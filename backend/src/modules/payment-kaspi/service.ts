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
import {
  createDefaultKaspiClient,
  createSellerKaspiClient,
  KaspiProviderOptions,
  resolveMode,
} from "./create-kaspi-client"
import { decryptSecret } from "../../lib/onec/secret"
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
  // Канал продаж корзины — чьими ключами Kaspi выставлен счёт. Ставит
  // init-cart-kaspi-payment (ядровый роут создания сессии закрыт, клиент
  // подставить чужой канал не может).
  sales_channel_id?: string
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

// Настройки оплаты продавца в той форме, в какой их отдаёт модуль order_payment
// (зависимость платёжного модуля, см. medusa-config.ts).
type SellerKaspiSettings = {
  kaspi_mode: "mock" | "live"
  kaspi_merchant_id: string | null
  kaspi_api_key_cipher: string | null
  kaspi_webhook_secret_cipher: string | null
  updated_at?: Date | string | null
}

type SellerSettingsSource = {
  getSettingsByChannel(salesChannelId: string): Promise<SellerKaspiSettings | null>
}

export default class KaspiPaymentProvider extends AbstractPaymentProvider<KaspiProviderOptions> {
  static identifier = "kaspi"

  // Клиент площадки: тестовый (KASPI_MODE=mock) или рабочий по ключам площадки
  // из окружения. В рабочем режиме без ключей площадки его нет — счёт
  // выставляется ключами продавца.
  protected readonly client_: KaspiClient | null
  protected readonly logger_: Logger
  protected readonly mode_: "mock" | "live"
  protected readonly cradle_: Record<string, unknown>
  // Рабочие клиенты продавцов: ключ — канал + время правки настроек (сменил
  // ключи — новый клиент).
  protected readonly sellerClients_ = new Map<string, KaspiClient>()

  constructor(
    cradle: { logger: Logger },
    options: KaspiProviderOptions = {}
  ) {
    super(cradle, options)
    this.logger_ = cradle.logger
    this.cradle_ = cradle as unknown as Record<string, unknown>
    this.mode_ = resolveMode(options)
    this.client_ = createDefaultKaspiClient(options)
  }

  // Деньги идут на счёт продавца: счёт выставляется ключами Kaspi канала
  // корзины. На стенде (KASPI_MODE=mock) — всегда тестовый клиент.
  protected async clientFor(data: KaspiSessionData | undefined): Promise<KaspiClient> {
    if (this.mode_ === "mock") {
      return this.client_!
    }
    const channel = data?.sales_channel_id
    const settings = channel ? await this.sellerSettings_(channel) : null
    if (
      channel &&
      settings?.kaspi_mode === "live" &&
      settings.kaspi_merchant_id &&
      settings.kaspi_api_key_cipher
    ) {
      const key = `${channel}:${new Date(settings.updated_at ?? 0).getTime()}`
      let client = this.sellerClients_.get(key)
      if (!client) {
        client = createSellerKaspiClient({
          merchant_id: settings.kaspi_merchant_id,
          api_key: decryptSecret(settings.kaspi_api_key_cipher),
          webhook_secret: settings.kaspi_webhook_secret_cipher
            ? decryptSecret(settings.kaspi_webhook_secret_cipher)
            : null,
        })
        this.sellerClients_.set(key, client)
      }
      return client
    }
    if (this.client_) {
      return this.client_
    }
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Kaspi у продавца не подключён: нет ключей Kaspi в настройках оплаты"
    )
  }

  protected async sellerSettings_(channel: string): Promise<SellerKaspiSettings | null> {
    let source: SellerSettingsSource | undefined
    try {
      source = this.cradle_["order_payment"] as SellerSettingsSource | undefined
    } catch {
      source = undefined
    }
    if (!source) {
      this.logger_.warn("[kaspi] order_payment module is not available to the provider")
      return null
    }
    return source.getSettingsByChannel(channel)
  }

  // Создать инвойс Kaspi + получить QR/ссылку; положить в data сессии.
  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const data = (input.data ?? {}) as KaspiSessionData
    const client = await this.clientFor(data)
    const invoice = await client.createInvoice({
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
    const client = await this.clientFor(data)
    const state = await client.getInvoiceStatus(requireInvoiceId(data))
    return {
      status: stateToSessionStatus(state),
      data: { ...data, kaspi_state: state },
    }
  }

  // Опрос статуса инвойса (polling клиентом/джобой).
  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    const data = (input.data ?? {}) as KaspiSessionData
    const client = await this.clientFor(data)
    const state = await client.getInvoiceStatus(requireInvoiceId(data))
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
    const client = await this.clientFor(data)
    const result = await client.refund(requireInvoiceId(data), input.amount)
    const refunds = Array.isArray(data.refunds) ? data.refunds : []
    return { data: { ...data, refunds: [...refunds, result] } }
  }

  // Отменить неоплаченный инвойс.
  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    const data = (input.data ?? {}) as KaspiSessionData
    if (data.kaspi_invoice_id) {
      const client = await this.clientFor(data)
      await client.cancel(data.kaspi_invoice_id)
    }
    return { data: { ...data, kaspi_state: "canceled" } }
  }

  // Удалить сессию/инвойс (корзина брошена) — best-effort отмена.
  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    const data = (input.data ?? {}) as KaspiSessionData
    if (data.kaspi_invoice_id) {
      try {
        const client = await this.clientFor(data)
        await client.cancel(data.kaspi_invoice_id)
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
    const client = await this.clientFor(data)
    const state = await client.getInvoiceStatus(data.kaspi_invoice_id)
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
    // Webhook приходит на общий адрес провайдера, канала в нём нет — его
    // принимает только клиент площадки (тестовый или по ключам площадки).
    // Webhook'и продавцов подключаются вместе с официальным API Kaspi; до тех
    // пор оплата продавца узнаётся опросом статуса.
    if (!this.client_) {
      return { action: PaymentActions.NOT_SUPPORTED }
    }
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
