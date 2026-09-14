import { z } from "@medusajs/framework/zod"

// Валидаторы поверхности рейсов водителя (T5.2b). От admin-валидаторов
// логистики отличаются НАРОЧНО: водителю разрешено меньше, и часть полей он
// вообще не передаёт (driver_id — из токена, fulfillment_id — резолвит сервер).

// Статусы рейса, которые ставит сам водитель: погрузка → в пути → завершён.
// `canceled` водителю недоступен — отказ от рейса и переназначение остаются
// диспетчеру (T5.2c): «отменил рейс» в gig-модели означает «заказ надо кому-то
// передать», и решает это продавец, а не тот, кто передумал.
export const DRIVER_TRIP_STATUSES = ["loading", "en_route", "completed"] as const

// Статусы точки, которые ставит водитель: приехал → выдал (или не смог).
// `pending` — начальное состояние точки, вернуть точку в него нельзя.
export const DRIVER_STOP_STATUSES = ["arrived", "done", "failed"] as const

export const DriverSetTripStatus = z.object({
  status: z.enum(DRIVER_TRIP_STATUSES),
})
export type DriverSetTripStatusType = z.infer<typeof DriverSetTripStatus>

// Подтверждение выдачи: фото груза у покупателя и/или подпись. Фото —
// доказательство состояния товара в споре («привезли битое»), код получения
// доказывает только сам факт приёмки, поэтому одно другое не заменяет.
const DriverStopProof = z.object({
  photos: z.array(z.string().trim().min(1)).min(1).max(5).optional(),
  signature: z.string().trim().min(1).optional(),
})

// Перевод точки + доказательства. Кросс-проверки полей — здесь, а не в роуте:
// «выдано» без кода получения или без фото и «не смог» без причины не должны
// доходить до домена.
export const DriverSetStopStatus = z
  .object({
    status: z.enum(DRIVER_STOP_STATUSES),
    proof: DriverStopProof.optional(),
    // Код называет покупатель при получении — водитель его вводит.
    delivery_code: z.string().trim().min(1).optional(),
    note: z.string().trim().min(1).max(2000).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.status === "done") {
      if (!value.delivery_code) {
        ctx.addIssue({
          code: "custom",
          path: ["delivery_code"],
          message: "delivery_code is required to complete a stop",
        })
      }
      if (!value.proof?.photos?.length && !value.proof?.signature) {
        ctx.addIssue({
          code: "custom",
          path: ["proof"],
          message: "proof (photo or signature) is required to complete a stop",
        })
      }
    }
    if (value.status === "failed" && !value.note) {
      ctx.addIssue({
        code: "custom",
        path: ["note"],
        message: "note is required to fail a stop",
      })
    }
  })
export type DriverSetStopStatusType = z.infer<typeof DriverSetStopStatus>

// GPS-пинг: только координаты. Водитель пингует за СЕБЯ — driver_id идёт из
// токена (в admin-валидаторе он в теле, потому что там пинги льёт диспетчер).
export const DriverRecordGpsPing = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})
export type DriverRecordGpsPingType = z.infer<typeof DriverRecordGpsPing>
