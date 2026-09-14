"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { getAuthHeaders } from "./cookies"
import { HttpTypes } from "@medusajs/types"

// Заказы НЕ кэшируем (T3.9). Стартер держал их с `cache: "force-cache"` и тегом
// `orders`, а инвалидировал тег только свой чекаут-экшен. После пивота заказ
// оформляет БЭКЕНД (ассистент в чате), инвалидировать тег из витрины некому — и
// «Аккаунт → Заказы» показывали «пусто» даже после жёсткой перезагрузки
// (блокер Б3 прогона 2026-08-13). Статус, документы и оплата меняются на стороне
// продавца, поэтому свежесть здесь важнее экономии запроса.
export const retrieveOrder = async (id: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<HttpTypes.StoreOrderResponse>(`/store/orders/${id}`, {
      method: "GET",
      query: {
        // *credit_lines — чтобы на подтверждении заказа показать строку
        // «оплачено бонусами» и тотал с её учётом.
        fields:
          "*payment_collections.payments,*items,*items.metadata,*items.variant,*items.product,*credit_lines",
      },
      headers,
      cache: "no-store",
    })
    .then(({ order }) => order)
    .catch((err) => medusaError(err))
}

export const listOrders = async (
  limit: number = 10,
  offset: number = 0,
  filters?: Record<string, any>
) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<HttpTypes.StoreOrderListResponse>(`/store/orders`, {
      method: "GET",
      query: {
        limit,
        offset,
        order: "-created_at",
        fields: "*items,+items.metadata,*items.variant,*items.product",
        ...filters,
      },
      headers,
      cache: "no-store",
    })
    .then(({ orders }) => orders)
    .catch((err) => medusaError(err))
}

// Запрос переноса заказа (`createTransferRequest`) удалён вместе с формой
// «Перенос заказов» в T3.9. Приём и отказ ниже оставлены: ссылки на них
// приходят покупателю письмом от ядра.
export const acceptTransferRequest = async (id: string, token: string) => {
  const headers = await getAuthHeaders()

  return await sdk.store.order
    .acceptTransfer(id, { token }, {}, headers)
    .then(({ order }) => ({ success: true, error: null, order }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}

export const declineTransferRequest = async (id: string, token: string) => {
  const headers = await getAuthHeaders()

  return await sdk.store.order
    .declineTransfer(id, { token }, {}, headers)
    .then(({ order }) => ({ success: true, error: null, order }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}
