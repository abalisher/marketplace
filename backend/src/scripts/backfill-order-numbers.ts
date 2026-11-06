import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  nextOrderNumber,
  PLATFORM_ORDER_PREFIX,
} from "../lib/orders/order-number"
import { resolveStoreTenant } from "../lib/tenants/storefront"

// Перенос: номера для людей (ORG-26-0007) заказам, оформленным до их появления
// (2026-11-02). По порядку оформления, по коду компании канала и году заказа —
// из того же счётчика, что и новые заказы, поэтому следующий заказ продолжит
// нумерацию. Номер получает и строка оплаты заказа. Повтор безопасен: заказ с
// номером не трогается.
//
//   npx medusa exec ./src/scripts/backfill-order-numbers.ts
export default async function backfillOrderNumbers({ container }: ExecArgs) {
  const db = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const rows = (await db
    .select("lc.id as lifecycle_id", "o.id as order_id", "o.display_id", "o.created_at", "o.sales_channel_id")
    .from({ lc: "order_lifecycle" })
    .join({ l: "order_order_order_lifecycle_order_lifecycle" }, "l.order_lifecycle_id", "lc.id")
    .join({ o: "order" }, "o.id", "l.order_id")
    .whereNull("lc.number")
    .whereNull("lc.deleted_at")
    .whereNull("l.deleted_at")
    .whereNull("o.deleted_at")
    .orderBy("o.created_at", "asc")) as {
    lifecycle_id: string
    order_id: string
    display_id: number
    created_at: Date
    sales_channel_id: string | null
  }[]

  for (const row of rows) {
    const tenant = await resolveStoreTenant(container, row.sales_channel_id ?? undefined)
    const prefix =
      (tenant as { order_prefix?: string | null } | null)?.order_prefix || PLATFORM_ORDER_PREFIX
    const number = await nextOrderNumber(container, prefix, new Date(row.created_at))
    await db("order_lifecycle").where({ id: row.lifecycle_id }).update({ number, updated_at: new Date() })
    await db("order_payment")
      .where({ order_id: row.order_id })
      .whereNull("deleted_at")
      .update({ order_number: number, updated_at: new Date() })
    console.log(`№${row.display_id} → ${number}`)
  }
  console.log(rows.length ? `Готово: ${rows.length}` : "Номера у всех заказов уже есть")
}
