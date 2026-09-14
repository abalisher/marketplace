import { IOrderModuleService } from "@medusajs/framework/types"
import {
  countByStatus,
  emptyCounts,
  loadOrderTotals,
  loadRowOrders,
  numericAmount,
  paymentState,
  toRowOrder,
} from "../rows"

// Юнит-тесты сборки строки экрана «Заказы» и счётчиков чипов: проверяем, что
// бэкенд отдаёт готовую к отрисовке строку (человекочитаемый плательщик, признак
// юрлица, число позиций, адрес) и точный счёт по статусам. query.graph подменён
// заглушкой — нужен контракт ответа, который читает экран.

type GraphArgs = {
  entity: string
  fields?: string[]
  filters?: Record<string, unknown>
  pagination?: { take?: number }
}

describe("toRowOrder", () => {
  it("берёт название компании и помечает заказ юрлицом", () => {
    const row = toRowOrder(
      {
        id: "order_1",
        display_id: 1032,
        email: "bekzat@astanastroy.kz",
        created_at: new Date("2026-08-04T10:24:00.000Z"),
        currency_code: "kzt",
        payment_collections: [{ status: "awaiting", amount: 486200 }],
        items: [{ id: "li_1" }, { id: "li_2" }],
        customer: {
          first_name: "Бекзат",
          last_name: "О.",
          employee: { company: { id: "comp_1", name: "ТОО «АстанаСтрой»" } },
        },
        shipping_address: { address_1: "пр. Туран 55/2", city: "Астана" },
      },
      486200
    )

    expect(row).toEqual({
      id: "order_1",
      display_id: 1032,
      email: "bekzat@astanastroy.kz",
      created_at: "2026-08-04T10:24:00.000Z",
      customer_name: "ТОО «АстанаСтрой»",
      company_id: "comp_1",
      is_company: true,
      item_count: 2,
      total: 486200,
      currency_code: "kzt",
      payment_state: "awaiting",
      address: "пр. Туран 55/2, Астана",
    })
  })

  it("для частного лица показывает ФИО, а без него — телефон", () => {
    const person = toRowOrder({
      id: "order_2",
      email: "erlan@example.com",
      customer: { first_name: "Ерлан", last_name: "С." },
    })
    expect(person.customer_name).toBe("Ерлан С.")
    expect(person.is_company).toBe(false)
    expect(person.company_id).toBeNull()

    // Вход на MVP — по телефону, почту такому покупателю заводит система:
    // «77775550314@phone.invalid» в очереди читалось как адрес, которого у
    // человека нет (T4.13).
    const byPhone = toRowOrder({
      id: "order_3",
      email: "77775550314@phone.invalid",
      customer: { phone: "+7 777 555 03 14" },
    })
    expect(byPhone.customer_name).toBe("+7 777 555 03 14")

    const guest = toRowOrder({ id: "order_4", email: "guest@example.com" })
    expect(guest.customer_name).toBe("guest@example.com")
  })

  it("пустые значения превращает в null, а не в строку «undefined»", () => {
    const row = toRowOrder({
      id: "order_4",
      display_id: null,
      email: null,
      customer: { first_name: "  ", last_name: null, employee: { company: null } },
      shipping_address: { address_1: "  ", city: null },
      items: null,
      currency_code: null,
      payment_collections: null,
    })

    expect(row.customer_name).toBeNull()
    expect(row.address).toBeNull()
    expect(row.item_count).toBe(0)
    expect(row.total).toBeNull()
    expect(row.created_at).toBeNull()
    expect(row.payment_state).toBeNull()
  })

  it("не считает юрлицом компанию с пустым названием", () => {
    const row = toRowOrder({
      id: "order_5",
      email: "buyer@example.com",
      customer: { employee: { company: { id: "comp_2", name: "   " } } },
    })
    expect(row.is_company).toBe(false)
    expect(row.customer_name).toBe("buyer@example.com")
  })
})

describe("paymentState", () => {
  it("авторизованные и захваченные деньги считает оплатой", () => {
    expect(
      paymentState({
        id: "o",
        payment_collections: [
          { status: "authorized", authorized_amount: 242000, captured_amount: 0 },
        ],
      })
    ).toBe("paid")
    expect(
      paymentState({
        id: "o",
        payment_collections: [{ status: "completed", captured_amount: 4700 }],
      })
    ).toBe("paid")
  })

  it("сессию без денег считает ожиданием, отменённую — отменой", () => {
    expect(
      paymentState({
        id: "o",
        payment_collections: [{ status: "not_paid", amount: 0 }],
      })
    ).toBe("awaiting")
    expect(
      paymentState({ id: "o", payment_collections: [{ status: "canceled" }] })
    ).toBe("canceled")
  })

  it("заказ без платёжной сессии состояния не имеет", () => {
    expect(paymentState({ id: "o" })).toBeNull()
    expect(paymentState({ id: "o", payment_collections: [] })).toBeNull()
  })
})

