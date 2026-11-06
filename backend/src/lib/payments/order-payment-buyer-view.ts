import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ORDER_PAYMENT_MODULE } from "../../modules/order-payment"
import OrderPaymentModuleService from "../../modules/order-payment/service"
import type {
  OrderPaymentStatus,
  PaymentMethod,
} from "../../modules/order-payment/models/values"
import { numericAmount } from "./amount"
import {
  kaspiStaticQrUrl,
  PaymentMethodOption,
  paymentMethodOptions,
  TransferDetails,
  transferDetails,
} from "./methods"
import { findPendingOrderKaspiSession } from "./order-kaspi"
import {
  isDebtOverdue,
  outstandingAmount,
  paymentChangeBlock,
} from "./order-payment-state"
import { loadPaymentSettings } from "./settings"
import { buyerReceiptView, ReceiptRow } from "./receipt-view"

// Оплата заказа глазами покупателя (кабинет, чат): способ, сколько осталось
// заплатить, куда переводить и до какого числа вернуть долг. Без журнала и без
// того, кто что отметил, — это внутреннее дело продавца.
export type BuyerOrderPayment = {
  method: PaymentMethod
  status: OrderPaymentStatus
  currency_code: string
  amount: number
  paid_amount: number
  outstanding: number
  due_date: string | null
  overdue: boolean
  order_display_id: number | null
  // Номер заказа для людей (ORG-26-0007); у старых заказов — null.
  order_number: string | null
  // Перевод: куда переводить, пока не оплачено (в комментарии — номер заказа).
  transfer: TransferDetails | null
  // Счёт Kaspi на заказ (покупатель сменил способ на Kaspi QR), пока не оплачен.
  // static — постоянный QR магазина: суммы в нём нет, её покупатель вводит
  // сам, оплату подтверждают чек и продавец.
  kaspi: { qr_payload: string | null; payment_url: string | null; static: boolean } | null
  // На что можно сменить способ оплаты (пусто — сменить нельзя: продавец уже
  // подтвердил заказ, деньги уже были или заказ отменён). Текущий способ и
  // выключенные продавцом сюда не входят.
  change_options: PaymentMethodOption[]
  // Чек Kaspi можно прислать (перевод или долг, есть что платить).
  can_send_receipt: boolean
  receipts: ReturnType<typeof buyerReceiptView>[]
}

export const loadBuyerOrderPayment = async (
  container: MedusaContainer,
  orderId: string,
  now: Date = new Date()
): Promise<BuyerOrderPayment | null> => {
  const service = container.resolve<OrderPaymentModuleService>(ORDER_PAYMENT_MODULE)
  const [row] = await service.listOrderPayments(
    { order_id: orderId },
    { take: 1, relations: ["receipts"] }
  )
  if (!row) {
    return null
  }
  const facts = {
    method: row.method as PaymentMethod,
    amount: numericAmount(row.amount) ?? 0,
    paid_amount: numericAmount(row.paid_amount) ?? 0,
    refunded_amount: numericAmount(row.refunded_amount) ?? 0,
    approved: !!row.approved_at,
    canceled: !!row.canceled_at,
  }
  const outstanding = outstandingAmount(facts)
  const needsTransfer =
    (row.method === "kaspi_transfer" || row.method === "debt") &&
    outstanding > 0 &&
    row.status !== "debt_requested"

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "order",
    fields: ["id", "order_lifecycle.status"],
    filters: { id: orderId },
  })
  const lifecycleStatus = (data[0] as { order_lifecycle?: { status?: string } | null })
    ?.order_lifecycle?.status
  const changeable = !paymentChangeBlock(
    lifecycleStatus,
    row.status as OrderPaymentStatus,
    facts
  )

  const awaitingKaspi = row.method === "kaspi_qr" && row.status === "awaiting"
  const settings =
    needsTransfer || changeable || awaitingKaspi
      ? await loadPaymentSettings(container, row.sales_channel_id)
      : null
  const staticQr = awaitingKaspi && settings ? kaspiStaticQrUrl(settings) : null
  const pendingKaspi =
    row.method === "kaspi_qr" && row.status === "awaiting"
      ? await findPendingOrderKaspiSession(container, orderId)
      : null

  return {
    method: row.method as PaymentMethod,
    status: row.status as OrderPaymentStatus,
    currency_code: row.currency_code,
    amount: facts.amount,
    paid_amount: facts.paid_amount,
    outstanding,
    due_date: row.due_date ? new Date(row.due_date).toISOString() : null,
    overdue: isDebtOverdue(row.status as OrderPaymentStatus, row.due_date, now),
    order_display_id: row.order_display_id ?? null,
    order_number: (row as { order_number?: string | null }).order_number ?? null,
    transfer: settings && needsTransfer ? transferDetails(settings) : null,
    kaspi: pendingKaspi
      ? {
          qr_payload: (pendingKaspi.data.qr_payload as string | undefined) ?? null,
          payment_url: (pendingKaspi.data.payment_url as string | undefined) ?? null,
          static: false,
        }
      : staticQr
      ? { qr_payload: staticQr, payment_url: staticQr, static: true }
      : null,
    change_options:
      changeable && settings
        ? paymentMethodOptions(settings, facts.amount).filter(
            (option) =>
              option.reason !== "disabled" &&
              // Текущий способ не предлагаем; Kaspi QR без выставленного счёта
              // (заказ оформлен с QR и не оплачен — так не бывает) — тоже.
              !(
                option.method === row.method &&
                (row.method !== "kaspi_qr" || pendingKaspi || staticQr)
              )
          )
        : [],
    // Чек — к переводу, долгу и оплате по QR магазина (банк её не подтверждает).
    can_send_receipt:
      (row.method === "kaspi_transfer" || row.method === "debt" || !!staticQr) &&
      outstanding > 0 &&
      ["awaiting", "debt_requested", "debt"].includes(row.status),
    receipts: [...((row as unknown as { receipts?: ReceiptRow[] }).receipts ?? [])]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map(buyerReceiptView),
  }
}
