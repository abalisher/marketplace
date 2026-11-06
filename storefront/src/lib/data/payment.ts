"use server"

import { sdk } from "@lib/config"
import { FEATURE_KASPI_MOCK } from "@lib/feature-flags"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { getAuthHeaders, getCacheOptions, getCacheTag } from "./cookies"

export const listCartPaymentMethods = async (regionId: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("payment_providers")),
  }

  return sdk.client
    .fetch<HttpTypes.StorePaymentProviderListResponse>(
      `/store/payment-providers`,
      {
        method: "GET",
        query: { region_id: regionId },
        headers,
        next,
        cache: "force-cache",
      }
    )
    .then(({ payment_providers }) =>
      payment_providers.sort((a, b) => {
        return a.id > b.id ? 1 : -1
      })
    )
    .catch(() => {
      return null
    })
}

// Оплата Kaspi QR — наш кастомный роут бэкенда /store/carts/:id/payment/kaspi
// (не ядровый initiatePaymentSession: бэкенд сам создаёт collection + сессию
// с инвойсом и отдаёт QR/ссылку одним вызовом).
export type KaspiPayment = {
  payment_collection_id: string
  payment_session_id: string
  status:
    | "pending"
    | "requires_more"
    | "authorized"
    | "captured"
    | "canceled"
    | "error"
  kaspi_state: string | null
  qr_payload: string | null
  payment_url: string | null
}

// Инициализация оплаты Kaspi: инвойс + QR. Идемпотентен — повторный вызов
// возвращает существующую сессию. KASPI_MOCK_SCENARIO — только для dev с
// бэкендом в KASPI_MODE=mock (детерминированный исход оплаты); в live
// бэкенд сценарий игнорирует.
export async function initKaspiPayment(cartId: string): Promise<KaspiPayment> {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const scenario = process.env.KASPI_MOCK_SCENARIO

  return sdk.client
    .fetch<{ payment: KaspiPayment }>(`/store/carts/${cartId}/payment/kaspi`, {
      method: "POST",
      body: scenario ? { scenario } : {},
      headers,
    })
    .then(async ({ payment }) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
      return payment
    })
    .catch(medusaError)
}

// Статус оплаты Kaspi (поллинг): authorized/captured — оплачено, можно
// оформлять заказ. Кэш-теги не трогаем — вызывается раз в несколько секунд.
export async function getKaspiPaymentStatus(
  cartId: string
): Promise<KaspiPayment> {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<{ payment: KaspiPayment }>(`/store/carts/${cartId}/payment/kaspi`, {
      method: "GET",
      headers,
      cache: "no-store",
    })
    .then(({ payment }) => payment)
    .catch(medusaError)
}

// Тестовое подтверждение оплаты Kaspi (dev-канал мок-провайдера бэкенда).
// Только в сборке с NEXT_PUBLIC_KASPI_MOCK=true (lib/feature-flags.ts): server
// action вызываем и без кнопки, поэтому флаг проверяется и здесь.
export async function mockPayKaspi(cartId: string): Promise<KaspiPayment> {
  if (!FEATURE_KASPI_MOCK) {
    throw new Error("Kaspi mock payment is disabled in this build")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<{ payment: KaspiPayment }>(
      `/store/carts/${cartId}/payment/kaspi/mock-pay`,
      {
        method: "POST",
        headers,
      }
    )
    .then(async ({ payment }) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
      return payment
    })
    .catch(medusaError)
}

// Способы оплаты продавца (Kaspi QR, перевод на номер Kaspi, «в долг») —
// кастомные роуты бэкенда /store/carts/:id/payment-method и
// /store/orders/:id/payment. Какие способы доступны, решает продавец в своих
// настройках; витрина только показывает выбор и инструкции.
export type PaymentMethodCode = "kaspi_qr" | "kaspi_transfer" | "debt"

// Почему способ сейчас недоступен — код, подпись рисует витрина.
export type PaymentMethodUnavailableReason =
  | "disabled"
  | "kaspi_not_connected"
  | "transfer_no_phone"
  | "debt_over_limit"

// Способ оплаты продавца: доступен ли сейчас и почему нет.
export type PaymentMethodOption = {
  method: PaymentMethodCode
  available: boolean
  reason: PaymentMethodUnavailableReason | null
}

// Куда переводить: номер Kaspi продавца, получатель и его пометка.
export type TransferDetails = {
  phone: string
  recipient: string | null
  note: string | null
}

export type CartPaymentView = {
  // Сумма к оплате (после бонусов), тенге.
  amount: number
  currency_code: string
  methods: {
    method: PaymentMethodCode
    available: boolean
    reason: PaymentMethodUnavailableReason | null
  }[]
  selected: null | {
    method: PaymentMethodCode
    // Статус сессии ядра: pending | authorized | …
    status: string
    qr_payload: string | null
    payment_url: string | null
    kaspi_state: string | null
  }
  // Реквизиты перевода (если продавец принимает перевод).
  transfer: TransferDetails | null
  // Условия долга (если продавец принимает «в долг»).
  debt: null | { max_amount: number | null; term_days: number }
  // Kaspi QR оплачен либо выбран перевод/долг — заказ можно оформлять.
  ready_to_place: boolean
}

