import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { LOGISTICS_MODULE } from "../../modules/logistics"
import LogisticsModuleService from "../../modules/logistics/service"
import {
  TripStopStatus,
  TRIP_STOP_TRANSITIONS,
  TripStatus,
  TRIP_TRANSITIONS,
} from "../../modules/logistics/models/constants"
import { OrderStatusValue } from "../../modules/order-lifecycle/models/statuses"

// Правила поверхности рейсов водителя (T5.2b): чей это рейс, что на нём можно
// сделать и чем закончить точку выдачи. Живут ЗДЕСЬ, а не в роутах, по той же
// причине, что и правило пула (lib/orders/driver-pool.ts): «мои рейсы», статус
// рейса, статус точки и GPS-пинг обязаны отвечать на «это твой рейс?»
// одинаково — иначе водитель ведёт точку в рейсе, которого не видит в списке.

// Потолок списка «мои рейсы». Рейс gig-водителя — это один заказ (T5.2a), а не
// маршрут на день: за смену их единицы, история глубже не нужна.
export const DRIVER_TRIP_SCAN_CAP = 50

// Точка закрыта, когда её больше не ведут: заказ выдан или выдача провалена.
// Пока есть незакрытая — рейс не завершить.
const OPEN_STOP_STATUSES: TripStopStatus[] = ["pending", "arrived"]

// Статус заказа, из которого делают «выдано»: товар уже увезли со склада.
// Отгрузку (assembled → in_delivery) отмечает человек на складе при передаче
// груза водителю, а не водитель кнопкой в приложении (T5.2a).
const SHIPPED_STATUS: OrderStatusValue = "in_delivery"

// Почему точку выдачи нельзя закрыть. Разбирает роут — он же выбирает код
// ответа (идиома reason/message роутов водителя).
export type DeliveryRejection =
  | "order_not_shipped"
  | "no_fulfillment"
  | "invalid_delivery_code"

export type TripRecord = {
  id: string
  driver_id: string
  location_id: string
  status: string
  started_at: Date | null
  finished_at: Date | null
  note: string | null
}

export type TripStopRecord = {
  id: string
  trip_id: string
  order_id: string
  type: string
  sequence: number
  status: string
  address_snapshot: Record<string, unknown> | null
  proof: Record<string, unknown> | null
  note: string | null
}

// Сырая форма заказа из query.graph (link-поля типизируются генерацией
// .medusa/types — описываем явно, чтобы tsc от неё не зависел).
type RawOrder = {
  id: string
  display_id?: number | null
  fulfillments?:
    | {
        id: string
        canceled_at?: Date | string | null
        delivered_at?: Date | string | null
      }[]
    | null
  order_lifecycle?: {
    status?: string | null
    delivery_code?: string | null
  } | null
}

const logistics = (container: MedusaContainer) =>
  container.resolve<LogisticsModuleService>(LOGISTICS_MODULE)

// Мои рейсы, новые сверху: свежий рейс — тот, которым водитель занят сейчас.
export const listOwnTrips = async (
  container: MedusaContainer,
  driverId: string
): Promise<TripRecord[]> =>
  (await logistics(container).listTrips(
    { driver_id: driverId },
    { order: { created_at: "DESC" }, take: DRIVER_TRIP_SCAN_CAP }
  )) as TripRecord[]

// Мой рейс по id. null — чужой или не существует: для водителя это одно и то
// же, наличие чужого рейса не его дело (идиома require-own-order — 404).
export const findOwnTrip = async (
  container: MedusaContainer,
  driverId: string,
  tripId: string
): Promise<TripRecord | null> => {
  const [trip] = (await logistics(container).listTrips(
    { id: tripId, driver_id: driverId },
    { take: 1 }
  )) as TripRecord[]
  return trip ?? null
}

// Точки рейсов в порядке объезда.
export const listStopsOfTrips = async (
  container: MedusaContainer,
  tripIds: string[]
): Promise<TripStopRecord[]> => {
  if (!tripIds.length) {
    return []
  }
  return (await logistics(container).listTripStops(
    { trip_id: tripIds },
    { order: { sequence: "ASC" } }
  )) as TripStopRecord[]
}

