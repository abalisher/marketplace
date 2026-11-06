import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { geoFromMetadata } from "../geo"
import { LOGISTICS_MODULE } from "../../modules/logistics"
import LogisticsModuleService from "../../modules/logistics/service"
import { OrderStatusValue } from "../../modules/order-lifecycle/models/statuses"

// Пул заказов водителя-gig (T5.2a): какие заказы водитель видит свободными и
// какой из них ему разрешено взять себе. Правило живёт ЗДЕСЬ, а не в роутах:
// список пула и проверка одного заказа при «взять» обязаны отвечать одинаково —
// иначе водитель видел бы в списке заказ, который на claim'е отвергается.
//
// В пул попадает ТОЛЬКО полностью собранный заказ с доставкой. Частично
// собранный не попадает намеренно: везти его как есть или ждать добора — решение
// продавца (см. стадию shortage экрана отгрузки), и такой заказ назначает
// диспетчер из панели, а не водитель из пула.
export const DRIVER_POOL_STATUSES: OrderStatusValue[] = ["assembled"]

// Потолок просмотра пула. Пул — рабочий экран «что можно взять прямо сейчас»,
// а не журнал: собранных и не увезённых заказов единицы-десятки.
export const DRIVER_POOL_SCAN_CAP = 100

// Адрес доставки снапшотом на точке рейса: после «взять» водитель везёт по
// тому адресу, который был в заказе в момент claim'а, и не перечитывает заказ
// на каждом экране. Телефон и имя получателя здесь есть — они нужны на выдаче.
export type OrderAddressSnapshot = {
  first_name: string | null
  last_name: string | null
  phone: string | null
  address_1: string | null
  address_2: string | null
  city: string | null
  postal_code: string | null
  province: string | null
  country_code: string | null
  // Точка на карте, если покупатель выбирал адрес на карте 2ГИС: по ней
  // водитель открывает навигацию прямо к дому, а не «к улице вообще».
  lat?: number | null
  lng?: number | null
}

// Заказ пула. Личных данных получателя (имя, телефон) здесь НЕТ: пул видят все
// допущенные водители, а контакты нужны только тому, кто заказ взял, — они
// уезжают в address_snapshot точки и открываются водителю в его рейсе (T5.2b).
export type DriverPoolOrder = {
  order_id: string
  display_id: number | null
  // Номер для людей (ORG-26-0007); у заказов до 2026-11-02 — null.
  order_number: string | null
  created_at: string | null
  // Улица с уточнением одной строкой; город отдельно — по нему водитель
  // прикидывает плечо.
  address: string | null
  city: string | null
  items_count: number
  total_quantity: number
  // Склад загрузки — из живого fulfillment'а заказа. Заказ без него взять
  // нельзя: рейсу неоткуда грузиться.
  location_id: string
  address_snapshot: OrderAddressSnapshot
}

// Почему заказ взять нельзя. Разбирает не клиент, а роут — он же выбирает код
// ответа (идиома `reason`/`message` роутов входа водителя).
export type ClaimRejection = "not_found" | "not_ready" | "already_taken"

// Сырая форма заказа из query.graph (link-поля типизируются генерацией
// .medusa/types — описываем явно, чтобы tsc от неё не зависел).
type RawOrder = {
  id: string
  display_id?: number | null
  created_at?: string | Date | null
  items?: { id: string; quantity?: unknown }[] | null
  shipping_address?: Record<string, unknown> | null
  fulfillments?:
    | {
        id: string
        location_id?: string | null
        canceled_at?: Date | string | null
        shipped_at?: Date | string | null
      }[]
    | null
  order_lifecycle?: {
    number?: string | null
    status?: string | null
    delivery_method?: string | null
  } | null
}

const ORDER_FIELDS = [
  "id",
  "display_id",
  "order_lifecycle.number",
  "created_at",
  "items.id",
  "items.quantity",
  "shipping_address.first_name",
  "shipping_address.last_name",
  "shipping_address.phone",
  "shipping_address.address_1",
  "shipping_address.address_2",
  "shipping_address.city",
  "shipping_address.postal_code",
  "shipping_address.province",
  "shipping_address.country_code",
  "shipping_address.metadata",
  "fulfillments.id",
  "fulfillments.location_id",
  "fulfillments.canceled_at",
  "fulfillments.shipped_at",
]

const iso = (value: string | Date | null | undefined): string | null => {
  if (!value) {
    return null
  }
  return value instanceof Date ? value.toISOString() : value
}

const text = (value: unknown): string | null => {
  const trimmed = typeof value === "string" ? value.trim() : ""
  return trimmed || null
}

// Склад загрузки: живой (не отменённый) и ещё не отгруженный fulfillment. То же
// правило, что у цели «передать водителю» на экране отгрузки — рейс грузится
// оттуда, откуда заказ собран.
const pickupLocation = (order: RawOrder): string | null => {
  for (const fulfillment of order.fulfillments ?? []) {
    if (fulfillment.canceled_at || fulfillment.shipped_at) {
      continue
    }
    if (fulfillment.location_id) {
      return fulfillment.location_id
    }
  }
  return null
}

