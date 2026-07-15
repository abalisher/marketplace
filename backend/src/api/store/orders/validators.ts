import { z } from "@medusajs/framework/zod"

// Zod-схемы store-роутов заказа. Подключаются в src/api/middlewares.ts через
// validateAndTransformBody; роуты читают req.validatedBody.

// Оформление заказа: покупатель завершает свою корзину. Сквозная логика
// (completeCart + резерв + жизненный цикл) — в placeOrderWorkflow.
export const StorePlaceOrder = z.object({
  cart_id: z.string().min(1),
})
export type StorePlaceOrderType = z.infer<typeof StorePlaceOrder>

// Отмена своего заказа покупателем (разрешена стейт-машиной только до отгрузки).
// Причина опциональна — покупатель может не указывать.
export const StoreCancelOrder = z.object({
  reason: z.string().trim().min(1).optional(),
})
export type StoreCancelOrderType = z.infer<typeof StoreCancelOrder>
