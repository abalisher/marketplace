"use server"

import { sdk } from "@lib/config"
import { revalidatePath } from "next/cache"
import { getAuthHeaders } from "./cookies"

// Отзыв покупателя по заказу: две оценки — товар и продавец (supplier) и
// доставка (delivery). Право оставить (свой доставленный или закрытый заказ,
// по одному отзыву на объект) проверяет бэкенд.
export type OrderReviewTarget = "supplier" | "delivery"

export type OrderReview = {
  id: string
  target: OrderReviewTarget
  rating: number
  comment: string | null
  created_at?: string
}

// Свои отзывы по заказу. Ошибка — пустой список: блок предложит оценить.
export async function listOrderReviews(orderId: string): Promise<OrderReview[]> {
  try {
    const { reviews } = await sdk.client.fetch<{ reviews: OrderReview[] }>(
      `/store/orders/${orderId}/reviews`,
      { method: "GET", headers: { ...(await getAuthHeaders()) }, cache: "no-store" }
    )
    return reviews ?? []
  } catch {
    return []
  }
}

export async function createOrderReview(
  orderId: string,
  input: { target: OrderReviewTarget; rating: number; comment?: string }
): Promise<OrderReview> {
  const { review } = await sdk.client.fetch<{ review: OrderReview }>(
    `/store/orders/${orderId}/reviews`,
    {
      method: "POST",
      headers: { ...(await getAuthHeaders()) },
      body: input,
      cache: "no-store",
    }
  )
  // Страницу заказа из клиентского кэша — долой: вернувшись на неё, покупатель
  // должен увидеть свой отзыв, а не снова пустую форму.
  revalidatePath("/[countryCode]/(chat)/cabinet/orders/[id]", "page")
  return review
}
