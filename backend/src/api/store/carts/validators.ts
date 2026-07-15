import { z } from "@medusajs/framework/zod"

// Zod-схемы store-роутов оплаты корзины. Подключаются в src/api/middlewares.ts.

// Инициализация оплаты Kaspi. `scenario` — ТОЛЬКО для мока (dev/тесты):
// детерминированный исход оплаты инвойса; live-транспорт его игнорирует.
export const StoreInitKaspiPayment = z.object({
  scenario: z.enum(["pending", "paid", "canceled", "error"]).optional(),
})
export type StoreInitKaspiPaymentType = z.infer<typeof StoreInitKaspiPayment>
