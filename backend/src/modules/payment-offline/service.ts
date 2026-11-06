import { randomUUID } from "crypto"
import {
  AbstractPaymentProvider,
  PaymentActions,
  PaymentSessionStatus,
} from "@medusajs/framework/utils"
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

// Оплата «вне банка» за ядровым шлюзом @medusajs/payment: перевод по номеру
// Kaspi и «в долг». Банка за ними нет — деньги покупатель передаёт продавцу сам,
// а поступление продавец отмечает в панели (журнал модуля order_payment).
//
// Провайдер нужен ядру, чтобы корзину можно было завершить без оплаченного
// счёта: при завершении сессия авторизуется сразу — это «обещание оплатить», а
// не деньги. Списание (capture) делает отметка продавца о поступлении.
// Авторизуется сессия ТОЛЬКО через наше оформление (place-order): проверка
// перед ним (ensure-cart-payment-authorized) пускает способ, лишь если продавец
// его принимает, а ядровое завершение корзины мимо нас закрыто (middlewares).
abstract class OfflinePaymentProvider extends AbstractPaymentProvider {
  // Публичный конструктор: ядро создаёт провайдера само (у базового класса он
  // защищённый, и ModuleProvider такой класс не принимает).
  constructor(cradle: Record<string, unknown>, options: Record<string, unknown> = {}) {
    super(cradle, options)
  }

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const identifier = (this.constructor as typeof OfflinePaymentProvider & {
      identifier: string
    }).identifier
    return {
      id: `${identifier}_${randomUUID()}`,
      status: PaymentSessionStatus.PENDING,
      data: { ...(input.data ?? {}), amount: input.amount, currency_code: input.currency_code },
    }
  }

  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    return { status: PaymentSessionStatus.AUTHORIZED, data: input.data ?? {} }
  }

  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    return { status: PaymentSessionStatus.AUTHORIZED, data: input.data ?? {} }
  }

  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    return { data: input.data ?? {} }
  }

  // Деньги возвращает продавец сам (переводом или наличными) и отмечает это в
  // панели: провайдеру возвращать нечего.
  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    return { data: input.data ?? {} }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    return { data: input.data ?? {} }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return { data: input.data ?? {} }
  }

  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    return { data: input.data ?? {} }
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    return {
      status: PaymentSessionStatus.PENDING,
      data: { ...(input.data ?? {}), amount: input.amount, currency_code: input.currency_code },
    }
  }

  // Webhook'ов у перевода и долга нет.
  async getWebhookActionAndData(
    _payload: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    return { action: PaymentActions.NOT_SUPPORTED }
  }
}

// Перевод по номеру Kaspi продавца.
export class TransferPaymentProvider extends OfflinePaymentProvider {
  static identifier = "transfer"
}

// В долг: покупатель просит отсрочку, продавец решает.
export class DebtPaymentProvider extends OfflinePaymentProvider {
  static identifier = "debt"
}

// Kaspi QR «после оформления» (чат): заказ оформляется сразу, а счёт Kaspi
// выставляется уже на заказ (place-order → issue-order-kaspi-invoice). Сессия
// корзины — только «обещание оплатить», как у перевода; денег по ней не будет:
// оплатят счёт заказа — обещание отменит settle-order-kaspi-payment.
export class KaspiQrLaterPaymentProvider extends OfflinePaymentProvider {
  static identifier = "kaspiqr"
}
