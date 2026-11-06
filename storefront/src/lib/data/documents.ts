"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

// Документы заказа для покупателя (счёт / накладная / АВР) — наш роут бэкенда
// GET /store/orders/:id/documents. Витрина только показывает список и даёт
// скачать PDF; генерирует документы бэкенд (модуль documents).
export type OrderDocumentType = "invoice" | "waybill" | "internal_avr"

export type OrderDocument = {
  id: string
  type: OrderDocumentType
  number: string
  version: number
  file_url?: string | null
  total_money?: number
  total_bonus?: number
  currency_code?: string
  created_at?: string | null
}

// Пустой список — штатный ответ (документы ещё не сгенерированы); ошибка
// доступа тоже отдаёт пусто, чтобы не рушить страницу заказа.
export async function listOrderDocuments(
  orderId: string
): Promise<OrderDocument[]> {
  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    const { documents } = await sdk.client.fetch<{
      documents: OrderDocument[]
    }>(`/store/orders/${orderId}/documents`, {
      method: "GET",
      headers,
      cache: "no-store",
    })

    return documents ?? []
  } catch {
    return []
  }
}

// Документ покупателя в общем списке кабинета: та же строка плюс заказ, из
// которого он вырос (по нему строка ведёт в карточку заказа).
export type MyDocument = OrderDocument & {
  order: { id: string; display_id?: number | null; number?: string | null }
}

// Все документы покупателя одним списком (кабинет, T10.6a): раздел «Документы»
// не должен требовать сначала вспомнить заказ. Ошибка доступа отдаёт пусто —
// раздел покажет пустое состояние, а не сломается.
export async function listMyDocuments(): Promise<MyDocument[]> {
  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    const { documents } = await sdk.client.fetch<{
      documents: MyDocument[]
    }>("/store/documents", {
      method: "GET",
      headers,
      cache: "no-store",
    })

    return documents ?? []
  } catch {
    return []
  }
}
