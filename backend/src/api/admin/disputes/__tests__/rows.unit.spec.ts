import {
  ageHours,
  countDisputes,
  disputeSlaHours,
  isOverdue,
  loadDisputeRows,
} from "../rows"

// Юнит-тесты сборки строки очереди претензий: возраст обращения, признак
// просрочки и счётчики чипов. query.graph и сервис модуля order подменены
// заглушками — проверяем правила, а не выборку.

const NOW = new Date("2026-08-18T12:00:00.000Z").getTime()
const hoursAgo = (hours: number) =>
  new Date(NOW - hours * 3_600_000).toISOString()

const dispute = (overrides: Record<string, unknown> = {}) => ({
  id: "dsp_1",
  order_id: "order_1",
  customer_id: "cus_1",
  category: "damaged",
  description: "Два мешка цемента порваны",
  status: "open",
  resolution: null,
  outcome: null,
  source: "buyer",
  created_at: hoursAgo(1),
  ...overrides,
})

const makeQuery = () => ({
  graph: async () => ({
    data: [
      {
        id: "order_1",
        display_id: 39,
        email: "nurlan.a@bk.ru",
        created_at: hoursAgo(50),
        currency_code: "kzt",
        items: [{ id: "item_1" }, { id: "item_2" }],
        customer: { first_name: "Нурлан", last_name: "Абдуллаев" },
      },
    ],
    metadata: { count: 1 },
  }),
})

const makeOrderService = () =>
  ({
    listOrders: async (filters: { id: string[] }) =>
      filters.id.map((id) => ({ id, total: 209600 })),
  }) as never

describe("ageHours", () => {
  it("считает часы с момента открытия", () => {
    expect(ageHours(hoursAgo(73), NOW)).toBe(73)
  })

  it("без даты и на битой дате отдаёт 0, а не NaN", () => {
    expect(ageHours(null, NOW)).toBe(0)
    expect(ageHours("не дата", NOW)).toBe(0)
  })

  it("не уходит в минус на дате из будущего", () => {
    expect(ageHours(new Date(NOW + 3_600_000).toISOString(), NOW)).toBe(0)
  })
})

describe("isOverdue", () => {
  it("просрочивает только незакрытые претензии", () => {
    expect(isOverdue("open", 30, 24)).toBe(true)
    expect(isOverdue("in_review", 30, 24)).toBe(true)
    // По решённой и отклонённой срок ответа уже неважен: красная метка на них
    // читалась бы как «ещё надо ответить».
    expect(isOverdue("resolved", 300, 24)).toBe(false)
    expect(isOverdue("rejected", 300, 24)).toBe(false)
  })

  it("внутри срока просрочки нет", () => {
    expect(isOverdue("open", 23, 24)).toBe(false)
  })
})

describe("disputeSlaHours", () => {
  afterEach(() => {
    delete process.env.DISPUTE_SLA_HOURS
  })

  it("по умолчанию — сутки", () => {
    expect(disputeSlaHours()).toBe(24)
  })

  it("читает порог из окружения и игнорирует мусор", () => {
    process.env.DISPUTE_SLA_HOURS = "8"
    expect(disputeSlaHours()).toBe(8)
    process.env.DISPUTE_SLA_HOURS = "0"
    expect(disputeSlaHours()).toBe(24)
    process.env.DISPUTE_SLA_HOURS = "как-нибудь"
    expect(disputeSlaHours()).toBe(24)
  })
})

describe("loadDisputeRows", () => {
  it("подставляет заказ, покупателя и сумму к каждой претензии", async () => {
    const [row] = await loadDisputeRows(
      makeQuery() as never,
      makeOrderService(),
      [dispute({ created_at: hoursAgo(50) })],
      NOW
    )

    expect(row.order).toMatchObject({
      display_id: 39,
      customer_name: "Нурлан Абдуллаев",
      total: 209600,
      item_count: 2,
    })
    expect(row.age_hours).toBe(50)
    expect(row.overdue).toBe(true)
    expect(row.source).toBe("buyer")
  })

  it("претензия без найденного заказа остаётся в очереди с пустым заказом", async () => {
    const emptyQuery = { graph: async () => ({ data: [], metadata: {} }) }
    const [row] = await loadDisputeRows(
      emptyQuery as never,
      makeOrderService(),
      [dispute({ order_id: "order_gone" })],
      NOW
    )

    expect(row.order).toBeNull()
    expect(row.description).toBe("Два мешка цемента порваны")
  })
})

describe("countDisputes", () => {
  it("считает по статусам и отдельно — просроченные активные", async () => {
    const byStatus: Record<string, { created_at: string }[]> = {
      open: [{ created_at: hoursAgo(70) }, { created_at: hoursAgo(2) }],
      in_review: [{ created_at: hoursAgo(30) }],
      resolved: [{ created_at: hoursAgo(200) }],
      rejected: [],
    }

    const listAndCount = async (
      filters: Record<string, unknown>
    ): Promise<[{ created_at: string }[], number]> => {
      const status = filters.status
      if (Array.isArray(status)) {
        const rows = status.flatMap((value) => byStatus[value as string] ?? [])
        return [rows, rows.length]
      }
      if (typeof status === "string") {
        const rows = byStatus[status] ?? []
        return [rows, rows.length]
      }
      const rows = Object.values(byStatus).flat()
      return [rows, rows.length]
    }

    const counts = await countDisputes(listAndCount, {}, NOW)

    expect(counts.total).toBe(4)
    expect(counts.by_status).toEqual({
      open: 2,
      in_review: 1,
      resolved: 1,
      rejected: 0,
    })
    // Просрочены две активные (70 ч и 30 ч); решённая 200 ч не считается.
    expect(counts.overdue).toBe(2)
  })
})
