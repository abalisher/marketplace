import { z } from "@medusajs/framework/zod"

// Zod-схемы admin-роутов POS-корзины (продажа у окна склада, partner-app).
// Подключаются в src/api/middlewares.ts; роуты читают req.validatedBody.

// Создание POS-корзины: склад продавца обязателен (его pickup-опция и адрес),
// регион — только при нескольких регионах, email — если покупатель хочет
// письмо о заказе (иначе служебный, см. create-counter-cart).
export const AdminCreateCounterCart = z.object({
  location_id: z.string().min(1),
  region_id: z.string().min(1).optional(),
  email: z.string().email().optional(),
  // Телефон покупателя — привязка POS-заказа к покупателю (гэп 3 сверки).
  phone: z.string().trim().min(3).max(32).optional(),
})
export type AdminCreateCounterCartType = z.infer<typeof AdminCreateCounterCart>

// Добавление позиции: повторное добавление того же варианта ядро суммирует.
export const AdminAddCounterCartItem = z.object({
  variant_id: z.string().min(1),
  quantity: z.number().int().positive(),
})
export type AdminAddCounterCartItemType = z.infer<
  typeof AdminAddCounterCartItem
>

// Смена количества позиции (удаление — отдельный DELETE-роут).
export const AdminUpdateCounterCartItem = z.object({
  quantity: z.number().int().positive(),
})
export type AdminUpdateCounterCartItemType = z.infer<
  typeof AdminUpdateCounterCartItem
>

// Инициализация Kaspi-оплаты POS-корзины. `scenario` — ТОЛЬКО для мока
// (dev/тесты), как в store-варианте; live-транспорт игнорирует.
export const AdminInitCounterCartKaspiPayment = z.object({
  scenario: z.enum(["pending", "paid", "canceled", "error"]).optional(),
})
export type AdminInitCounterCartKaspiPaymentType = z.infer<
  typeof AdminInitCounterCartKaspiPayment
>
