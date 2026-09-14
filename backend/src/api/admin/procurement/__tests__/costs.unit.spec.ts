import {
  CostBatch,
  averagePurchaseCost,
  lastPurchaseCost,
  markup,
  variantCostSummary,
} from "../costs"

// Себестоимость и наценка позиции (T4.9a): «купили по 2 350 ₸, продаём по
// 6 000 ₸» должно считаться одинаково на карточке товара и в тестах — правила
// живут чистыми функциями, роут остаётся тонким.

const batch = (over: Partial<CostBatch> = {}): CostBatch => ({
  unit_cost: 2350,
  quantity_received: 10,
  quantity_remaining: 10,
  received_at: "2026-08-01T00:00:00.000Z",
  ...over,
})

describe("lastPurchaseCost", () => {
  it("берёт цену самого позднего прихода", () => {
    const result = lastPurchaseCost([
      batch({ unit_cost: 2350, received_at: "2026-08-01T00:00:00.000Z" }),
      batch({ unit_cost: 2600, received_at: "2026-08-20T00:00:00.000Z" }),
      batch({ unit_cost: 2500, received_at: "2026-08-10T00:00:00.000Z" }),
    ])
    expect(result.cost).toEqual(2600)
    expect(result.at).toEqual("2026-08-20T00:00:00.000Z")
  })

  it("без партий — прочерк, а не ноль", () => {
    expect(lastPurchaseCost([])).toEqual({ cost: null, at: null })
  })
})

describe("averagePurchaseCost", () => {
  it("средневзвешенная по ОСТАТКУ: сколько стоит то, что продаём сейчас", () => {
    // 4 шт по 2 000 + 6 шт по 3 000 = 26 000 / 10 = 2 600.
    const result = averagePurchaseCost([
      batch({ unit_cost: 2000, quantity_remaining: 4, quantity_received: 10 }),
      batch({ unit_cost: 3000, quantity_remaining: 6, quantity_received: 6 }),
    ])
    expect(result).toEqual({ cost: 2600, basis: "stock" })
  })

  it("остатка нет — считает по приходам и говорит об этом базой", () => {
    const result = averagePurchaseCost([
      batch({ unit_cost: 2000, quantity_received: 10, quantity_remaining: 0 }),
      batch({ unit_cost: 3000, quantity_received: 10, quantity_remaining: 0 }),
    ])
    expect(result).toEqual({ cost: 2500, basis: "receipts" })
  })

  it("без партий — прочерк", () => {
    expect(averagePurchaseCost([])).toEqual({ cost: null, basis: null })
  })
})

describe("markup", () => {
  it("наценка в тенге и в процентах от себестоимости", () => {
    expect(markup(6000, 2350)).toEqual({
      margin: 3650,
      markup_percent: 155.3,
    })
  })

  it("продажа ниже закупа — отрицательная наценка (это и надо увидеть)", () => {
    expect(markup(2000, 2500)).toEqual({ margin: -500, markup_percent: -20 })
  })

  it("себестоимость 0 — процента нет: делить не на что", () => {
    expect(markup(6000, 0)).toEqual({ margin: 6000, markup_percent: null })
  })

  it("нет цены или нет себестоимости — наценки нет", () => {
    expect(markup(null, 2350)).toEqual({ margin: null, markup_percent: null })
    expect(markup(6000, null)).toEqual({ margin: null, markup_percent: null })
  })
})

describe("variantCostSummary", () => {
  it("сводит закуп, остаток и цену продажи в одну строку карточки", () => {
    const summary = variantCostSummary(
      [
        batch({
          unit_cost: 2000,
          quantity_received: 10,
          quantity_remaining: 4,
          received_at: "2026-08-01T00:00:00.000Z",
        }),
        batch({
          unit_cost: 3000,
          quantity_received: 6,
          quantity_remaining: 6,
          received_at: "2026-08-20T00:00:00.000Z",
        }),
      ],
      6000
    )
    expect(summary).toEqual({
      last_cost: 3000,
      last_cost_at: "2026-08-20T00:00:00.000Z",
      average_cost: 2600,
      average_basis: "stock",
      batch_quantity: 10,
      // 4 × 2 000 + 6 × 3 000.
      batch_cost_value: 26000,
      price: 6000,
      margin: 3400,
      markup_percent: 130.8,
    })
  })

  it("позиция без приходов: цена есть, себестоимости нет — наценка молчит", () => {
    const summary = variantCostSummary([], 6000)
    expect(summary.last_cost).toBeNull()
    expect(summary.average_cost).toBeNull()
    expect(summary.batch_quantity).toEqual(0)
    expect(summary.batch_cost_value).toEqual(0)
    expect(summary.markup_percent).toBeNull()
  })

  it("дробное количество (материалы) не рассыпается на копейки", () => {
    const summary = variantCostSummary(
      [batch({ unit_cost: 1330, quantity_received: 2.5, quantity_remaining: 2.5 })],
      2000
    )
    expect(summary.batch_quantity).toEqual(2.5)
    expect(summary.batch_cost_value).toEqual(3325)
    expect(summary.average_cost).toEqual(1330)
  })
})
