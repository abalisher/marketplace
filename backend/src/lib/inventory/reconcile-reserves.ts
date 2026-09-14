import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

// Расхождение уровня остатка с резервациями: что нашли и чем чинить (T4.16).
export type ReserveDrift = {
  level_id: string
  inventory_item_id: string
  location_id: string
  reserved_quantity: number
  expected: number
}

// `inventory_level.reserved_quantity` — КЭШ суммы живых `reservation_item` по
// паре (позиция, склад). Обычный путь ведёт его сам и не ошибается: живой
// прогон заказа №44 (сборка → отгрузка) показал, что уровень и сумма
// резерваций падают синхронно. Ломают кэш МАССОВЫЕ операции в обход пути —
// удаление резерваций уже отгруженного заказа вычитает количество ВТОРОЙ раз, и
// резерв уходит в минус (Ф-прогон 2026-08-18: «Зарезервировано: −8» у цемента,
// блокер закупщицы).
//
// Поэтому: всякий раз, когда код удаляет резервации пачкой, он обязан после
// этого свериться — иначе склад врёт, а увидит это только человек и нескоро.
export const findReserveDrift = async (
  container: MedusaContainer
): Promise<ReserveDrift[]> => {
  const inventoryService = container.resolve(Modules.INVENTORY)

  const levels = await inventoryService.listInventoryLevels(
    {},
    { select: ["id", "inventory_item_id", "location_id", "reserved_quantity"] }
  )
  const reservations = await inventoryService.listReservationItems(
    {},
    { select: ["inventory_item_id", "location_id", "quantity"] }
  )

  const key = (itemId: string, locationId: string) => `${itemId}:${locationId}`
  const live = new Map<string, number>()
  for (const reservation of reservations) {
    const k = key(reservation.inventory_item_id, reservation.location_id)
    // quantity в типах ядра — BigNumberInput; на складе это целые единицы.
    live.set(k, (live.get(k) ?? 0) + Number(reservation.quantity))
  }

  return levels
    .map((level) => ({
      level_id: level.id,
      inventory_item_id: level.inventory_item_id,
      location_id: level.location_id,
      reserved_quantity: Number(level.reserved_quantity),
      expected: live.get(key(level.inventory_item_id, level.location_id)) ?? 0,
    }))
    .filter((row) => row.reserved_quantity !== row.expected)
}

// Чиним ЗАПРОСОМ В БД, а не сервисом модуля. Грабля ядра: у
// `updateInventoryLevels` поле `reserved_quantity` есть в типах, метод отвечает
// успехом — и молча НИЧЕГО не меняет (проверено на четырёх уровнях). Публичного
// сеттера у кэша нет: ядро считает его своим, поэтому расхождение, возникшее в
// обход обычного пути, в обход же и правится.
export const repairReserveDrift = async (
  container: MedusaContainer,
  drift: ReserveDrift[]
): Promise<void> => {
  if (!drift.length) {
    return
  }
  const connection = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  for (const row of drift) {
    await connection.raw(
      "update inventory_level set reserved_quantity = ? where id = ?",
      [row.expected, row.level_id]
    )
  }
}
