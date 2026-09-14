import { MedusaError } from "@medusajs/framework/utils"

// Статусы рейса водителя: запланирован → погрузка → в пути → завершён; отмена
// из любого незавершённого. Терминальные (completed/canceled) — без исходящих.
export const TRIP_STATUSES = [
  "planned",
  "loading",
  "en_route",
  "completed",
  "canceled",
] as const
export type TripStatus = (typeof TRIP_STATUSES)[number]

export const TRIP_TRANSITIONS: Record<TripStatus, TripStatus[]> = {
  planned: ["loading", "en_route", "canceled"],
  loading: ["en_route", "canceled"],
  en_route: ["completed", "canceled"],
  completed: [],
  canceled: [],
}

// Тип точки рейса: выдача заказа или забор возврата (ТЗ 4.8–4.9).
export const TRIP_STOP_TYPES = ["delivery", "return_pickup"] as const
export type TripStopType = (typeof TRIP_STOP_TYPES)[number]

// Статусы точки: ожидает → прибыл → выполнено; неудача из ожидания/прибытия.
export const TRIP_STOP_STATUSES = [
  "pending",
  "arrived",
  "done",
  "failed",
] as const
export type TripStopStatus = (typeof TRIP_STOP_STATUSES)[number]

export const TRIP_STOP_TRANSITIONS: Record<TripStopStatus, TripStopStatus[]> = {
  pending: ["arrived", "failed"],
  arrived: ["done", "failed"],
  done: [],
  failed: [],
}

// Код отказа «точка по этому заказу уже есть»: заказ взял другой водитель
// (gig-пул, T5.2a) или диспетчер уже поставил его в рейс. Уникальность держит
// БД, а роут по этому коду отвечает 409 — сообщение MedusaError с типом
// CONFLICT ядро подменяет своим текстом про Idempotency-Key, поэтому тип
// оставляем NOT_ALLOWED, а различает случай именно код.
export const ORDER_STOP_TAKEN = "order_stop_taken"

// Чистые проверки переходов — standalone-функции, НЕ методы сервиса (правило
// @medusajs/service-methods-must-be-async; идиома reviews assertDisputeTransition).
// Переиспользуются сервисом и workflow-шагами (подзадача 2).
export const assertTripTransition = (
  from: TripStatus,
  to: TripStatus
): void => {
  if (!TRIP_TRANSITIONS[from].includes(to)) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `Trip transition ${from} → ${to} is not allowed`
    )
  }
}

export const assertTripStopTransition = (
  from: TripStopStatus,
  to: TripStopStatus
): void => {
  if (!TRIP_STOP_TRANSITIONS[from].includes(to)) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `Trip stop transition ${from} → ${to} is not allowed`
    )
  }
}

// Чистый расчёт стоимости доставки по тарифу: база + вес×ставка + объём×ставка.
// Цены в минорных единицах (тенге). Результат округляется вверх (в пользу
// продавца). Вес/объём берутся из карточек товара заказа (снаружи, workflow —
// подзадача 2). Standalone-функция (как calculateMaterialQuantity estimator).
export const calculateDeliveryCost = (input: {
  base_price: number
  price_per_kg: number
  price_per_m3: number
  weight_kg?: number
  volume_m3?: number
}): number => {
  const weight = Math.max(0, input.weight_kg ?? 0)
  const volume = Math.max(0, input.volume_m3 ?? 0)
  const cost =
    input.base_price + input.price_per_kg * weight + input.price_per_m3 * volume
  return Math.ceil(Math.max(0, cost))
}
