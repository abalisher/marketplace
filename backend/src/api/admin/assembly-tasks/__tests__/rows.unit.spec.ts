import {
  buildAssemblyTaskRow,
  countAssemblyTasks,
  emptyTaskCounts,
  TaskLike,
} from "../rows"

// Строка очереди заданий: экран сборщика и экран отгрузки читают готовую
// строку и ничего не пересчитывают.

const task = (over: Partial<TaskLike> = {}): TaskLike => ({
  id: "astsk_1",
  order_id: "order_1",
  category_handle: "electrical",
  category_name: "Электрика",
  status: "picking",
  created_at: new Date("2026-09-01T10:00:00.000Z"),
  items: [
    {
      id: "astski_1",
      order_item_id: "ordli_1",
      title: "Кабель ВВГнг 3×2.5",
      sku: "CAB-3x25",
      quantity: 100,
      picked_quantity: 100,
      status: "picked",
    },
    {
      id: "astski_2",
      order_item_id: "ordli_2",
      title: "Автомат C16",
      quantity: 4,
      picked_quantity: 2,
      status: "partial",
    },
    {
      id: "astski_3",
      order_item_id: "ordli_3",
      title: "Подрозетник",
      quantity: 10,
      status: "pending",
    },
  ],
  ...over,
})

describe("buildAssemblyTaskRow", () => {
  it("считает сводку по позициям задания", () => {
    const row = buildAssemblyTaskRow(task())

    expect(row.items_total).toEqual(3)
    expect(row.items_marked).toEqual(2)
    // Нехватка — и «частично», и «нет в наличии».
    expect(row.items_missing).toEqual(1)
  })

  it("подставляет номер заказа и покупателя, когда заказ известен", () => {
    const row = buildAssemblyTaskRow(task(), {
      id: "order_1",
      display_id: 24,
      email: "buyer@example.com",
      customer_name: "Ерлан Абдуллаев",
    })

    expect(row.order_display_id).toEqual(24)
    expect(row.customer_name).toEqual("Ерлан Абдуллаев")
  })

  it("без имени покупателя показывает почту, без заказа — null", () => {
    const withEmail = buildAssemblyTaskRow(task(), {
      id: "order_1",
      display_id: 24,
      email: "buyer@example.com",
      customer_name: null,
    })
    expect(withEmail.customer_name).toEqual("buyer@example.com")

    const withoutOrder = buildAssemblyTaskRow(task())
    expect(withoutOrder.order_display_id).toBeNull()
    expect(withoutOrder.customer_name).toBeNull()
  })

  it("даты сериализуются в ISO, необязательные поля — в null", () => {
    const row = buildAssemblyTaskRow(
      task({ started_at: new Date("2026-09-01T11:30:00.000Z") })
    )

    expect(row.started_at).toEqual("2026-09-01T11:30:00.000Z")
    expect(row.completed_at).toBeNull()
    expect(row.items[1].picked_quantity).toEqual(2)
    expect(row.items[2].picked_quantity).toEqual(0)
    expect(row.items[0].sku).toEqual("CAB-3x25")
    expect(row.items[1].sku).toBeNull()
  })
})

describe("countAssemblyTasks", () => {
  it("считает чипы запросом на каждый статус, а не по странице выборки", async () => {
    const byStatus: Record<string, number> = {
      pending: 3,
      picking: 1,
      assembled: 5,
      shortage: 2,
    }
    const listAndCount = jest.fn(
      async (filters: Record<string, unknown>): Promise<[unknown[], number]> => [
        [],
        filters.status ? byStatus[filters.status as string] : 11,
      ]
    )

    const counts = await countAssemblyTasks(listAndCount, {
      order_id: "order_1",
    })

    expect(counts.total).toEqual(11)
    expect(counts.by_status).toEqual(byStatus)
    // Базовый фильтр не теряется ни в одном из запросов.
    for (const call of listAndCount.mock.calls) {
      expect(call[0].order_id).toEqual("order_1")
    }
  })

  it("пустые счётчики покрывают все статусы", () => {
    expect(Object.values(emptyTaskCounts())).toEqual([0, 0, 0, 0])
  })
})
