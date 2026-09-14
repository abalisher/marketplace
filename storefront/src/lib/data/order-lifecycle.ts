"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

// Бизнес-стадия заказа (модуль order-lifecycle бэкенда) — единственное поле
// статуса, которое читает витрина: склейка трёх ядровых статусов
// (status / fulfillment_status / payment_status) покупателю ничего не говорит.
export type OrderLifecycle = {
  order_id: string
  status: string
  previous_status?: string | null
  delivery_method?: "pickup" | "delivery" | null
  delivery_code?: string | null
  // Слот доставки (T5.6): дата в сутках Астаны + код окна приезда. Подпись
  // «6 сент., 13:00–17:00» собирает клиент — `lib/util/delivery-slot.ts`.
  delivery_date?: string | null
  delivery_window?: string | null
}

// Стадии ВСЕХ заказов покупателя одним запросом (кабинет, T10.6a): список
// заказов показывает бейдж стадии, а ядровый /store/orders её не знает.
// Ошибка или отсутствие цикла — пустой список: заказы покажем без бейджа.
export async function listMyOrderLifecycles(): Promise<OrderLifecycle[]> {
  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    const { lifecycles } = await sdk.client.fetch<{
      lifecycles: OrderLifecycle[]
    }>("/store/order-lifecycles", {
      method: "GET",
      headers,
      cache: "no-store",
    })

    return lifecycles ?? []
  } catch {
    return []
  }
}

// Стадия одного заказа: нужна карточке заказа ради кода получения (его знает
// только покупатель — по нему водитель отдаёт груз).
export async function retrieveOrderLifecycle(
  orderId: string
): Promise<OrderLifecycle | null> {
  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    const lifecycle = await sdk.client.fetch<
      OrderLifecycle & { status: string | null }
    >(`/store/orders/${orderId}/lifecycle`, {
      method: "GET",
      headers,
      cache: "no-store",
    })

    return lifecycle?.status ? { ...lifecycle, order_id: orderId } : null
  } catch {
    return null
  }
}