const addressSnapshot = (order: RawOrder): OrderAddressSnapshot => {
  const address = order.shipping_address ?? {}
  const geo = geoFromMetadata(
    (address as { metadata?: Record<string, unknown> | null }).metadata
  )
  return {
    lat: geo?.lat ?? null,
    lng: geo?.lng ?? null,
    first_name: text(address.first_name),
    last_name: text(address.last_name),
    phone: text(address.phone),
    address_1: text(address.address_1),
    address_2: text(address.address_2),
    city: text(address.city),
    postal_code: text(address.postal_code),
    province: text(address.province),
    country_code: text(address.country_code),
  }
}

// Заказ пула из сырой строки. null — заказ взять нельзя (нет склада загрузки).
const toPoolOrder = (order: RawOrder): DriverPoolOrder | null => {
  const location_id = pickupLocation(order)
  if (!location_id) {
    return null
  }

  const snapshot = addressSnapshot(order)
  const items = order.items ?? []

  return {
    order_id: order.id,
    display_id: order.display_id ?? null,
    order_number: order.order_lifecycle?.number ?? null,
    created_at: iso(order.created_at),
    address:
      [snapshot.address_1, snapshot.address_2]
        .filter((part): part is string => !!part)
        .join(", ") || null,
    city: snapshot.city,
    items_count: items.length,
    total_quantity: items.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0),
      0
    ),
    location_id,
    address_snapshot: snapshot,
  }
}

// Заказы, которые кто-то уже взял: точка выдачи по заказу существует. Точка
// живёт, пока рейс не разобран, поэтому проваленная выдача заказ НЕ
// освобождает — вернуть его в пул может только диспетчер, сняв точку.
const takenOrderIds = async (
  container: MedusaContainer,
  orderIds: string[]
): Promise<Set<string>> => {
  if (!orderIds.length) {
    return new Set()
  }
  const service = container.resolve<LogisticsModuleService>(LOGISTICS_MODULE)
  const stops = await service.listTripStops({
    order_id: orderIds,
    type: "delivery",
  })
  return new Set(stops.map((stop) => stop.order_id))
}

// Свободные заказы пула, FIFO — кто оформлен раньше, тот выше: пул это
// очередь, а не витрина «выбери повыгоднее».
export const listAvailableOrders = async (
  container: MedusaContainer
): Promise<DriverPoolOrder[]> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: lifecycles } = await query.graph({
    entity: "order_lifecycle",
    fields: ["id", "order.id"],
    filters: {
      status: DRIVER_POOL_STATUSES,
      delivery_method: "delivery",
    },
    pagination: {
      skip: 0,
      take: DRIVER_POOL_SCAN_CAP,
      order: { created_at: "ASC" },
    },
  })

  const orderIds = (lifecycles as { order?: { id: string } | null }[])
    .map((lifecycle) => lifecycle.order?.id)
    .filter((id): id is string => !!id)

  if (!orderIds.length) {
    return []
  }

  const taken = await takenOrderIds(container, orderIds)
  const free = orderIds.filter((id) => !taken.has(id))
  if (!free.length) {
    return []
  }

  const { data: orders } = await query.graph({
    entity: "order",
    fields: ORDER_FIELDS,
    filters: { id: free },
    pagination: { skip: 0, take: free.length },
  })

  // Порядок задаёт очередь жизненных циклов, а не выборка заказов.
  const byId = new Map(
    (orders as RawOrder[]).map((order) => [order.id, order] as const)
  )
  return free
    .map((id) => {
      const order = byId.get(id)
      return order ? toPoolOrder(order) : null
    })
    .filter((order): order is DriverPoolOrder => !!order)
}

// Один заказ под «взять»: те же условия, что у пула, но с причиной отказа —
// водитель должен понимать, почему кнопка не сработала.
export const findAvailableOrder = async (
  container: MedusaContainer,
  orderId: string
): Promise<
  { order: DriverPoolOrder; rejection?: never } | { rejection: ClaimRejection }
> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data } = await query.graph({
    entity: "order",
    fields: [
      ...ORDER_FIELDS,
      "order_lifecycle.status",
      "order_lifecycle.delivery_method",
    ],
    filters: { id: orderId },
  })

  const raw = (data as RawOrder[])[0]
  if (!raw) {
    return { rejection: "not_found" }
  }

  const lifecycle = raw.order_lifecycle
  const inPool =
    !!lifecycle &&
    DRIVER_POOL_STATUSES.includes(lifecycle.status as OrderStatusValue) &&
    lifecycle.delivery_method === "delivery"
  if (!inPool) {
    return { rejection: "not_ready" }
  }

  const order = toPoolOrder(raw)
  if (!order) {
    return { rejection: "not_ready" }
  }

  const taken = await takenOrderIds(container, [orderId])
  if (taken.has(orderId)) {
    return { rejection: "already_taken" }
  }

  return { order }
}
