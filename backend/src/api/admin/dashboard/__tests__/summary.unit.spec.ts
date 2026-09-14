import { buildDashboardSummary } from "../summary"

// Юнит-тесты сборки сводки дня: проверяем счёт и пороги, а не выборку.
// query.graph и сервис закупа подменены заглушками — нужен только контракт
// ответа, который читает экран дашборда.

type GraphArgs = {
  entity: string
  fields?: string[]
  filters?: Record<string, unknown>
  pagination?: { order?: Record<string, string> }
}

// Плитка «Низкие остатки» считает ТОТ ЖЕ срез, что экран «Цены и остатки»:
// покупаемые варианты товара, а не складские позиции ядра (иначе в счёт
// попадает позиция, заведённая приходом без карточки товара, — её на экране
// нет, и числа расходятся; T10.14e). Поэтому в заглушке — каталог.
const CATALOG = [
  { id: "cement", title: "Цемент М400", sku: "CEM-50", stocked: 4, reserved: 0 },
  { id: "mesh", title: "Сетка", sku: "NET-50", stocked: 3, reserved: 3 },
  { id: "gkl", title: "Гипсокартон", sku: "GKL", stocked: 14, reserved: 0 },
  { id: "brick", title: "Кирпич", sku: "BR", stocked: 900, reserved: 100 },
]

const makeQuery = (overrides: { proposedCount?: number } = {}) => {
  const calls: GraphArgs[] = []
  const query = {
    graph: async (args: GraphArgs) => {
      calls.push(args)
      if (args.entity === "order_lifecycle") {
        const status = args.filters?.status
        // Счётчик по статусу (take: 1) — интересует только metadata.count.
        if (typeof status === "string") {
          const counts: Record<string, number> = {
            new: 3,
            confirmed: 1,
            assembling: 2,
            partially_assembled: 0,
            assembled: 1,
            // «В доставке» тоже открытый статус (T4.12): заказ в пути магазин
            // ещё не отдал, и он обязан быть в сводке.
            in_delivery: 3,
          }
          return { data: [], metadata: { count: counts[status] ?? 0 } }
        }
        // Очередь: самые старые ожидающие.
        return {
          data: [
            {
              status: "new",
              created_at: "2026-08-01T10:00:00.000Z",
              order: { id: "order_1" },
            },
            {
              status: "assembling",
              created_at: "2026-08-02T10:00:00.000Z",
              order: null,
            },
          ],
          metadata: { count: 2 },
        }
      }
      if (args.entity === "order") {
        return {
          data: [
            {
              id: "order_1",
              display_id: 1024,
              email: "buyer@example.com",
              currency_code: "kzt",
              // Итог из graph намеренно НЕВЕРНЫЙ (ядро отдаёт по этому полю
              // стоимость доставки) — сводка обязана взять его из сервиса.
              total: 2000,
              items: [{ id: "li_1" }, { id: "li_2" }],
              customer: { company_name: "ТОО «АстанаСтрой»" },
            },
          ],
          metadata: { count: 1 },
        }
      }
      if (args.entity === "product") {
        // Каталог для плитки остатков и очередь модерации ходят к одной
        // сущности — различаем по составу полей, как их различает ядро.
        if (args.fields?.includes("variants.prices.amount")) {
          return {
            data: CATALOG.map((item) => ({
              id: `prod_${item.id}`,
              title: item.title,
              status: "published",
              categories: [{ handle: "finishing", name: "Отделочные материалы" }],
              variants: [
                {
                  id: `variant_${item.id}`,
                  title: item.title,
                  sku: item.sku,
                  manage_inventory: true,
                  prices: [
                    { id: "price_1", amount: 1000, currency_code: "kzt" },
                  ],
                  inventory_items: [
                    {
                      inventory: {
                        id: `iitem_${item.id}`,
                        location_levels: [
                          {
                            location_id: "sloc_1",
                            stocked_quantity: item.stocked,
                            reserved_quantity: item.reserved,
                          },
                        ],
                      },
                    },
                  ],
                },
              ],
            })),
            metadata: { count: CATALOG.length },
          }
        }
        return {
          data: [{ updated_at: new Date(Date.now() - 3 * 3_600_000).toISOString() }],
          metadata: { count: overrides.proposedCount ?? 12 },
        }
      }
      if (args.entity === "stock_location") {
        return {
          data: [{ id: "sloc_1", name: "Склад на Пушкина" }],
          metadata: { count: 1 },
        }
      }
      return { data: [], metadata: { count: 0 } }
    },
  }
  return { query, calls }
}

