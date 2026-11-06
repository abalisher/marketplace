import { RemoteQueryFunction } from "@medusajs/framework/types"
import DocumentsModuleService from "../../../../modules/documents/service"
import {
  countByType,
  emptyTypeCounts,
  findOrderIdsBySearch,
  loadRegistryOrders,
} from "../rows"

// Юнит-тесты сборки строк реестра документов (T4.9): бэкенд отдаёт готовую к
// отрисовке строку (номер заказа, плательщик человекочитаемо, признак юрлица) и
// точные счётчики чипов. query.graph и сервис модуля подменены заглушками —
// проверяем контракт, который читает экран.

type GraphArgs = {
  entity: string
  fields?: string[]
  filters?: Record<string, unknown>
  pagination?: { take?: number }
}

const queryStub = (
  handler: (args: GraphArgs) => { data: unknown[] }
): Omit<RemoteQueryFunction, symbol> =>
  ({
    graph: async (args: GraphArgs) => handler(args),
  }) as unknown as Omit<RemoteQueryFunction, symbol>

describe("loadRegistryOrders", () => {
  it("берёт название компании и помечает заказ юрлицом", async () => {
    const query = queryStub(() => ({
      data: [
        {
          id: "order_1",
          display_id: 24,
          email: "aigul@astanastroy.kz",
          billing_address: { first_name: "Айгуль", last_name: "С." },
          company: { id: "comp_1", name: "ТОО «АстанаСтрой»" },
        },
      ],
    }))

    const orders = await loadRegistryOrders(query, ["order_1", "order_1"])

    expect(orders.get("order_1")).toEqual({
      id: "order_1",
      display_id: 24,
      order_number: null,
      buyer: "ТОО «АстанаСтрой»",
      is_company: true,
    })
  })

  it("для физлица берёт имя из адреса, а без имени — почту", async () => {
    const query = queryStub(() => ({
      data: [
        {
          id: "order_2",
          display_id: 25,
          email: "erlan@mail.kz",
          shipping_address: { first_name: "Ерлан", last_name: "К." },
        },
        { id: "order_3", display_id: 26, email: "no-name@mail.kz" },
      ],
    }))

    const orders = await loadRegistryOrders(query, ["order_2", "order_3"])

    expect(orders.get("order_2")?.buyer).toEqual("Ерлан К.")
    expect(orders.get("order_2")?.is_company).toBe(false)
    expect(orders.get("order_3")?.buyer).toEqual("no-name@mail.kz")
  })

  it("не ходит в query без заказов", async () => {
    const graph = jest.fn()
    const query = { graph } as unknown as Omit<RemoteQueryFunction, symbol>

    expect((await loadRegistryOrders(query, [])).size).toEqual(0)
    expect(graph).not.toHaveBeenCalled()
  })
})

describe("findOrderIdsBySearch", () => {
  it("ищет и по почте, и по номеру заказа с решёткой", async () => {
    const filters: Record<string, unknown>[] = []
    const query = queryStub((args) => {
      filters.push(args.filters ?? {})
      return { data: [{ id: "order_1" }] }
    })

    const ids = await findOrderIdsBySearch(query, "#24")

    expect(ids).toEqual(["order_1"])
    expect(filters).toEqual([
      // Номер нового вида: «24» — хвост номера (ORG-26-0024 и т. п.).
      { number: { $like: "%-0024" } },
      { email: { $ilike: "%#24%" } },
      { display_id: 24 },
    ])
  })

  it("номер нового вида ищется по жизненному циклу заказа", async () => {
    const filters: Record<string, unknown>[] = []
    const query = queryStub((args) => {
      filters.push(args.filters ?? {})
      return args.entity === "order_lifecycle"
        ? { data: [{ id: "ordlc_1", order: { id: "order_7" } }] }
        : { data: (args.filters as { id?: string[] }).id ? [{ id: "order_7" }] : [] }
    })

    const ids = await findOrderIdsBySearch(query, "org-26-7")

    expect(filters[0]).toEqual({ number: "ORG-26-0007" })
    expect(ids).toEqual(["order_7"])
  })

  it("нечисловой запрос номером заказа не ищет", async () => {
    const filters: Record<string, unknown>[] = []
    const query = queryStub((args) => {
      filters.push(args.filters ?? {})
      return { data: [] }
    })

    await findOrderIdsBySearch(query, "астана")

    expect(filters).toHaveLength(1)
  })
})

describe("countByType", () => {
  it("считает по каждому типу и общую сумму, сохраняя базовые фильтры", async () => {
    const seen: Record<string, unknown>[] = []
    const service = {
      listAndCountDocuments: async (filters: Record<string, unknown>) => {
        seen.push(filters)
        const counts: Record<string, number> = {
          invoice: 3,
          waybill: 2,
          internal_avr: 1,
        }
        return [[], counts[filters.type as string] ?? 0] as [unknown[], number]
      },
    } as unknown as DocumentsModuleService

    const counts = await countByType(service, { is_latest: true })

    expect(counts).toEqual({
      all: 6,
      invoice: 3,
      waybill: 2,
      internal_avr: 1,
    })
    expect(seen.every((filters) => filters.is_latest === true)).toBe(true)
  })

  it("пустые счётчики — нули по всем типам", () => {
    expect(emptyTypeCounts()).toEqual({
      all: 0,
      invoice: 0,
      waybill: 0,
      internal_avr: 0,
    })
  })
})
