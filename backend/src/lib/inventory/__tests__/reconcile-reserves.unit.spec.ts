import { MedusaContainer } from "@medusajs/framework/types"
import { findReserveDrift } from "../reconcile-reserves"

// `reserved_quantity` уровня остатка — кэш суммы живых резерваций. Ф-прогон
// 2026-08-18 нашёл его в минусе («Зарезервировано: −8» у цемента): доступный
// остаток врал, и закупщица отказалась принимать решение по такому экрану.
// Тест закрепляет, что расхождение находится в обе стороны — и когда кэш
// меньше резерваций, и когда он ушёл ниже нуля без единой резервации.

const SKLAD = "sloc_1"
const SKLAD2 = "sloc_2"

const containerWith = (
  levels: Array<{
    id: string
    inventory_item_id: string
    location_id: string
    reserved_quantity: number
  }>,
  reservations: Array<{
    inventory_item_id: string
    location_id: string
    quantity: number | string
  }>
) =>
  ({
    resolve: () => ({
      listInventoryLevels: async () => levels,
      listReservationItems: async () => reservations,
    }),
  }) as unknown as MedusaContainer

describe("findReserveDrift", () => {
  it("молчит, когда кэш сходится с резервациями", async () => {
    const drift = await findReserveDrift(
      containerWith(
        [
          {
            id: "ilev_1",
            inventory_item_id: "iitem_1",
            location_id: SKLAD,
            reserved_quantity: 12,
          },
        ],
        [
          { inventory_item_id: "iitem_1", location_id: SKLAD, quantity: 5 },
          { inventory_item_id: "iitem_1", location_id: SKLAD, quantity: 7 },
        ]
      )
    )
    expect(drift).toEqual([])
  })

  it("находит отрицательный резерв без единой резервации", async () => {
    // Ровно случай стенда: резервацию отгруженного заказа удалили пачкой, и
    // ядро вычло количество второй раз.
    const drift = await findReserveDrift(
      containerWith(
        [
          {
            id: "ilev_1",
            inventory_item_id: "iitem_1",
            location_id: SKLAD,
            reserved_quantity: -8,
          },
        ],
        []
      )
    )
    expect(drift).toEqual([
      {
        level_id: "ilev_1",
        inventory_item_id: "iitem_1",
        location_id: SKLAD,
        reserved_quantity: -8,
        expected: 0,
      },
    ])
  })

  it("считает склады по отдельности — резервация чужого склада не в счёт", async () => {
    const drift = await findReserveDrift(
      containerWith(
        [
          {
            id: "ilev_1",
            inventory_item_id: "iitem_1",
            location_id: SKLAD,
            reserved_quantity: 0,
          },
          {
            id: "ilev_2",
            inventory_item_id: "iitem_1",
            location_id: SKLAD2,
            reserved_quantity: 4,
          },
        ],
        [{ inventory_item_id: "iitem_1", location_id: SKLAD2, quantity: 4 }]
      )
    )
    expect(drift).toEqual([])
  })

  it("читает количество, пришедшее строкой (BigNumber ядра)", async () => {
    const drift = await findReserveDrift(
      containerWith(
        [
          {
            id: "ilev_1",
            inventory_item_id: "iitem_1",
            location_id: SKLAD,
            reserved_quantity: 3,
          },
        ],
        [{ inventory_item_id: "iitem_1", location_id: SKLAD, quantity: "3" }]
      )
    )
    expect(drift).toEqual([])
  })
})
