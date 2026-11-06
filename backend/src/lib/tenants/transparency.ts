import { orderLabel } from "../orders/order-number"
import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { loadChannelStockLocationIds } from "./scope"
import { publicTenantName } from "./public-name"

// Публичная сводка «учёт без слепых зон» для страницы компании: приход на её
// склады, остатки, отгрузки и машины в рейсе — из живых данных, без выдумок.
//
// Наружу — только агрегаты и обезличенный журнал: номер заказа и статус, товар
// прихода и количество. Покупателей, адресов, поставщиков и денег здесь нет.
// Заказы компании берутся по каналу продаж самого заказа (ядро), а не по
// полю жизненного цикла: оно есть не на всех базах.

export const TRANSPARENCY_WINDOW_DAYS = 7
const LOG_SIZE = 6

export type TransparencyLogEntry =
  | {
      type: "in"
      at: string
      title: string | null
      quantity: number
      unit: string
      more_lines: number
    }
  // order_number — подпись заказа: «ORG-26-0007», у старых заказов — «№5».
  | { type: "status"; at: string; order_number: string; status: string }

export type TenantTransparency = {
  window_days: number
  generated_at: string
  locations: string[]
  inflow: {
    receipts: number
    by_unit: { unit: string; quantity: number }[]
  }
  stock: {
    skus: number
    in_stock: number
    updated_at: string | null
  }
  outflow: { shipped: number; delivered: number }
  active_drivers: number
  log: TransparencyLogEntry[]
}

const iso = (value: unknown): string | null =>
  value ? new Date(value as string).toISOString() : null

const placeholders = (values: unknown[]) => values.map(() => "?").join(", ")

export const loadTenantTransparency = async (
  container: MedusaContainer,
  salesChannelId: string
): Promise<TenantTransparency> => {
  const db = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const locationIds = await loadChannelStockLocationIds(container, salesChannelId)
  const since = new Date(
    Date.now() - TRANSPARENCY_WINDOW_DAYS * 24 * 60 * 60 * 1000
  )

  // Заказ компании ↔ его события жизненного цикла.
  const orderEvents = `
    from order_lifecycle_event e
    join order_order_order_lifecycle_order_lifecycle l
      on l.order_lifecycle_id = e.order_lifecycle_id and l.deleted_at is null
    join "order" o on o.id = l.order_id and o.deleted_at is null
    where o.sales_channel_id = ? and e.deleted_at is null and e.kind = 'status'`

  const [outflow, events] = await Promise.all([
    db.raw(
      `select
         count(*) filter (where e.to_status = 'in_delivery')::int as shipped,
         count(*) filter (where e.to_status = 'delivered')::int as delivered
       ${orderEvents} and e.created_at >= ?`,
      [salesChannelId, since]
    ),
    db.raw(
      `select e.created_at as at, e.to_status as status, o.display_id,
         (select lc.number from order_lifecycle lc where lc.id = e.order_lifecycle_id) as number
       ${orderEvents}
       order by e.created_at desc limit ${LOG_SIZE}`,
      [salesChannelId]
    ),
  ])

  let inflow: TenantTransparency["inflow"] = { receipts: 0, by_unit: [] }
  let stock: TenantTransparency["stock"] = {
    skus: 0,
    in_stock: 0,
    updated_at: null,
  }
  let activeDrivers = 0
  let receiptLog: TransparencyLogEntry[] = []

  if (locationIds.length) {
    const inLocations = `in (${placeholders(locationIds)})`
    const [receiptCount, byUnit, levels, trips, receipts] = await Promise.all([
      db.raw(
        `select count(*)::int as receipts from receipt
         where status = 'posted' and deleted_at is null
           and location_id ${inLocations} and received_at >= ?`,
        [...locationIds, since]
      ),
      db.raw(
        `select rl.unit, sum(rl.quantity)::float as quantity
         from receipt r join receipt_line rl
           on rl.receipt_id = r.id and rl.deleted_at is null
         where r.status = 'posted' and r.deleted_at is null
           and r.location_id ${inLocations} and r.received_at >= ?
         group by rl.unit order by 2 desc`,
        [...locationIds, since]
      ),
      db.raw(
        `select count(*)::int as skus,
           count(*) filter (where stocked_quantity - reserved_quantity > 0)::int as in_stock,
           max(updated_at) as updated_at
         from inventory_level
         where deleted_at is null and location_id ${inLocations}`,
        locationIds
      ),
      db.raw(
        `select count(distinct driver_id)::int as drivers from trip
         where deleted_at is null and status in ('loading', 'en_route')
           and location_id ${inLocations}`,
        locationIds
      ),
      db.raw(
        `select r.received_at as at, f.title, f.quantity, f.unit,
           (select count(*)::int from receipt_line x
             where x.receipt_id = r.id and x.deleted_at is null) as lines
         from receipt r
         join lateral (
           select coalesce(p.title, rl.recognized_title, rl.material_kind) as title,
             rl.quantity, rl.unit
           from receipt_line rl
           left join product_variant v on v.id = rl.variant_id
           left join product p on p.id = v.product_id
           where rl.receipt_id = r.id and rl.deleted_at is null
           order by rl.created_at limit 1
         ) f on true
         where r.status = 'posted' and r.deleted_at is null
           and r.location_id ${inLocations} and r.received_at is not null
         order by r.received_at desc limit ${LOG_SIZE}`,
        locationIds
      ),
    ])

    inflow = {
      receipts: receiptCount.rows[0]?.receipts ?? 0,
      by_unit: byUnit.rows.map((row: { unit: string; quantity: number }) => ({
        unit: row.unit,
        quantity: Math.round(row.quantity * 10) / 10,
      })),
    }
    stock = {
      skus: levels.rows[0]?.skus ?? 0,
      in_stock: levels.rows[0]?.in_stock ?? 0,
      updated_at: iso(levels.rows[0]?.updated_at),
    }
    activeDrivers = trips.rows[0]?.drivers ?? 0
    receiptLog = receipts.rows.map(
      (row: {
        at: string
        title: string | null
        quantity: number
        unit: string
        lines: number
      }) => ({
        type: "in" as const,
        at: iso(row.at)!,
        title: row.title,
        quantity: row.quantity,
        unit: row.unit,
        more_lines: Math.max(0, row.lines - 1),
      })
    )
  }

  const statusLog: TransparencyLogEntry[] = events.rows.map(
    (row: { at: string; status: string; display_id: number; number: string | null }) => ({
      type: "status" as const,
      at: iso(row.at)!,
      order_number: orderLabel(row.number, row.display_id),
      status: row.status,
    })
  )

  const { data: locations } = locationIds.length
    ? await query.graph({
        entity: "stock_location",
        fields: ["name"],
        filters: { id: locationIds },
      })
    : { data: [] }

  return {
    window_days: TRANSPARENCY_WINDOW_DAYS,
    generated_at: new Date().toISOString(),
    locations: (locations as { name?: string | null }[])
      .map((location) => location.name)
      .filter((name): name is string => !!name)
      .map(publicTenantName),
    inflow,
    stock,
    outflow: {
      shipped: outflow.rows[0]?.shipped ?? 0,
      delivered: outflow.rows[0]?.delivered ?? 0,
    },
    active_drivers: activeDrivers,
    log: [...receiptLog, ...statusLog]
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, LOG_SIZE),
  }
}
