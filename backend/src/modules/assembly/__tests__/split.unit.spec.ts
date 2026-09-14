import {
  splitOrderLinesByCategory,
  UNCATEGORIZED_HANDLE,
  UNCATEGORIZED_NAME,
  OrderLineForSplit,
} from "../split"

// Распад заказа на задания сборки — чистая функция (без БД). Правило владельца:
// одно задание на КАЖДУЮ присутствующую в заказе категорию, позиции делятся
// между заданиями без остатка.

const line = (
  id: string,
  handle: string | null,
  quantity = 1
): OrderLineForSplit => ({
  order_item_id: id,
  variant_id: `variant_${id}`,
  title: `Товар ${id}`,
  sku: `SKU-${id}`,
  quantity,
  category_handle: handle,
  category_name: handle ? `Категория ${handle}` : null,
})

describe("splitOrderLinesByCategory", () => {
  it("заказ из трёх категорий даёт три задания", () => {
    const tasks = splitOrderLinesByCategory([
      line("i1", "electrical"),
      line("i2", "finishing"),
      line("i3", "fasteners"),
    ])

    expect(tasks).toHaveLength(3)
    expect(tasks.map((t) => t.category_handle)).toEqual([
      // Порядок — канонический порядок категорий каталога.
      "finishing",
      "electrical",
      "fasteners",
    ])
    expect(tasks.every((t) => t.items.length === 1)).toBe(true)
  })

  it("позиции одной категории попадают в одно задание", () => {
    const tasks = splitOrderLinesByCategory([
      line("i1", "plumbing", 2),
      line("i2", "plumbing", 5),
    ])

    expect(tasks).toHaveLength(1)
    expect(tasks[0].items.map((i) => i.order_item_id)).toEqual(["i1", "i2"])
    expect(tasks[0].items.map((i) => i.quantity)).toEqual([2, 5])
    expect(tasks[0].category_name).toEqual("Категория plumbing")
  })

  it("позиции заказа делятся между заданиями без остатка", () => {
    const lines = [
      line("i1", "electrical"),
      line("i2", "finishing"),
      line("i3", "electrical"),
      line("i4", null),
    ]

    const tasks = splitOrderLinesByCategory(lines)
    const split = tasks.flatMap((t) => t.items.map((i) => i.order_item_id))

    expect(split.sort()).toEqual(["i1", "i2", "i3", "i4"])
  })

  it("позиция без категории уходит в отдельную группу и не теряется", () => {
    const tasks = splitOrderLinesByCategory([
      line("i1", "finishing"),
      line("i2", null),
    ])

    const last = tasks[tasks.length - 1]
    expect(last.category_handle).toEqual(UNCATEGORIZED_HANDLE)
    expect(last.category_name).toEqual(UNCATEGORIZED_NAME)
    expect(last.items.map((i) => i.order_item_id)).toEqual(["i2"])
  })

  it("пустой заказ не даёт заданий, нулевые позиции пропускаются", () => {
    expect(splitOrderLinesByCategory([])).toEqual([])
    expect(splitOrderLinesByCategory([line("i1", "finishing", 0)])).toEqual([])
  })
})
