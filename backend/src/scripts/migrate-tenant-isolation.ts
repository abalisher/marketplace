import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { ensureTenantDelivery } from "../lib/tenants/provision"
import { ORDER_LIFECYCLE_MODULE } from "../modules/order-lifecycle"
import OrderLifecycleModuleService from "../modules/order-lifecycle/service"
import { TENANT_MODULE } from "../modules/tenant"

// Однократный перенос первой версии мультипродавца на разграничение доступа
// (2026-10-01). Первая версия держала привязки в метаданных и дублировала ядро
// колонками компании; здесь данные переезжают на свои места:
//
//   1. доставка компании — shipping option на её складе с прежней ценой
//      (колонка tenant.delivery_price);
//   2. продавец ↔ компания — связь tenant ↔ user вместо user.metadata
//      (метаданные пользователь правит сам, связь — только владелец);
//   3. у покупателей снимаются «привязки к компании» из метаданных и название
//      компании-продавца, вписанное в их адреса как их собственная компания;
//   4. lifecycle заказов получает канал продаж (фильтр продавца в очереди);
//   5. устаревшие колонки компании удаляются — в том числе ключи Kaspi,
//      которые не должны жить открытым текстом.
//
// Безопасен на пустой базе и при повторе: каждый шаг сверяется с текущим
// состоянием.
//
// Запуск — отдельным шагом выкладки, ПОСЛЕ миграций схемы:
//   npx medusa exec ./src/scripts/migrate-tenant-isolation.ts
// Не migration-script: прод мигрирует с --skip-scripts (scripts/migrate-remote.sh),
// и скрипт из src/migration-scripts там не запустился бы никогда.

type LegacyTenantRow = {
  id: string
  name: string
  stock_location_id: string | null
  delivery_price: string | number | null
}

const LEGACY_COLUMNS = [
  "stock_location_id",
  "publishable_key_id",
  "publishable_key_token",
  "kaspi_merchant_id",
  "kaspi_api_key",
  "kaspi_webhook_secret",
  "delivery_price",
  "delivery_free_threshold",
  "delivery_description",
  "domain",
]

const TENANT_METADATA_KEYS = [
  "tenant_id",
  "tenant_slug",
  "sales_channel_id",
  "stock_location_id",
  "company_name",
]

// Удаление ключей метаданных: ядро СЛИВАЕТ переданные metadata с текущими, а
// ключ со значением "" удаляет — поэтому передаём только удаляемые ключи.
const dropKeys = (
  metadata: Record<string, unknown> | null | undefined
): Record<string, string> | null => {
  const present = TENANT_METADATA_KEYS.filter((key) => metadata?.[key] !== undefined)
  return present.length
    ? Object.fromEntries(present.map((key) => [key, ""]))
    : null
}

export default async function migrateTenantIsolation({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)

  const { rows: columns } = await pg.raw(
    `select column_name from information_schema.columns where table_name = 'tenant'`
  )
  const legacy = new Set(
    (columns as { column_name: string }[])
      .map((c) => c.column_name)
      .filter((name) => LEGACY_COLUMNS.includes(name))
  )

  // 1. Доставка компаний с прежней ценой.
  if (legacy.has("delivery_price") && legacy.has("stock_location_id")) {
    const { rows } = await pg.raw(
      `select id, name, stock_location_id, delivery_price from tenant
       where deleted_at is null and stock_location_id is not null`
    )
    for (const tenant of rows as LegacyTenantRow[]) {
      await ensureTenantDelivery(container, {
        name: tenant.name,
        stock_location_id: tenant.stock_location_id!,
        delivery_price: Number(tenant.delivery_price ?? 2000),
      })
      logger.info(`tenant-isolation: доставка компании ${tenant.name} заведена`)
    }
  }

  // 2. Продавцы: связь вместо метаданных.
  const userService = container.resolve(Modules.USER)
  const { data: tenants } = await query.graph({
    entity: "tenant",
    fields: ["id", "name"],
  })
  const tenantIds = new Set((tenants as { id: string }[]).map((t) => t.id))
  const tenantNames = new Set((tenants as { name: string }[]).map((t) => t.name))

  const users = await userService.listUsers({})
  for (const user of users) {
    const tenantId = user.metadata?.tenant_id
    if (typeof tenantId !== "string") {
      continue
    }
    if (tenantIds.has(tenantId)) {
      const { data } = await query.graph({
        entity: "user",
        fields: ["id", "tenant.id"],
        filters: { id: user.id },
      })
      if (!(data[0] as { tenant?: { id: string } | null })?.tenant) {
        await link.create({
          [TENANT_MODULE]: { tenant_id: tenantId },
          [Modules.USER]: { user_id: user.id },
        })
      }
    }
    const metadata = dropKeys(user.metadata)
    if (metadata) {
      await userService.updateUsers({ id: user.id, metadata })
    }
    logger.info(`tenant-isolation: продавец ${user.email} привязан связью`)
  }

  // 3. Покупатели: без «привязок к компании» и чужого названия в адресах.
  const customerService = container.resolve(Modules.CUSTOMER)
  const customers = await customerService.listCustomers(
    {},
    { relations: ["addresses"] }
  )
  for (const customer of customers) {
    const metadata = dropKeys(customer.metadata)
    if (metadata) {
      await customerService.updateCustomers(customer.id, { metadata })
    }
    for (const address of customer.addresses ?? []) {
      if (address.company && tenantNames.has(address.company)) {
        await customerService.updateCustomerAddresses(address.id, {
          company: null,
        })
      }
    }
  }

  // 4. Канал продаж в lifecycle заказов.
  const lifecycleService =
    container.resolve<OrderLifecycleModuleService>(ORDER_LIFECYCLE_MODULE)
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "sales_channel_id", "order_lifecycle.id"],
  })
  const updates = (
    orders as {
      sales_channel_id?: string | null
      order_lifecycle?: { id: string } | null
    }[]
  )
    .filter((order) => order.order_lifecycle?.id && order.sales_channel_id)
    .map((order) => ({
      id: order.order_lifecycle!.id,
      sales_channel_id: order.sales_channel_id!,
    }))
  if (updates.length) {
    await lifecycleService.updateOrderLifecycles(updates)
    logger.info(`tenant-isolation: канал продаж проставлен ${updates.length} заказам`)
  }

  // 5. Устаревшие колонки компании.
  for (const column of LEGACY_COLUMNS) {
    if (legacy.has(column)) {
      await pg.raw(`alter table "tenant" drop column if exists "${column}"`)
    }
  }
}
