"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getAuthHeaders } from "./cookies"

// Поля корзины для кабинета: позиции с вариантом и товаром, регион и кредитные
// линии (без них ядро считает total без вычета бонусов — эмпирика Medusa 2.17.2).
const CART_FIELDS =
  "*items, *region, *items.product, *items.variant, *items.thumbnail, +items.total, *credit_lines"

// Текущая корзина покупателя для кабинета (T10.6). Корзину собирает АССИСТЕНТ,
// и её id живёт в состоянии диалога — на другом устройстве раздел «Корзина» о
// ней бы не знал. Поэтому корзину находит бэкенд (GET /store/carts/me), а
// содержимое читаем ядровым роутом по возвращённому id. Кэша нет: корзину
// меняет ассистент на стороне бэкенда, инвалидировать тег витрине некому
// (та же причина, что у заказов в orders.ts).
export async function retrieveMyCart(): Promise<HttpTypes.StoreCart | null> {
  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    const { cart_id } = await sdk.client.fetch<{ cart_id: string | null }>(
      "/store/carts/me",
      { method: "GET", headers, cache: "no-store" }
    )

    if (!cart_id) {
      return null
    }

    const { cart } = await sdk.client.fetch<HttpTypes.StoreCartResponse>(
      `/store/carts/${cart_id}`,
      {
        method: "GET",
        query: { fields: CART_FIELDS },
        headers,
        cache: "no-store",
      }
    )

    return cart ?? null
  } catch {
    return null
  }
}
