"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

// Бизнес-стадия заказа (модуль order-lifecycle бэкенда) — единственное поле
// статуса, которое читает витрина: склейка трёх ядровых статусов
// (status / fulfillment_status / payment_status) покупателю ничего не говорит.
export type OrderLifecycle = {
  order_id: string
  // Номер для людей (ORG-26-0007); у заказов до 2026-11-02 — null.
  number?: string | null
  status: string
  previous_status?: string | null
  delivery_method?: "pickup" | "delivery" | null
  delivery_code?: string | null
  // Слот доставки (T5.6): дата в сутках Астаны + код окна приезда. Подпись
  // «6 сент., 13:00–17:00» собирает клиент — `lib/util/delivery-slot.ts`.
  delivery_date?: string | null
  delivery_window?: string | null
  // Лог переходов (GET /store/orders/:id/lifecycle): когда заказ дошёл до
  // какой стадии — по нему кабинет рисует ход заказа.
  history?: OrderLifecycleEvent[]
}

export type OrderLifecycleEvent = {
  kind?: "status" | "reschedule" | string
  to_status: string
  actor_type?: string | null
  created_at: string
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

// Покупатель отменяет свой заказ, пока продавец его не подтвердил (бэкенд
// отказывает подтверждённому). Ошибку отдаём текстом — кнопка покажет её.
export async function cancelMyOrder(
  orderId: string,
  reason: string | null
): Promise<{ ok: true } | { ok: false; message: string }> {
  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    await sdk.client.fetch(`/store/orders/${orderId}/cancel`, {
      method: "POST",
      headers,
      body: reason ? { reason } : {},
    })
    return { ok: true }
  } catch (error) {
    return { ok: false, message: (error as Error)?.message ?? "" }
  }
}
