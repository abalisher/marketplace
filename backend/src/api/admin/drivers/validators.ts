import { z } from "@medusajs/framework/zod"
import { DRIVER_STATUSES } from "../../../modules/driver/models/constants"

// Фильтр статуса принимает одно значение или несколько (список повторяющимся
// параметром `status=a&status=b` или через запятую) — идиома очередей заказов,
// претензий и заданий сборки.
const DriverStatusFilter = z.preprocess(
  (value) => (typeof value === "string" ? value.split(",") : value),
  z.union([
    z.enum(DRIVER_STATUSES),
    z.array(z.enum(DRIVER_STATUSES)).min(1),
  ])
)

// Очередь заявок водителей: фильтр допуска, поиск по номеру/ФИО + пагинация.
export const AdminGetDriversParams = z.object({
  status: DriverStatusFilter.optional(),
  q: z.string().trim().min(2).max(64).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})
export type AdminGetDriversParamsType = z.infer<typeof AdminGetDriversParams>

// Решение продавца по заявке: допустить к работе или закрыть доступ (отказ по
// заявке и блокировка — одно состояние, различает их причина). Вернуть
// водителя в «ожидает проверки» нельзя: это состояние заводит сама
// регистрация.
export const AdminSetDriverStatus = z.object({
  status: z.enum(["active", "blocked"]),
  note: z.string().trim().min(1).max(500).optional(),
})
export type AdminSetDriverStatusType = z.infer<typeof AdminSetDriverStatus>
