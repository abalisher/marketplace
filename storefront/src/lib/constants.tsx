import React from "react"
import { Cash, Clock, CreditCard } from "@medusajs/icons"

import Ideal from "@modules/common/icons/ideal"
import Bancontact from "@modules/common/icons/bancontact"
import PayPal from "@modules/common/icons/paypal"

/* Map of payment provider_id to their title and icon. Add in any payment providers you want to use. */
export const paymentInfoMap: Record<
  string,
  { title: string; icon: React.JSX.Element }
> = {
  pp_stripe_stripe: {
    title: "Credit card",
    icon: <CreditCard />,
  },
  "pp_medusa-payments_default": {
    title: "Credit card",
    icon: <CreditCard />,
  },
  "pp_stripe-ideal_stripe": {
    title: "iDeal",
    icon: <Ideal />,
  },
  "pp_stripe-bancontact_stripe": {
    title: "Bancontact",
    icon: <Bancontact />,
  },
  pp_paypal_paypal: {
    title: "PayPal",
    icon: <PayPal />,
  },
  pp_system_default: {
    title: "Manual Payment",
    icon: <CreditCard />,
  },
  pp_kaspi_kaspi: {
    title: "Kaspi QR",
    icon: <CreditCard />,
  },
  // Способы оплаты продавца без банка: перевод на номер Kaspi и «в долг».
  // Подписи здесь — запасные (русский по умолчанию); на экранах покупателя
  // заголовок берётся из словаря по коду способа (`paymentMethodByProvider`).
  pp_transfer_offline: {
    title: "Перевод на Kaspi",
    icon: <Cash />,
  },
  pp_debt_offline: {
    title: "В долг",
    icon: <Clock />,
  },
  // Add more payment providers here
}

// This only checks if it is native stripe or medusa payments for card payments, it ignores the other stripe-based providers
export const isStripeLike = (providerId?: string) => {
  return (
    providerId?.startsWith("pp_stripe_") || providerId?.startsWith("pp_medusa-")
  )
}

export const isPaypal = (providerId?: string) => {
  return providerId?.startsWith("pp_paypal")
}
export const isManual = (providerId?: string) => {
  return providerId?.startsWith("pp_system_default")
}
export const isKaspi = (providerId?: string) => {
  return providerId?.startsWith("pp_kaspi_")
}
// Перевод на номер Kaspi продавца: заказ оформляется без оплаты, деньги
// продавец отмечает сам.
export const isTransfer = (providerId?: string) => {
  return providerId?.startsWith("pp_transfer_")
}
// «В долг»: просьба продавцу, он одобряет (срок) или отменяет заказ.
export const isDebt = (providerId?: string) => {
  return providerId?.startsWith("pp_debt_")
}

// Провайдер ядра → код способа оплаты бэкенда (зеркало METHOD_PROVIDER в
// `backend/src/lib/payments/providers.ts`). null — провайдер не из наших.
export const paymentMethodByProvider = (
  providerId?: string | null
): "kaspi_qr" | "kaspi_transfer" | "debt" | null => {
  if (!providerId) {
    return null
  }
  if (isKaspi(providerId)) {
    return "kaspi_qr"
  }
  if (isTransfer(providerId)) {
    return "kaspi_transfer"
  }
  if (isDebt(providerId)) {
    return "debt"
  }
  return null
}

// Код способа оплаты → провайдер ядра (обратная сторона
// `paymentMethodByProvider`): нужен, чтобы взять иконку из `paymentInfoMap`.
export const paymentProviderByMethod: Record<
  "kaspi_qr" | "kaspi_transfer" | "debt",
  string
> = {
  kaspi_qr: "pp_kaspi_kaspi",
  kaspi_transfer: "pp_transfer_offline",
  debt: "pp_debt_offline",
}

// Ошибка выбора способа «продавец его не принимает»: бэкенд шлёт
// `payment_method_unavailable:<reason>:…`, medusaError делает первую букву
// заглавной. Возвращает код причины или null, если ошибка другая.
export const paymentMethodUnavailableReason = (
  message?: string | null
): string | null => {
  const match = /^payment_method_unavailable:([a-z_]+):/i.exec(message ?? "")
  return match ? match[1].toLowerCase() : null
}

// Add currencies that don't need to be divided by 100
export const noDivisionCurrencies = [
  "krw",
  "jpy",
  "vnd",
  "clp",
  "pyg",
  "xaf",
  "xof",
  "bif",
  "djf",
  "gnf",
  "kmf",
  "mga",
  "rwf",
  "xpf",
  "htg",
  "vuv",
  "xag",
  "xdr",
  "xau",
]
