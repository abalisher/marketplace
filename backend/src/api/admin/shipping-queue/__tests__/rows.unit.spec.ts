import { OrderAssemblySummary } from "../../../../modules/assembly/service"
import { TaskLike } from "../../assembly-tasks/rows"
import {
  buildCategoryTiles,
  buildShippingRow,
  countByStage,
  shipTarget,
  shippingStage,
} from "../rows"

// Правила очереди отгрузки: стадия заказа, плитки категорий, доступность
// перехода «передать водителю». Экран рисует готовое — считаем здесь.

const summary = (over: Partial<OrderAssemblySummary> = {}): OrderAssemblySummary => ({
  tasks_total: 2,
  tasks_finished: 2,
  tasks_assembled: 2,
  tasks_shortage: 0,
  is_finished: true,
  is_assembled: true,
  has_shortage: false,
  ...over,
})

const task = (over: Partial<TaskLike> = {}): TaskLike => ({
  id: "astsk_1",
  order_id: "order_1",
  category_handle: "electrical",
  category_name: "Электрика",
  status: "picking",
  assignee_id: "usr_picker_1",
  created_at: new Date("2026-09-01T10:00:00.000Z"),
  items: [
    {
      id: "astski_1",
      order_item_id: "ordli_1",
      title: "Кабель ВВГнг 3×2.5",
      quantity: 100,
      picked_quantity: 100,
      status: "picked",
    },
    {
      id: "astski_2",
      order_item_id: "ordli_2",
      title: "Автомат C16",
      quantity: 4,
      picked_quantity: 0,
      status: "pending",
    },
  ],
  ...over,
})

describe("стадия заказа в очереди отгрузки", () => {
  it("сборщики ещё работают — «собирается»", () => {
    expect(shippingStage(summary({ is_finished: false, tasks_finished: 1 }))).toBe(
      "assembling"
    )
  })

  it("по всем заданиям отработали, нехватки нет — «готов к отгрузке»", () => {
    expect(shippingStage(summary())).toBe("ready")
  })

  // Нехватка — отдельная стадия, а не оттенок готовности: по ней отгрузка
  // принимает решение (довезти или отправить как есть).
  it("часть не набралась — «нехватка», а не «готов»", () => {
    expect(
      shippingStage(
        summary({
          tasks_assembled: 1,
          tasks_shortage: 1,
          is_assembled: false,
          has_shortage: true,
        })
      )
    ).toBe("shortage")
  })
})

describe("счётчики чипов", () => {
  it("считает заказы по стадиям и всего", () => {
    expect(
      countByStage(["assembling", "ready", "shortage", "assembling"])
    ).toEqual({
      total: 4,
      by_stage: { assembling: 2, ready: 1, shortage: 1 },
    })
  })

  it("пустая очередь — нули по всем стадиям", () => {
    expect(countByStage([])).toEqual({
      total: 0,
      by_stage: { assembling: 0, ready: 0, shortage: 0 },
    })
  })
})

describe("плитка категории", () => {
  it("несёт сводку по позициям и имя сборщика вместо id", () => {
    const [tile] = buildCategoryTiles(
      [task()],
      new Map([["usr_picker_1", "Сборщик Электрика"]])
    )

    expect(tile.category_name).toBe("Электрика")
    expect(tile.items_total).toBe(2)
    expect(tile.items_marked).toBe(1)
    expect(tile.assignee_name).toBe("Сборщик Электрика")
    // Списка позиций в плитке нет: отгрузке нужен светофор по категориям.
    expect(tile).not.toHaveProperty("items")
  })

  it("сборщика ещё не взяли — имя пустое, а не «неизвестно»", () => {
    const [tile] = buildCategoryTiles(
      [task({ status: "pending", assignee_id: null })],
      new Map()
    )

    expect(tile.assignee_name).toBeNull()
    expect(tile.status).toBe("pending")
  })
})

describe("цель перехода «передать водителю»", () => {
  const lines = [{ id: "ordli_1", quantity: 100 }]

  it("берёт живой ещё не отгруженный fulfillment", () => {
    expect(
      shipTarget(
        [
          { id: "ful_canceled", canceled_at: new Date() },
          { id: "ful_shipped", shipped_at: new Date() },
          { id: "ful_ready" },
        ],
        lines
      )
    ).toEqual({ fulfillment_id: "ful_ready", items: lines })
  })

  it("отгружать нечего — цели нет", () => {
    expect(shipTarget([{ id: "ful_ready" }], [])).toBeNull()
    expect(shipTarget([{ id: "ful_shipped", shipped_at: new Date() }], lines)).toBeNull()
  })
})

describe("строка очереди", () => {
  const target = { fulfillment_id: "ful_1", items: [{ id: "ordli_1", quantity: 1 }] }

  it("собран и статус позволяет — кнопка отгрузки доступна", () => {
    const row = buildShippingRow({
      order_id: "order_1",
      order_status: "assembled",
      summary: summary(),
      categories: [],
      order: null,
      ship_target: target,
    })

    expect(row.stage).toBe("ready")
    expect(row.can_ship).toBe(true)
  })

  // Нехватка не блокирует отгрузку молча — решение принимает человек, кнопка
  // остаётся доступной (стейт-машина разрешает partially_assembled → in_delivery).
  it("нехватка не запрещает отгрузку", () => {
    const row = buildShippingRow({
      order_id: "order_1",
      order_status: "partially_assembled",
      summary: summary({
        tasks_assembled: 1,
        tasks_shortage: 1,
        is_assembled: false,
        has_shortage: true,
      }),
      categories: [],
      order: null,
      ship_target: target,
    })

    expect(row.stage).toBe("shortage")
    expect(row.can_ship).toBe(true)
  })

  it("сборка не окончена — отгрузить нельзя", () => {
    const row = buildShippingRow({
      order_id: "order_1",
      order_status: "confirmed",
      summary: summary({ tasks_finished: 1, is_finished: false, is_assembled: false }),
      categories: [],
      order: null,
      ship_target: null,
    })

    expect(row.stage).toBe("assembling")
    expect(row.can_ship).toBe(false)
  })

  // Задания закрыты, но жизненный цикл ещё не догнал факт сборки (сбой
  // fulfillment): переход запрещён — иначе панель предложит действие, которое
  // стейт-машина отвергнет.
  it("статус заказа не допускает отгрузку — кнопка недоступна", () => {
    const row = buildShippingRow({
      order_id: "order_1",
      order_status: "confirmed",
      summary: summary(),
      categories: [],
      order: null,
      ship_target: target,
    })

    expect(row.can_ship).toBe(false)
  })
})