// Точка ИМЕННО этого рейса: id точки приходит из URL, и без привязки к рейсу
// водитель закрывал бы своим токеном точку чужого рейса.
export const findTripStop = async (
  container: MedusaContainer,
  tripId: string,
  stopId: string
): Promise<TripStopRecord | null> => {
  const [stop] = (await logistics(container).listTripStops(
    { id: stopId, trip_id: tripId },
    { take: 1 }
  )) as TripStopRecord[]
  return stop ?? null
}

// Есть ли на рейсе незакрытые точки. Завершать рейс с необслуженной точкой
// нельзя: заказ остался бы «в доставке» без рейса, и продавец не узнал бы, что
// его не увезли.
export const hasOpenStops = async (
  container: MedusaContainer,
  tripId: string
): Promise<boolean> => {
  const open = await logistics(container).listTripStops(
    { trip_id: tripId, status: OPEN_STOP_STATUSES },
    { take: 1 }
  )
  return open.length > 0
}

// Переход по стейт-машине рейса/точки допустим? Проверяем ДО workflow, чтобы
// ответить водителю причиной («точка уже закрыта — обновите рейс»), а не
// техническим 400 от инварианта сервиса. Правило берём из таблиц переходов
// модуля, своей копии тут нет.
export const canMoveTrip = (from: string, to: TripStatus): boolean =>
  (TRIP_TRANSITIONS[from as TripStatus] ?? []).includes(to)

export const canMoveStop = (from: string, to: TripStopStatus): boolean =>
  (TRIP_STOP_TRANSITIONS[from as TripStopStatus] ?? []).includes(to)

// Заказ под отметку «выдано»: id fulfillment'а для ядрового вручения плюс
// проверка кода получения. Fulfillment водитель не знает и знать не должен —
// резолвим на сервере (правило «логика только в бэкенде»).
//
// Код сверяется здесь ТОЛЬКО ради понятной причины отказа: инвариант приёмки
// держит домен (assertDeliveryConfirmation в order-lifecycle) и остаётся
// последним словом — эта проверка его не заменяет.
export const resolveDeliveryTarget = async (
  container: MedusaContainer,
  input: { order_id: string; delivery_code?: string | null }
): Promise<
  | { fulfillment_id: string; rejection?: never }
  | { rejection: DeliveryRejection }
> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "fulfillments.id",
      "fulfillments.canceled_at",
      "fulfillments.delivered_at",
      "order_lifecycle.status",
      "order_lifecycle.delivery_code",
    ],
    filters: { id: input.order_id },
  })

  const order = (data as RawOrder[])[0]
  const lifecycle = order?.order_lifecycle
  if (lifecycle?.status !== SHIPPED_STATUS) {
    return { rejection: "order_not_shipped" }
  }

  const stored = lifecycle.delivery_code?.trim() || null
  const provided = input.delivery_code?.trim() || null
  if (!stored || !provided || stored !== provided) {
    return { rejection: "invalid_delivery_code" }
  }

  // Живой fulfillment: не отменённый и ещё не вручённый. Вручение ядро
  // отмечает именно по нему (markOrderFulfillmentAsDelivered).
  const fulfillment = (order.fulfillments ?? []).find(
    (item) => !item.canceled_at && !item.delivered_at
  )
  if (!fulfillment) {
    return { rejection: "no_fulfillment" }
  }

  return { fulfillment_id: fulfillment.id }
}

// Номер заказа точки рейса: для людей (ORG-26-0007) и технический display_id.
export type DriverOrderRef = { display_id: number | null; number: string | null }

// Номера заказов для точек рейса: водитель называет заказ так же, как продавец
// в панели («ORG-26-0007»), а не по order_01H….
export const loadOrderNumbers = async (
  container: MedusaContainer,
  orderIds: string[]
): Promise<Map<string, DriverOrderRef>> => {
  if (!orderIds.length) {
    return new Map()
  }
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "order",
    fields: ["id", "display_id", "order_lifecycle.number"],
    filters: { id: orderIds },
    pagination: { skip: 0, take: orderIds.length },
  })

  const numbers = new Map<string, DriverOrderRef>()
  for (const order of data as (RawOrder & {
    order_lifecycle?: { number?: string | null } | null
  })[]) {
    numbers.set(order.id, {
      display_id: typeof order.display_id === "number" ? order.display_id : null,
      number: order.order_lifecycle?.number ?? null,
    })
  }
  return numbers
}
