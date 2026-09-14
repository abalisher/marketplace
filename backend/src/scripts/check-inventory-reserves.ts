import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  findReserveDrift,
  repairReserveDrift,
} from "../lib/inventory/reconcile-reserves"

// Диагностика и починка расхождения резервов на складе (T4.16).
//
// Симптом, найденный Ф-прогоном 2026-08-18 (блокер закупщицы Жанны):
// `KZ-CEM400-25` показывал «Зарезервировано: −8», из-за чего доступный остаток
// врал и решение о закупе принимать было нельзя. Почему так выходит и почему
// чиним запросом в БД — в `lib/inventory/reconcile-reserves.ts`.
//
// Запуск (флаги CLI до скрипта `medusa exec` не доходят — идиома проекта, как
// `INVOICE_FILE` у smoke-invoice-ai):
//   npx medusa exec ./src/scripts/check-inventory-reserves.ts             — отчёт
//   FIX_RESERVES=1 npx medusa exec ./src/scripts/check-inventory-reserves.ts — починить
export default async function checkInventoryReserves({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const fix = process.env.FIX_RESERVES === "1"

  const drift = await findReserveDrift(container)

  if (!drift.length) {
    logger.info("Резервы сходятся с резервациями на всех уровнях остатка.")
    return
  }

  // Названия позиций — чтобы отчёт читал человек, а не только разработчик.
  const inventoryService = container.resolve(Modules.INVENTORY)
  const items = await inventoryService.listInventoryItems(
    { id: drift.map((row) => row.inventory_item_id) },
    { select: ["id", "sku", "title"] }
  )
  const nameById = new Map(
    items.map((item) => [item.id, item.sku ?? item.title ?? item.id])
  )

  logger.warn(`Уровней с расхождением: ${drift.length}`)
  for (const row of drift) {
    logger.warn(
      `  ${nameById.get(row.inventory_item_id)} @ ${row.location_id}: ` +
        `в остатке ${row.reserved_quantity}, по резервациям ${row.expected}`
    )
  }

  if (!fix) {
    logger.info("Отчёт без изменений. Починить: FIX_RESERVES=1")
    return
  }

  await repairReserveDrift(container, drift)
  logger.info(`Починено уровней: ${drift.length}`)
}
