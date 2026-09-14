import { z } from "@medusajs/framework/zod"

// Профиль, который водитель заполняет о себе сам (T5.1). Все поля
// необязательны: приложение шлёт то, что человек ввёл на шаге, а не весь
// профиль целиком; `null` очищает значение. Нормализация (пробелы, регистр
// госномера) — в сервисе модуля, здесь только границы.
export const DriverUpdateProfile = z
  .object({
    full_name: z.string().trim().min(2).max(120).nullish(),
    vehicle_model: z.string().trim().min(2).max(120).nullish(),
    vehicle_plate: z.string().trim().min(3).max(20).nullish(),
    capacity_kg: z.coerce.number().int().min(1).max(50000).nullish(),
  })
  .refine((body) => Object.keys(body).length > 0, {
    message: "Нечего сохранять: пришлите хотя бы одно поле профиля",
  })
export type DriverUpdateProfileType = z.infer<typeof DriverUpdateProfile>
