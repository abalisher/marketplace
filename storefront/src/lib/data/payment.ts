"use server"

import { sdk } from "@lib/config"
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