const makeProcurement = (receipts: Record<string, unknown>[] = []) =>
  ({
    listReceipts: async () => receipts,
    listSuppliers: async () => [{ id: "sup_1", name: "Цемторг" }],
  }) as never

// Итоги заказов приходят из сервиса ядрового модуля order — единственный
// источник правды по деньгам (см. loadOrderTotals в api/admin/order-lifecycles).
const ORDER_TOTALS: Record<string, number> = { order_1: 486200 }

// Активные претензии для плитки «Претензии»: сервис модуля reviews подменён
// заглушкой — сводке нужны только даты открытия (возраст и просрочка).
const makeReviews = (
  disputes: { created_at: string }[] = [
    { created_at: "2026-08-01T10:00:00.000Z" },
  ]
) =>
  ({
    listDisputes: async () => disputes,
  }) as never

const makeOrderService = () =>
  ({
    listOrders: async (filters: { id: string[] }) =>
      filters.id.map((id) => ({ id, total: ORDER_TOTALS[id] ?? null })),
  }) as never

// Лог переходов для отчёта по стадиям: сводке нужен только список событий,
// правило усреднения проверяется отдельно (stages.unit.spec.ts).
const makeLifecycle = (events: Record<string, unknown>[] = []) =>
  ({
    listOrderLifecycleEvents: async () => events,
  }) as never

