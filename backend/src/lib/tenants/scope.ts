import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PICKER_ROLE, SHELL_ROLE_KEY } from "../../modules/assembly/roles"
import { OrderStatusValue } from "../../modules/order-lifecycle/models/statuses"
import { TenantStatus } from "../../modules/tenant/models/tenant"

// Роль пользователя компании: продавец ведёт заказ (подтверждение, отмена,
// перенос, вручение, закрытие), сборщик собирает и отгружает, водитель везёт
// и вручает по коду получения. Роль — ключ `role` в user.metadata: метаданные
// свои пользователь компании не правит (own_user в tenant-access), их ставит
// площадка (setup-tenant).
export type TenantRole = "seller" | "picker" | "driver"

// Водитель компании: заказы своей компании в доставке и их вручение по коду.
export const DRIVER_ROLE = "driver"

// Область данных пользователя компании в панели: её канал продаж, склады
// канала и роль. Кладётся на запрос проверкой доступа (api/utils/tenant-access.ts)
// и читается роутами через getTenantScope — роут, который фильтрует свои
// данные, не ищет компанию сам.
export type TenantScope = {
  tenant_id: string
  name: string
  slug: string
  sales_channel_id: string
  stock_location_ids: string[]
  role: TenantRole
}

type UserTenantRow = {
  id: string
  name: string
  slug: string
  status: TenantStatus
  sales_channel_id: string
  role: TenantRole
}

// Компания, к которой привязан пользователь панели (связь tenant ↔ user), и его
// роль в ней, или null — сотрудник площадки. Статус отдаётся как есть: что
// делать с приостановленной компанией, решает вызывающий код.
export const loadUserTenant = async (
  container: MedusaContainer,
  userId: string
): Promise<UserTenantRow | null> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "user",
    fields: [
      "id",
      "metadata",
      "tenant.id",
      "tenant.name",
      "tenant.slug",
      "tenant.status",
      "tenant.sales_channel_id",
    ],
    filters: { id: userId },
  })
  const row = data[0] as
    | {
        metadata?: Record<string, unknown> | null
        tenant?: Omit<UserTenantRow, "role"> | null
      }
    | undefined
  if (!row?.tenant) {
    return null
  }
  const value = row.metadata?.[SHELL_ROLE_KEY]
  const role: TenantRole =
    value === PICKER_ROLE ? "picker" : value === DRIVER_ROLE ? "driver" : "seller"
  return { ...row.tenant, role }
}

// Статусы, в которых заказ — работа сборщика: продавец подтвердил, заказ ещё
// не уехал. Неподтверждённый заказ сборщик не видит — подтверждение за
// продавцом; собранный остаётся в списке до отгрузки.
export const ASSEMBLY_ORDER_STATUSES: OrderStatusValue[] = [
  "confirmed",
  "assembling",
  "partially_assembled",
  "assembled",
]

// Заказы, задания которых видит сборщик: сборщик компании — заказы её канала,
// сборщик площадки — заказы вне каналов компаний (товар компании лежит на её
// складе, собирают его её люди).
export const loadAssemblyOrderIds = async (
  container: MedusaContainer,
  salesChannelId: string | null
): Promise<string[]> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const [{ data: lifecycles }, tenantChannels] = await Promise.all([
    query.graph({
      entity: "order_lifecycle",
      fields: ["sales_channel_id", "order.id"],
      filters: {
        status: ASSEMBLY_ORDER_STATUSES,
        ...(salesChannelId ? { sales_channel_id: salesChannelId } : {}),
      },
    }),
    salesChannelId
      ? Promise.resolve(new Set<string>())
      : query
          .graph({ entity: "tenant", fields: ["sales_channel_id"] })
          .then(
            ({ data }) =>
              new Set((data as { sales_channel_id: string }[]).map((t) => t.sales_channel_id))
          ),
  ])
  return (
    lifecycles as {
      sales_channel_id?: string | null
      order?: { id: string } | null
    }[]
  )
    .filter((row) => !row.sales_channel_id || !tenantChannels.has(row.sales_channel_id))
    .map((row) => row.order?.id)
    .filter((id): id is string => !!id)
}

