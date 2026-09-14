import {
  assertAllItemsMarked,
  assertAssemblyTaskTransition,
  deriveTaskCompletion,
  fulfillmentLinesFromTasks,
  resolveItemMark,
  summarizeOrderAssembly,
} from "../service"
import { readPickerIdentity } from "../roles"

// Инварианты сборки — чистые функции сервиса (без БД): стейт-машина задания,
// арифметика отметки, агрегат заказа и позиции к отгрузке.

describe("assertAssemblyTaskTransition", () => {
  it("проводит задание по пути ожидает → собирается → собрано", () => {
    expect(() => assertAssemblyTaskTransition("pending", "picking")).not.toThrow()
    expect(() =>
      assertAssemblyTaskTransition("picking", "assembled")
    ).not.toThrow()
    expect(() =>
      assertAssemblyTaskTransition("picking", "shortage")
    ).not.toThrow()
  })

  it("нехватка — не тупик: задание можно вернуть в работу", () => {
    expect(() =>
      assertAssemblyTaskTransition("shortage", "picking")
    ).not.toThrow()
  })

  it("собранное задание закрыто, а закрыть незапущенное нельзя", () => {
    expect(() => assertAssemblyTaskTransition("assembled", "picking")).toThrow()
    expect(() => assertAssemblyTaskTransition("pending", "assembled")).toThrow()
  })
})

describe("resolveItemMark", () => {
  it("«набрано» подставляет полное количество, «нет в наличии» — ноль", () => {
    expect(resolveItemMark({ status: "picked", quantity: 7 })).toEqual({
      status: "picked",
      picked_quantity: 7,
    })
    expect(
      resolveItemMark({ status: "missing", quantity: 7, picked_quantity: 5 })
    ).toEqual({ status: "missing", picked_quantity: 0 })
  })

  it("частичная отметка — строго между 1 и quantity−1", () => {
    expect(
      resolveItemMark({ status: "partial", quantity: 10, picked_quantity: 4 })
    ).toEqual({ status: "partial", picked_quantity: 4 })
    expect(() =>
      resolveItemMark({ status: "partial", quantity: 10, picked_quantity: 0 })
    ).toThrow()
    expect(() =>
      resolveItemMark({ status: "partial", quantity: 10, picked_quantity: 10 })
    ).toThrow()
  })

  it("вернуть позицию в «не отмечено» нельзя", () => {
    expect(() =>
      resolveItemMark({ status: "pending", quantity: 3 })
    ).toThrow()
  })
})

describe("deriveTaskCompletion", () => {
  it("всё набрано — задание собрано", () => {
    expect(
      deriveTaskCompletion([{ status: "picked" }, { status: "picked" }])
    ).toEqual("assembled")
  })

  it("частично или нет в наличии — нехватка", () => {
    expect(
      deriveTaskCompletion([{ status: "picked" }, { status: "partial" }])
    ).toEqual("shortage")
    expect(
      deriveTaskCompletion([{ status: "picked" }, { status: "missing" }])
    ).toEqual("shortage")
  })
})

describe("assertAllItemsMarked", () => {
  it("не даёт закрыть задание с неотмеченными позициями", () => {
    expect(() =>
      assertAllItemsMarked([{ status: "picked" }, { status: "pending" }])
    ).toThrow()
    expect(() => assertAllItemsMarked([])).toThrow()
    expect(() =>
      assertAllItemsMarked([{ status: "picked" }, { status: "missing" }])
    ).not.toThrow()
  })
})

describe("summarizeOrderAssembly", () => {
  it("заказ собран, когда собраны ВСЕ задания", () => {
    const summary = summarizeOrderAssembly([
      { status: "assembled" },
      { status: "assembled" },
    ])

    expect(summary.tasks_total).toEqual(2)
    expect(summary.is_finished).toBe(true)
    expect(summary.is_assembled).toBe(true)
    expect(summary.has_shortage).toBe(false)
  })

  it("одно задание в работе — заказ ещё не собран", () => {
    const summary = summarizeOrderAssembly([
      { status: "assembled" },
      { status: "picking" },
      { status: "pending" },
    ])

    expect(summary.tasks_finished).toEqual(1)
    expect(summary.is_finished).toBe(false)
    expect(summary.is_assembled).toBe(false)
  })

  it("нехватка закрывает сборку, но заказ не считается собранным", () => {
    const summary = summarizeOrderAssembly([
      { status: "assembled" },
      { status: "shortage" },
    ])

    expect(summary.is_finished).toBe(true)
    expect(summary.is_assembled).toBe(false)
    expect(summary.has_shortage).toBe(true)
    expect(summary.tasks_shortage).toEqual(1)
  })

  it("у заказа без заданий сборки нет", () => {
    const summary = summarizeOrderAssembly([])

    expect(summary.is_finished).toBe(false)
    expect(summary.is_assembled).toBe(false)
  })
})

describe("fulfillmentLinesFromTasks", () => {
  it("в отгрузку едет только реально набранное", () => {
    const lines = fulfillmentLinesFromTasks([
      {
        status: "assembled",
        items: [
          { order_item_id: "i1", picked_quantity: 3 },
          { order_item_id: "i2", picked_quantity: 0 },
        ],
      },
      {
        status: "shortage",
        items: [{ order_item_id: "i3", picked_quantity: 2 }],
      },
    ])

    expect(lines).toEqual([
      { id: "i1", quantity: 3 },
      { id: "i3", quantity: 2 },
    ])
  })

  it("полная нехватка не даёт ни одной строки к отгрузке", () => {
    expect(
      fulfillmentLinesFromTasks([
        {
          status: "shortage",
          items: [{ order_item_id: "i1", picked_quantity: 0 }],
        },
      ])
    ).toEqual([])
  })
})

describe("readPickerIdentity", () => {
  it("читает роль и группу сборщика из metadata учётки", () => {
    expect(
      readPickerIdentity({ role: "picker", assembly_group: "electrical" })
    ).toEqual({ is_picker: true, group: "electrical" })
  })

  it("продавец и владелец сборщиками не считаются", () => {
    expect(readPickerIdentity({ role: "seller" }).is_picker).toBe(false)
    expect(readPickerIdentity(null).is_picker).toBe(false)
  })

  it("сборщик без группы — группа null (очередь будет пустой)", () => {
    expect(readPickerIdentity({ role: "picker", assembly_group: " " })).toEqual({
      is_picker: true,
      group: null,
    })
  })
})
