import { z } from "@medusajs/framework/zod"
import {
  TRIP_STATUSES,
  TRIP_STOP_STATUSES,
  TRIP_STOP_TYPES,
} from "../../../modules/logistics/models/constants"

// Валидаторы admin API логистики (подзадача 2). Пока водитель работает как
// admin-user, операции рейса/точек/GPS/тарифов идут через /admin/*. Отдельный
// gig-actor /driver/* возвращается отдельной задачей пивота (см. docs/STATE.md).

// Создать рейс: водитель (ядровый user/сотрудник) + склад загрузки.
export const AdminCreateTrip = z.object({
  driver_id: z.string().trim().min(1),
  location_id: z.string().trim().min(1),
  note: z.string().trim().min(1).max(2000).nullable().optional(),
})
export type AdminCreateTripType = z.infer<typeof AdminCreateTrip>

// Перевод рейса по стейт-машине (инвариант перехода проверит workflow-шаг).
export const AdminSetTripStatus = z.object({
  status: z.enum(TRIP_STATUSES),
})
export type AdminSetTripStatusType = z.infer<typeof AdminSetTripStatus>

// Добавить точку рейса (выдача/возврат). Порядок — вручную (MVP).
export const AdminAddTripStop = z.object({
  order_id: z.string().trim().min(1),
  type: z.enum(TRIP_STOP_TYPES).optional(),
  sequence: z.number().int().min(0).optional(),
  address_snapshot: z.record(z.string(), z.unknown()).nullable().optional(),
})
export type AdminAddTripStopType = z.infer<typeof AdminAddTripStop>

// Перевод точки по стейт-машине + proof (фото/подпись выдачи) / checklist
// (осмотр возврата). Для завершения delivery-точки (status=done, type=delivery)
// можно передать fulfillment_id + delivery_code — тогда workflow триггерит
// существующий deliver-order (order-lifecycle → delivered по коду покупателя).
export const AdminSetTripStopStatus = z.object({
  status: z.enum(TRIP_STOP_STATUSES),
  proof: z.record(z.string(), z.unknown()).nullable().optional(),
  checklist: z.record(z.string(), z.unknown()).nullable().optional(),
  note: z.string().trim().min(1).max(2000).nullable().optional(),
  fulfillment_id: z.string().trim().min(1).optional(),
  delivery_code: z.string().trim().min(1).optional(),
})
export type AdminSetTripStopStatusType = z.infer<typeof AdminSetTripStopStatus>

// Принять GPS-пинг водителя (append в поток).
export const AdminRecordGpsPing = z.object({
  driver_id: z.string().trim().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})
export type AdminRecordGpsPingType = z.infer<typeof AdminRecordGpsPing>

// Создание/правка тарифа доставки (upsert по zone). Цены в минорных единицах
// (тенге); ставки за вес/объём неотрицательны.
export const AdminUpsertDeliveryTariff = z.object({
  zone: z.string().trim().min(1).max(128),
  base_price: z.number().min(0),
  price_per_kg: z.number().min(0),
  price_per_m3: z.number().min(0),
  active: z.boolean().optional(),
})
export type AdminUpsertDeliveryTariffType = z.infer<
  typeof AdminUpsertDeliveryTariff
>
