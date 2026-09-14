import { z } from "@medusajs/framework/zod"

// Zod-схемы store-роутов заказа. Подключаются в src/api/middlewares.ts через
// validateAndTransformBody; роуты читают req.validatedBody.

// Оформление заказа: покупатель завершает свою корзину. Сквозная логика
// (completeCart + резерв + жизненный цикл) — в placeOrderWorkflow.
// После пивота 2026-07-22 единственный способ получения — доставка (самовывоз
// и продажа у окна сняты). Поле оставлено с фиксированным enum как точка
// расширения; всегда defaults to "delivery".
export const StorePlaceOrder = z.object({
  cart_id: z.string().min(1),
  delivery_method: z.enum(["delivery"]).default("delivery"),
})
export type StorePlaceOrderType = z.infer<typeof StorePlaceOrder>

// Отмена своего заказа покупателем (разрешена стейт-машиной только до отгрузки).
// Причина опциональна — покупатель может не указывать.
export const StoreCancelOrder = z.object({
  reason: z.string().trim().min(1).optional(),
})
export type StoreCancelOrderType = z.infer<typeof StoreCancelOrder>

// Отзыв покупателя по заказу (рейтинг поставщика/доставки раздельно). Право
// оставить (доставленный/закрытый свой заказ; delivery — только delivery) —
// гейт в createReviewWorkflow; границы оценки дублирует сервис модуля.
export const StoreCreateReview = z.object({
  target: z.enum(["supplier", "delivery"]),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(1).max(2000).optional(),
})
export type StoreCreateReviewType = z.infer<typeof StoreCreateReview>

// Открытие диспута «проблема с заказом» покупателем.
export const StoreOpenDispute = z.object({
  category: z.enum([
    "not_delivered",
    "damaged",
    "wrong_item",
    "quality",
    "other",
  ]),
  description: z.string().trim().min(1).max(4000),
})
export type StoreOpenDisputeType = z.infer<typeof StoreOpenDispute>