describe("numericAmount", () => {
  it("разбирает число, строку и BigNumber ядра", () => {
    expect(numericAmount(242000)).toBe(242000)
    expect(numericAmount("4700")).toBe(4700)
    expect(numericAmount({ numeric: 486200 })).toBe(486200)
    expect(numericAmount(null)).toBeNull()
    expect(numericAmount("—")).toBeNull()
  })
})

describe("loadOrderTotals", () => {
  it("берёт итоги сервисом модуля order, а не полем graph", async () => {
    const calls: unknown[][] = []
    const orderService = {
      listOrders: async (filters: unknown, config: unknown) => {
        calls.push([filters, config])
        return [
          { id: "order_1", total: 242000 },
          { id: "order_2", total: { numeric: 4700 } },
        ]
      },
    } as unknown as IOrderModuleService

    const totals = await loadOrderTotals(orderService, ["order_1", "order_2"])
    expect(totals.get("order_1")).toBe(242000)
    expect(totals.get("order_2")).toBe(4700)
    expect(calls[0][0]).toEqual({ id: ["order_1", "order_2"] })

    expect((await loadOrderTotals(orderService, [])).size).toBe(0)
    expect(calls).toHaveLength(1)
  })
})

describe("loadRowOrders", () => {
  it("отдаёт карту по id заказа и не ходит в БД без id", async () => {
    const calls: GraphArgs[] = []
    const query = {
      graph: async (args: GraphArgs) => {
        calls.push(args)
        return {
          data: [
            { id: "order_1", display_id: 10, items: [{ id: "li_1" }] },
            { id: "order_2", display_id: 11 },
          ],
        }
      },
    } as never
    const orderService = {
      listOrders: async () => [{ id: "order_1", total: 58900 }],
    } as unknown as IOrderModuleService

    const rows = await loadRowOrders(query, orderService, [
      "order_1",
      "order_2",
    ])
    expect([...rows.keys()]).toEqual(["order_1", "order_2"])
    expect(rows.get("order_1")?.item_count).toBe(1)
    expect(rows.get("order_1")?.total).toBe(58900)
    // Заказ, по которому итог не пришёл, показываем прочерком, а не нулём.
    expect(rows.get("order_2")?.total).toBeNull()
    expect(calls[0].filters).toEqual({ id: ["order_1", "order_2"] })
    expect(calls[0].pagination?.take).toBe(2)

    const empty = await loadRowOrders(query, orderService, [])
    expect(empty.size).toBe(0)
    expect(calls).toHaveLength(1)
  })
})

describe("countByStatus", () => {
  it("считает всего и по каждому статусу, сохраняя прочие фильтры", async () => {
    const calls: GraphArgs[] = []
    const counts: Record<string, number> = {
      new: 3,
      confirmed: 5,
      assembling: 4,
      partially_assembled: 1,
      assembled: 2,
      in_delivery: 6,
      delivered: 26,
    }
    const query = {
      graph: async (args: GraphArgs) => {
        calls.push(args)
        const status = args.filters?.status
        return {
          data: [],
          metadata: {
            count: typeof status === "string" ? (counts[status] ?? 0) : 46,
          },
        }
      },
    } as never

    const result = await countByStatus(query, { delivery_method: "delivery" })

    expect(result.total).toBe(46)
    expect(result.by_status.confirmed).toBe(5)
    // Статус без заказов присутствует в ответе нулём — чип не исчезает.
    expect(result.by_status.returned).toBe(0)
    // Все запросы несут базовый фильтр, иначе счётчики врали бы при поиске.
    expect(
      calls.every((call) => call.filters?.delivery_method === "delivery")
    ).toBe(true)
    // Один запрос на «всего» + по одному на каждый статус.
    expect(calls).toHaveLength(11)
  })
})

describe("emptyCounts", () => {
  it("даёт нули по всем статусам без запросов к БД", () => {
    const result = emptyCounts()
    expect(result.total).toBe(0)
    expect(Object.keys(result.by_status)).toHaveLength(10)
    expect(Object.values(result.by_status).every((value) => value === 0)).toBe(
      true
    )
  })
})