// Склады канала продаж (ядровая связь sales_channel ↔ stock_location).
export const loadChannelStockLocationIds = async (
  container: MedusaContainer,
  salesChannelId: string
): Promise<string[]> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "stock_locations.id"],
    filters: { id: salesChannelId },
  })
  const channel = data[0] as
    | { stock_locations?: ({ id: string } | null)[] | null }
    | undefined
  return (channel?.stock_locations ?? [])
    .map((location) => location?.id)
    .filter((id): id is string => !!id)
}

// Товары и склады канала продаж (ядровые связи product ↔ sales_channel и
// sales_channel ↔ stock_location). У каждой компании свой каталог, поэтому
// витрина компании и её ассистент смотрят только товары и склады её канала.
export const loadChannelAssortment = async (
  container: MedusaContainer,
  salesChannelId: string
): Promise<{ productIds: string[]; locationIds: Set<string> }> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const [{ data: links }, locationIds] = await Promise.all([
    query.graph({
      entity: "product_sales_channel",
      fields: ["product_id"],
      filters: { sales_channel_id: salesChannelId },
    }),
    loadChannelStockLocationIds(container, salesChannelId),
  ])
  return {
    productIds: (links as { product_id: string }[]).map((link) => link.product_id),
    locationIds: new Set(locationIds),
  }
}

// Заказы канала. Списки панели (реестр документов, претензии, отзывы) хранят
// order_id без канала, поэтому продавцу их режут по этому набору. Без
// усечения: выборка по индексу канала, и обрезанный список молча прятал бы
// старые заказы компании.
export const loadChannelOrderIds = async (
  container: MedusaContainer,
  salesChannelId: string
): Promise<string[]> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "order",
    fields: ["id"],
    filters: { sales_channel_id: salesChannelId },
  })
  return (data as { id: string }[]).map((order) => order.id)
}

// Принадлежит ли заказ каналу компании. Несуществующий заказ — «не её»: роут
// ниже ответит 404 так же, как на чужой.
export const orderBelongsToChannel = async (
  container: MedusaContainer,
  orderId: string,
  salesChannelId: string
): Promise<boolean> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "order",
    fields: ["id", "sales_channel_id"],
    filters: { id: orderId },
  })
  const order = data[0] as { sales_channel_id?: string | null } | undefined
  return order?.sales_channel_id === salesChannelId
}

// Клиенты компании: покупатели с заказами в её канале и заведённые её
// менеджером (связь tenant ↔ customer, links/tenant-customer.ts). Продавец
// видит только их. Покупатель площадки один на все компании — связь лишь
// добавляет его в список компании, его заказы в других каналах закрыты.
export const loadTenantCustomerIds = async (
  container: MedusaContainer,
  scope: Pick<TenantScope, "tenant_id" | "sales_channel_id">
): Promise<string[]> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const [{ data: orders }, { data: linked }] = await Promise.all([
    query.graph({
      entity: "order",
      fields: ["customer_id"],
      filters: { sales_channel_id: scope.sales_channel_id },
    }),
    // Связь читаем полем графа, а не импортом links/tenant-customer.ts:
    // defineLink при импорте требует реестр модулей (юнит-тесты без него).
    query.graph({
      entity: "tenant",
      fields: ["id", "customers.id"],
      filters: { id: scope.tenant_id },
    }),
  ])
  const linkedIds = (
    (linked[0] as { customers?: ({ id: string } | null)[] | null } | undefined)
      ?.customers ?? []
  ).map((customer) => customer?.id)
  return [
    ...new Set(
      [
        ...orders.map((row) => (row as { customer_id?: string | null }).customer_id),
        ...linkedIds,
      ].filter((id): id is string => !!id)
    ),
  ]
}
