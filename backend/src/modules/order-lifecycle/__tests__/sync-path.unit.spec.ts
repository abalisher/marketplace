import { planLifecycleSyncPath } from "../sync-path"

// Планировщик догона за ядром (T4.14b): по какому пути наш цикл догоняет
// статус, который уже наступил в ядре. Чистая функция — без БД.
describe("planLifecycleSyncPath", () => {
  it("возвращает пустой путь, когда цикл уже в целевом статусе", () => {
    // Эхо собственных workflow: ship-order сам вызывает ядро и получает
    // shipment.created обратно — догону делать нечего.
    expect(planLifecycleSyncPath("in_delivery", "in_delivery")).toEqual([])
    expect(planLifecycleSyncPath("assembled", "assembled")).toEqual([])
  })

  it("догоняет соседний статус одним хопом", () => {
    expect(planLifecycleSyncPath("assembled", "in_delivery")).toEqual([
      "in_delivery",
    ])
    expect(planLifecycleSyncPath("in_delivery", "delivered")).toEqual([
      "delivered",
    ])
  })

  it("проходит пропущенные этапы по очереди, когда ядро ушло вперёд", () => {
    expect(planLifecycleSyncPath("confirmed", "in_delivery")).toEqual([
      "assembling",
      "assembled",
      "in_delivery",
    ])
    expect(planLifecycleSyncPath("new", "closed")).toEqual([
      "confirmed",
      "assembling",
      "assembled",
      "in_delivery",
      "delivered",
      "closed",
    ])
  })

  it("ведёт путь через «Собран», а не через «Частично собран»", () => {
    // Обе ветки дают одинаковую длину; частичность — наша величина, ядро о ней
    // не сообщает, поэтому домысливать её при догоне нельзя.
    expect(planLifecycleSyncPath("assembling", "in_delivery")).toEqual([
      "assembled",
      "in_delivery",
    ])
  })

  it("догоняет «Частично собран», если он и есть цель", () => {
    expect(planLifecycleSyncPath("confirmed", "partially_assembled")).toEqual([
      "assembling",
      "partially_assembled",
    ])
  })

  it("отменяет с любого этапа до отгрузки одним хопом", () => {
    expect(planLifecycleSyncPath("new", "canceled")).toEqual(["canceled"])
    expect(planLifecycleSyncPath("assembled", "canceled")).toEqual(["canceled"])
  })

  it("возвращает пустой путь, когда наш цикл ушёл вперёд ядра", () => {
    // Отмена после вручения стейт-машиной запрещена — догон не выдумывает
    // переход, а оставляет расхождение вызывающей стороне (та пишет warn).
    expect(planLifecycleSyncPath("delivered", "canceled")).toEqual([])
    expect(planLifecycleSyncPath("closed", "in_delivery")).toEqual([])
  })

  it("возвращает пустой путь из терминальных статусов", () => {
    expect(planLifecycleSyncPath("canceled", "closed")).toEqual([])
    expect(planLifecycleSyncPath("returned", "delivered")).toEqual([])
  })

  it("не заводит путь через терминальные статусы", () => {
    const path = planLifecycleSyncPath("new", "delivered")

    expect(path).not.toContain("canceled")
    expect(path).not.toContain("returned")
  })
})
