import { buildStageReport } from "../stages"

// Отчёт по стадиям: принято → собрано → отгружено → доставлено со средним
// временем (T4.12). Проверяем правило усреднения на чистой функции — выборка
// из БД к правилу отношения не имеет.

const at = (iso: string) => iso

const event = (lifecycleId: string, status: string, iso: string) => ({
  to_status: status,
  created_at: at(iso),
  order_lifecycle_id: lifecycleId,
})

describe("buildStageReport", () => {
  it("считает стадии от оформления по цепочке переходов", () => {
    const report = buildStageReport(
      [{ id: "ordlc_1", created_at: "2026-09-01T06:00:00.000Z" }],
      [
        event("ordlc_1", "confirmed", "2026-09-01T07:00:00.000Z"),
        event("ordlc_1", "assembling", "2026-09-01T07:30:00.000Z"),
        event("ordlc_1", "assembled", "2026-09-01T10:00:00.000Z"),
        event("ordlc_1", "in_delivery", "2026-09-01T12:00:00.000Z"),
        event("ordlc_1", "delivered", "2026-09-01T15:00:00.000Z"),
      ],
      30
    )

    expect(report.window_days).toBe(30)
    expect(report.orders_total).toBe(1)
    expect(
      report.stages.map((stage) => [stage.key, stage.avg_minutes])
    ).toEqual([
      ["accepted", 60],
      ["assembled", 180],
      ["shipped", 120],
      ["delivered", 180],
    ])
  })

  it("усредняет по заказам и показывает худший случай", () => {
    const report = buildStageReport(
      [
        { id: "ordlc_1", created_at: "2026-09-01T06:00:00.000Z" },
        { id: "ordlc_2", created_at: "2026-09-02T06:00:00.000Z" },
      ],
      [
        event("ordlc_1", "confirmed", "2026-09-01T07:00:00.000Z"),
        event("ordlc_2", "confirmed", "2026-09-02T09:00:00.000Z"),
      ],
      30
    )

    const accepted = report.stages[0]
    expect(accepted.orders).toBe(2)
    expect(accepted.avg_minutes).toBe(120)
    expect(accepted.max_minutes).toBe(180)
  })

  it("незавершённую стадию не считает и дальше по цепочке не идёт", () => {
    const report = buildStageReport(
      [{ id: "ordlc_1", created_at: "2026-09-01T06:00:00.000Z" }],
      [
        event("ordlc_1", "confirmed", "2026-09-01T07:00:00.000Z"),
        // Сборку ещё не закончили — «отгружено» и «доставлено» посчитать не из
        // чего, даже если бы переходы пришли (их не бывает без сборки).
      ],
      30
    )

    expect(report.stages[0].orders).toBe(1)
    for (const stage of report.stages.slice(1)) {
      expect(stage.orders).toBe(0)
      expect(stage.avg_minutes).toBeNull()
      expect(stage.max_minutes).toBeNull()
    }
  })

  it("частичная сборка закрывает стадию «собрано»", () => {
    const report = buildStageReport(
      [{ id: "ordlc_1", created_at: "2026-09-01T06:00:00.000Z" }],
      [
        event("ordlc_1", "confirmed", "2026-09-01T07:00:00.000Z"),
        event("ordlc_1", "partially_assembled", "2026-09-01T08:00:00.000Z"),
      ],
      30
    )

    expect(report.stages[1].orders).toBe(1)
    expect(report.stages[1].avg_minutes).toBe(60)
  })

  it("берёт ПЕРВЫЙ переход в статус: возврат в сборку стадию не удлиняет", () => {
    const report = buildStageReport(
      [{ id: "ordlc_1", created_at: "2026-09-01T06:00:00.000Z" }],
      [
        event("ordlc_1", "confirmed", "2026-09-01T07:00:00.000Z"),
        event("ordlc_1", "assembled", "2026-09-01T08:00:00.000Z"),
        event("ordlc_1", "assembling", "2026-09-01T09:00:00.000Z"),
        event("ordlc_1", "assembled", "2026-09-01T18:00:00.000Z"),
      ],
      30
    )

    expect(report.stages[1].avg_minutes).toBe(60)
  })

  it("заказ без даты оформления в отчёт не берётся", () => {
    const report = buildStageReport(
      [{ id: "ordlc_1", created_at: null }],
      [event("ordlc_1", "confirmed", "2026-09-01T07:00:00.000Z")],
      30
    )

    expect(report.orders_total).toBe(1)
    expect(report.stages[0].orders).toBe(0)
  })

  it("пустое окно отдаёт стадии без средних, а не нули", () => {
    const report = buildStageReport([], [], 7)

    expect(report.orders_total).toBe(0)
    expect(report.stages).toHaveLength(4)
    for (const stage of report.stages) {
      expect(stage.avg_minutes).toBeNull()
    }
  })
})