describe("buildDashboardSummary", () => {
  it("складывает открытые заказы по статусам и отдаёт очередь с именем плательщика", async () => {
    const { query } = makeQuery()

    const summary = await buildDashboardSummary(
      query as never,
      makeProcurement(),
      makeOrderService(),
      makeReviews(),
      makeLifecycle()
    )

    expect(summary.orders.open_count).toBe(10)
    expect(summary.orders.counts).toEqual({
      new: 3,
      confirmed: 1,
      assembling: 2,
      partially_assembled: 0,
      assembled: 1,
      in_delivery: 3,
    })
    // Строка без заказа в очередь не попадает — показывать нечего.
    expect(summary.orders.queue).toHaveLength(1)
    expect(summary.orders.queue[0]).toMatchObject({
      display_id: 1024,
      customer: "ТОО «АстанаСтрой»",
      item_count: 2,
      total: 486200,
    })
  })

  it("помечает просрочку в очереди и считает её по всем открытым заказам", async () => {
    const { query } = makeQuery()

    const summary = await buildDashboardSummary(
      query as never,
      makeProcurement(),
      makeOrderService(),
      makeReviews(),
      makeLifecycle()
    )

    // Оба открытых заказа стоят в статусе с августа — оба вне срока стадии.
    // Без этого числа плитка «Заказы» не краснела, и о том, что заказ висит
    // шестой день, узнать было негде (T4.12).
    expect(summary.orders.overdue_count).toBe(2)
    expect(summary.orders.oldest_waiting_hours).toBeGreaterThan(24)
    expect(summary.orders.queue[0].overdue).toBe(true)
    expect(summary.orders.queue[0].status_hours).toBeGreaterThan(24)
  })

  it("отдаёт деньги дня и отчёт по стадиям", async () => {
    const { query } = makeQuery()

    const summary = await buildDashboardSummary(
      query as never,
      makeProcurement(),
      makeOrderService(),
      makeReviews(),
      makeLifecycle()
    )

    expect(summary.money.currency_code).toBe("kzt")
    expect(summary.money.week_days).toBe(7)
    // Юрлица выключены флагом — дебиторки в ответе нет вовсе.
    expect(summary.money.receivables).toBeNull()
    expect(summary.stages.window_days).toBe(30)
    expect(summary.stages.stages.map((stage) => stage.key)).toEqual([
      "accepted",
      "assembled",
      "shipped",
      "delivered",
    ])
  })

  it("считает низкие остатки по доступному количеству и порогу", async () => {
    const { query } = makeQuery()

    const summary = await buildDashboardSummary(
      query as never,
      makeProcurement(),
      makeOrderService(),
      makeReviews(),
      makeLifecycle()
    )

    // Порог по умолчанию 10: доступно 4, 0 и 14 → под порог попадают две позиции.
    expect(summary.stock.threshold).toBe(10)
    expect(summary.stock.low_count).toBe(2)
    expect(summary.stock.zero_count).toBe(1)
    // Сначала самые критичные.
    expect(summary.stock.items.map((item) => item.id)).toEqual([
      "variant_mesh",
      "variant_cement",
    ])
  })

  it("уважает порог из окружения", async () => {
    process.env.DASHBOARD_LOW_STOCK_THRESHOLD = "20"
    try {
      const { query } = makeQuery()
      const summary = await buildDashboardSummary(
        query as never,
        makeProcurement(),
        makeOrderService(),
        makeReviews(),
        makeLifecycle()
      )
      expect(summary.stock.threshold).toBe(20)
      expect(summary.stock.low_count).toBe(3)
    } finally {
      delete process.env.DASHBOARD_LOW_STOCK_THRESHOLD
    }
  })

  it("считает часы ожидания старейшей карточки модерации", async () => {
    const { query } = makeQuery()

    const summary = await buildDashboardSummary(
      query as never,
      makeProcurement(),
      makeOrderService(),
      makeReviews(),
      makeLifecycle()
    )

    expect(summary.moderation.pending_count).toBe(12)
    expect(summary.moderation.oldest_waiting_hours).toBe(3)
  })

  it("отдаёт пустую модерацию без часов ожидания", async () => {
    const { query } = makeQuery({ proposedCount: 0 })
    const emptyQuery = {
      graph: async (args: GraphArgs) =>
        args.entity === "product"
          ? { data: [], metadata: { count: 0 } }
          : query.graph(args),
    }

    const summary = await buildDashboardSummary(
      emptyQuery as never,
      makeProcurement(),
      makeOrderService(),
      makeReviews(),
      makeLifecycle()
    )

    expect(summary.moderation).toEqual({
      pending_count: 0,
      oldest_waiting_hours: null,
    })
  })

  it("считает активные претензии, просрочку и возраст самой старой", async () => {
    const { query } = makeQuery()
    const now = Date.now()
    const hoursAgo = (hours: number) =>
      new Date(now - hours * 3_600_000).toISOString()

    const summary = await buildDashboardSummary(
      query as never,
      makeProcurement(),
      makeOrderService(),
      makeReviews([
        { created_at: hoursAgo(70) },
        { created_at: hoursAgo(30) },
        { created_at: hoursAgo(2) },
      ]),
      makeLifecycle()
    )

    expect(summary.disputes.open_count).toBe(3)
    // Срок ответа по умолчанию — 24 ч: просрочены две из трёх.
    expect(summary.disputes.overdue_count).toBe(2)
    expect(summary.disputes.oldest_waiting_hours).toBe(70)
  })

  it("делит непроведённые приходы на ручные и от ИИ", async () => {
    const { query } = makeQuery()
    const procurement = makeProcurement([
      {
        id: "rec_1",
        reference: "ПР-216",
        supplier_id: "sup_1",
        status: "draft",
        source: "manual",
        total_cost: 640000,
        created_at: "2026-08-03T09:00:00.000Z",
      },
      {
        id: "rec_2",
        reference: null,
        supplier_id: null,
        status: "draft",
        source: "invoice_ai",
        total_cost: 120000,
        created_at: "2026-08-02T09:00:00.000Z",
      },
    ])

    const summary = await buildDashboardSummary(
      query as never,
      procurement,
      makeOrderService(),
      makeReviews(),
      makeLifecycle()
    )

    expect(summary.receipts.open_count).toBe(2)
    expect(summary.receipts.draft_count).toBe(1)
    expect(summary.receipts.ai_count).toBe(1)
    expect(summary.receipts.items[0]).toMatchObject({
      reference: "ПР-216",
      supplier: "Цемторг",
      total_cost: 640000,
    })
    expect(summary.receipts.items[1].supplier).toBeNull()
  })
})
