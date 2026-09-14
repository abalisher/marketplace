import { loadDashboardMoney, shopDayStart } from "../money"

// Деньги дня на дашборде (T4.12). Заглушки повторяют то, что важно для счёта:
// заказ попадает в выручку только оплаченным, чужая валюта в суммы не идёт, а
// «деньги в работе» считаются по нашим статусам жизненного цикла.

type GraphArgs = {
  entity: string
  fields?: string[]
  filters?: Record<string, unknown>
}

const NOW = new Date("2026-09-03T09:00:00.000Z")

// Оплата в терминах ядра: у Kaspi авторизация И ЕСТЬ оплата.
const paid = [{ status: "authorized", authorized_amount: 1, captured_amount: 0 }]
const awaiting = [{ status: "awaiting", authorized_amount: 0, captured_amount: 0 }]

const ORDERS = [
  {
    id: "ord_today",
    created_at: "2026-09-03T08:00:00.000Z",
    currency_code: "kzt",
    payment_collections: paid,
  },
  {
    id: "ord_week",
    created_at: "2026-08-31T08:00:00.000Z",
    currency_code: "kzt",
    payment_collections: paid,
  },
  {
    id: "ord_unpaid",
    created_at: "2026-09-03T07:00:00.000Z",
    currency_code: "kzt",
    payment_collections: awaiting,
  },
  {
    id: "ord_usd",
    created_at: "2026-09-03T06:00:00.000Z",
    currency_code: "usd",
    payment_collections: paid,
  },
  // За пределами окна недели — в выручку не попадает.
  {
    id: "ord_old",
    created_at: "2026-08-01T08:00:00.000Z",
    currency_code: "kzt",
    payment_collections: paid,
  },
]

const TOTALS: Record<string, number> = {
  ord_today: 100_000,
  ord_week: 200_000,
  ord_unpaid: 50_000,
  ord_usd: 999,
  ord_old: 700_000,
}

// Заказы «в работе» — те, что вернёт жизненный цикл: сегодняшний оплаченный и
// неоплаченный.
const IN_PROGRESS_IDS = ["ord_today", "ord_unpaid", "ord_usd"]

const makeQuery = () => ({
  graph: async (args: GraphArgs) => {
    if (args.entity === "order_lifecycle") {
      return {
        data: IN_PROGRESS_IDS.map((id, index) => ({
          id: `ordlc_${index}`,
          order: { id },
        })),
        metadata: { count: IN_PROGRESS_IDS.length },
      }
    }
    if (args.entity === "order") {
      const ids = args.filters?.id as string[] | undefined
      const since = (args.filters?.created_at as { $gte?: string } | undefined)
        ?.$gte
      const data = ORDERS.filter((order) => {
        if (ids) {
          return ids.includes(order.id)
        }
        return since ? order.created_at >= since : true
      })
      return { data, metadata: { count: data.length } }
    }
    return { data: [], metadata: { count: 0 } }
  },
})

const makeOrderService = () =>
  ({
    listOrders: async (filters: { id: string[] }) =>
      filters.id.map((id) => ({ id, total: TOTALS[id] ?? null })),
  }) as never

describe("shopDayStart", () => {
  it("отсчитывает день магазина, а не день UTC-сервера", () => {
    // В Астане (UTC+5) в 01:00 UTC уже 06:00 — начало дня было в 19:00 UTC
    // предыдущих суток.
    const start = shopDayStart(
      new Date("2026-09-03T01:00:00.000Z"),
      "Asia/Almaty"
    )
    expect(start.toISOString()).toBe("2026-09-02T19:00:00.000Z")
  })

  it("в полночь магазина отдаёт саму полночь", () => {
    const start = shopDayStart(
      new Date("2026-09-02T19:00:00.000Z"),
      "Asia/Almaty"
    )
    expect(start.toISOString()).toBe("2026-09-02T19:00:00.000Z")
  })
})

describe("loadDashboardMoney", () => {
  it("считает выручку дня и недели только по оплаченным заказам", async () => {
    const money = await loadDashboardMoney(
      makeQuery() as never,
      makeOrderService(),
      NOW
    )

    expect(money.revenue_today).toBe(100_000)
    expect(money.revenue_today_orders).toBe(1)
    // Неделя: сегодняшний и позавчерашний. Неоплаченный не считается, старый —
    // вне окна.
    expect(money.revenue_week).toBe(300_000)
    expect(money.revenue_week_orders).toBe(2)
    expect(money.week_days).toBe(7)
  })

  it("заказы в чужой валюте в суммы не берёт, но считает отдельно", async () => {
    const money = await loadDashboardMoney(
      makeQuery() as never,
      makeOrderService(),
      NOW
    )

    expect(money.other_currency_orders).toBe(1)
    expect(money.currency_code).toBe("kzt")
  })

  it("складывает деньги в работе и выделяет неоплаченное", async () => {
    const money = await loadDashboardMoney(
      makeQuery() as never,
      makeOrderService(),
      NOW
    )

    expect(money.in_progress).toBe(150_000)
    expect(money.in_progress_orders).toBe(2)
    expect(money.awaiting_payment).toBe(50_000)
  })

  it("без юрлиц дебиторки нет вовсе, а не ноль", async () => {
    const money = await loadDashboardMoney(
      makeQuery() as never,
      makeOrderService(),
      NOW
    )

    expect(money.receivables).toBeNull()
  })

  it("с включёнными юрлицами считает дебиторку и просрочку по сроку", async () => {
    process.env.FEATURE_COMPANIES = "true"
    process.env.COMPANY_RECEIVABLE_TERM_DAYS = "1"
    try {
      const withCompany = {
        graph: async (args: GraphArgs) => {
          const base = await makeQuery().graph(args)
          if (args.entity !== "order") {
            return base
          }
          return {
            ...base,
            data: (base.data as { id: string }[]).map((order) => ({
              ...order,
              customer: { employee: { company: { id: "comp_1" } } },
            })),
          }
        },
      }

      const money = await loadDashboardMoney(
        withCompany as never,
        makeOrderService(),
        NOW
      )

      // В работе не оплачен один заказ юрлица на 50 000, оформлен два часа
      // назад — при сроке в сутки это долг, но ещё не просрочка.
      expect(money.receivables).toEqual({
        total: 50_000,
        overdue: 0,
        term_days: 1,
        companies: 1,
      })
    } finally {
      delete process.env.FEATURE_COMPANIES
      delete process.env.COMPANY_RECEIVABLE_TERM_DAYS
    }
  })
})