export type OrderPaymentStatus =
  | "awaiting"
  | "debt_requested"
  | "debt"
  | "paid"
  | "canceled"
  | "refund_due"
  | "refunded"

export type BuyerOrderPayment = {
  method: PaymentMethodCode | "bonus"
  status: OrderPaymentStatus
  currency_code: string
  amount: number
  paid_amount: number
  outstanding: number
  // Срок возврата долга (ISO), когда продавец его одобрил.
  due_date: string | null
  overdue: boolean
  // Номер заказа: покупатель пишет «Заказ №N» в комментарии к переводу.
  order_display_id: number | null
  // Номер для людей (ORG-26-0007); у заказов до 2026-11-02 — null.
  order_number?: string | null
  // Есть, пока деньги ещё должны продавцу (ждём перевод, одобренный долг).
  transfer: TransferDetails | null
  // Счёт Kaspi на заказ (способ сменён на Kaspi QR), пока не оплачен.
  // static — постоянный QR магазина: суммы в нём нет, покупатель вводит её
  // сам, оплату подтверждают чек и продавец.
  kaspi: {
    qr_payload: string | null
    payment_url: string | null
    static?: boolean
  } | null
  // На что можно сменить способ (пусто — сменить нельзя).
  change_options: PaymentMethodOption[]
  // Чек Kaspi можно прислать (перевод или долг, есть что платить).
  can_send_receipt: boolean
  receipts: BuyerPaymentReceipt[]
}

// Чек Kaspi, который покупатель прислал: статус проверки продавцом и —
// если чек не примут — почему.
export type BuyerPaymentReceipt = {
  id: string
  status: "pending" | "flagged" | "accepted" | "rejected"
  amount: number | null
  created_at: string | null
  problems: string[]
  review_note: string | null
}

// Способы оплаты корзины и выбранный способ. Гостю — по cart_id (как поллинг
// Kaspi), вошедшему покупателю — его корзина. Не кэшируем: сумма и выбор
// меняются вместе с корзиной.
export async function getCartPaymentMethods(
  cartId: string
): Promise<CartPaymentView> {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<{ payment: CartPaymentView }>(
      `/store/carts/${cartId}/payment-method`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    )
    .then(({ payment }) => payment)
    .catch(medusaError)
}

// Выбор способа оплаты. Kaspi QR выставляет счёт (QR и ссылка), перевод и долг
// только запоминают выбор — заказ оформится сразу. KASPI_MOCK_SCENARIO — как
// в initKaspiPayment (dev-стенд с мок-Kaspi, в live игнорируется).
export async function selectCartPaymentMethod(
  cartId: string,
  method: PaymentMethodCode
): Promise<CartPaymentView> {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const scenario =
    method === "kaspi_qr" ? process.env.KASPI_MOCK_SCENARIO : undefined

  return sdk.client
    .fetch<{ payment: CartPaymentView }>(
      `/store/carts/${cartId}/payment-method`,
      {
        method: "POST",
        body: scenario ? { method, scenario } : { method },
        headers,
      }
    )
    .then(async ({ payment }) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
      return payment
    })
    .catch(medusaError)
}

// Оплата своего заказа: способ, сколько осталось, куда переводить и срок
// долга. null — заказ оформлен до появления способов оплаты (оплачен Kaspi
// QR) либо прочитать не удалось: тогда страница рисует оплату по-старому.
export async function getOrderPayment(
  orderId: string
): Promise<BuyerOrderPayment | null> {
  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    const { payment } = await sdk.client.fetch<{
      payment: BuyerOrderPayment | null
    }>(`/store/orders/${orderId}/payment`, {
      method: "GET",
      headers,
      cache: "no-store",
    })

    return payment ?? null
  } catch {
    return null
  }
}

// Сменить способ оплаты оформленного заказа (пока продавец не подтвердил его и
// денег не было). Ошибку отдаём текстом: сообщения server action продакшен
// Next скрывает.
export async function changeOrderPaymentMethod(
  orderId: string,
  method: PaymentMethodCode
): Promise<{ payment: BuyerOrderPayment | null } | { error: string }> {
  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    const { payment } = await sdk.client.fetch<{
      payment: BuyerOrderPayment | null
    }>(`/store/orders/${orderId}/payment`, {
      method: "POST",
      headers,
      body: { method },
    })
    return { payment }
  } catch (error) {
    return { error: (error as Error)?.message ?? "" }
  }
}

// Тестовая оплата счёта Kaspi заказа (стенд, NEXT_PUBLIC_KASPI_MOCK=true).
export async function mockPayOrderKaspi(
  orderId: string
): Promise<BuyerOrderPayment | null> {
  if (!FEATURE_KASPI_MOCK) {
    throw new Error("Kaspi mock payment is disabled in this build")
  }
  const headers = {
    ...(await getAuthHeaders()),
  }
  const { payment } = await sdk.client.fetch<{
    payment: BuyerOrderPayment | null
  }>(`/store/orders/${orderId}/payment/mock-pay`, { method: "POST", headers })
  return payment
}
