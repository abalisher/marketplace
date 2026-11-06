import {
  DEBT_PROVIDER_ID,
  KASPI_QR_LATER_PROVIDER_ID,
  TRANSFER_PROVIDER_ID,
} from "../../modules/payment-offline"
import { KASPI_PROVIDER_ID } from "../../modules/payment-kaspi"
import type { SelectablePaymentMethod } from "../../modules/order-payment/models/values"

// Способ оплаты ↔ платёжный провайдер ядра. Других провайдеров оформление не
// принимает: системный pp_system_default (ядро регистрирует его само) завершил
// бы корзину без денег.
export const METHOD_PROVIDER: Record<SelectablePaymentMethod, string> = {
  kaspi_qr: KASPI_PROVIDER_ID,
  kaspi_transfer: TRANSFER_PROVIDER_ID,
  debt: DEBT_PROVIDER_ID,
}

// Kaspi QR с оплатой ПОСЛЕ оформления (чат): у корзины не счёт Kaspi, а
// «обещание оплатить», счёт выставляется на заказ. Для покупателя и продавца
// это тот же способ kaspi_qr.
export const DEFERRED_KASPI_PROVIDER_ID = KASPI_QR_LATER_PROVIDER_ID

export const PAYMENT_PROVIDER_IDS = [
  ...Object.values(METHOD_PROVIDER),
  DEFERRED_KASPI_PROVIDER_ID,
]

export const methodByProvider = (
  providerId: string | null | undefined
): SelectablePaymentMethod | null => {
  if (providerId === DEFERRED_KASPI_PROVIDER_ID) {
    return "kaspi_qr"
  }
  return (
    (Object.entries(METHOD_PROVIDER).find(([, id]) => id === providerId)?.[0] as
      | SelectablePaymentMethod
      | undefined) ?? null
  )
}

// Kaspi QR корзины оплачивается после оформления (счёт на заказ).
export const isDeferredKaspiProvider = (providerId: string | null | undefined): boolean =>
  providerId === DEFERRED_KASPI_PROVIDER_ID
