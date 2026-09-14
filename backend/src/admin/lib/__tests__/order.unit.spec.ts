import {
  AdminOrderLifecycleCounts,
  ORDER_CARD_PATH,
  ORDER_DELIVERY_METHOD_META,
  ORDER_LIFECYCLE_STATUSES,
  ORDER_LIFECYCLE_STATUS_META,
  ORDER_PAYMENT_STATE_META,
  ORDER_QUEUE_CHIPS,
  OrderLifecycleEvent,
  canRescheduleDelivery,
  orderCardStages,
  orderDeliveryMethodMeta,
  orderPaymentStateMeta,
  orderQueueChipCount,
  orderStatusMeta,
  orderTransitions,
} from "../order"

// Словари статусов и способов получения читаются ТОЛЬКО через функции с
// фолбэком: значения приходят из БД строками, и там остались снятые с активного
// пути пивотом 2026-07-22 (delivery_method «pickup», «counter» от POS). Прямая
// индексация давала undefined и роняла экран очереди заказов целиком, а вместе с
// виджетом — и ядровую страницу заказа.
describe("admin lib/order — словари статусов и способов получения", () => {
  it("отдаёт метаданные для каждого известного статуса", () => {
    for (const status of ORDER_LIFECYCLE_STATUSES) {
      expect(orderStatusMeta(status)).toBe(ORDER_LIFECYCLE_STATUS_META[status])
    }
  })

  it("для неизвестного, пустого и отсутствующего статуса отдаёт прочерк", () => {
    for (const value of ["archived", "", null, undefined]) {
      const meta = orderStatusMeta(value)
      expect(meta.label).toBe("common.unknownValue")
      expect(meta.color).toBe("grey")
      expect(meta.dotClass).toBeTruthy()
    }
  })

  it("отдаёт метаданные известного способа получения", () => {
    expect(orderDeliveryMethodMeta("delivery")).toBe(
      ORDER_DELIVERY_METHOD_META.delivery
    )
  })

  it("для снятых пивотом способов получения отдаёт прочерк, а не падает", () => {
    for (const value of ["pickup", "counter", null, undefined]) {
      expect(orderDeliveryMethodMeta(value).label).toBe("common.unknownValue")
    }
  })

  it("даёт переходы для живой пары «способ + статус»", () => {
    expect(orderTransitions("delivery", "new").map((t) => t.path)).toEqual([
      "confirm",
      "cancel",
    ])
  })

  // Решение владельца 2026-09-06: сборку закрывает СБОРЩИК, отметив позиции в
  // своём задании (T10.11/T10.12), а не продавец кнопкой из карточки. Кнопка
  // обходила задания стороной: заказ уезжал в «Собран», задания навсегда
  // оставались `pending`, и сборщик видел работу по отгруженному заказу.
  it("из «В сборке» продавцу доступна только отмена — сборку закрывает сборщик", () => {
    expect(orderTransitions("delivery", "assembling").map((t) => t.path)).toEqual([
      "cancel",
    ])
  })

  it("не даёт переходов для снятых способов и неизвестных статусов", () => {
    expect(orderTransitions("pickup", "new")).toEqual([])
    expect(orderTransitions("counter", "assembled")).toEqual([])
    expect(orderTransitions("delivery", "archived")).toEqual([])
    expect(orderTransitions("delivery", null)).toEqual([])
    expect(orderTransitions(null, "new")).toEqual([])
  })
})

// Чипы-фильтры экрана «Заказы» (T4.2b): «Все» + разбиение всех статусов без
// пересечений (единственная группа — «Сборка», решение T4.2a). Если чип
// потеряет статус или покроет его дважды, счётчики разойдутся с «Все».
describe("admin lib/order — чипы-фильтры и счётчики экрана «Заказы»", () => {
  it("чипы покрывают каждый статус ровно один раз, «Все» — без фильтра", () => {
    const [all, ...filtered] = ORDER_QUEUE_CHIPS
    expect(all.statuses).toBeNull()
    const covered = filtered.flatMap((chip) => chip.statuses ?? [])
    expect([...covered].sort()).toEqual([...ORDER_LIFECYCLE_STATUSES].sort())
    expect(new Set(covered).size).toBe(covered.length)
  })

  it("считает число на чипе суммой его статусов, «Все» — общим счётом", () => {
    const counts = {
      total: 7,
      by_status: { assembling: 2, partially_assembled: 3, new: 2 },
    } as unknown as AdminOrderLifecycleCounts
    const chip = (key: string) =>
      ORDER_QUEUE_CHIPS.find((entry) => entry.key === key)!
    expect(orderQueueChipCount(counts, chip("all"))).toBe(7)
    expect(orderQueueChipCount(counts, chip("assembly"))).toBe(5)
    expect(orderQueueChipCount(counts, chip("new"))).toBe(2)
    // Статуса нет в ответе (расхождение версий) — ноль, а не NaN.
    expect(orderQueueChipCount(counts, chip("delivered"))).toBe(0)
  })

  it("отдаёт метаданные каждого состояния оплаты, неизвестное — прочерком", () => {
    for (const state of Object.keys(ORDER_PAYMENT_STATE_META)) {
      expect(orderPaymentStateMeta(state)).toBe(
        ORDER_PAYMENT_STATE_META[state as keyof typeof ORDER_PAYMENT_STATE_META]
      )
    }
    for (const value of ["refunded", "", null, undefined]) {
      const meta = orderPaymentStateMeta(value)
      expect(meta.label).toBe("common.unknownValue")
      expect(meta.className).toBe("sm-pay-none")
    }
  })
})

// Таймлайн карточки заказа (drawer 1c, T4.2c): прямой путь заказа с отметками
// времени из лога переходов. Стадия «Собран» покрывает и частичную сборку —
// иначе у половины заказов путь выглядел бы разным.
describe("admin lib/order — таймлайн карточки заказа", () => {
  const event = (
    from: string | null,
    to: string,
    at: string
  ): OrderLifecycleEvent =>
    ({
      id: `ordlce_${to}`,
      from_status: from,
      to_status: to,
      actor_type: "admin",
      actor_id: null,
      reason: null,
      created_at: at,
    }) as OrderLifecycleEvent

  // Перенос доставки (T5.6b) ложится в тот же лог, но статус не двигает: в
  // обоих статусах записи стоит текущий. На таймлайне такая запись отметила бы
  // стадию временем переноса — считаем стадии только по переходам.
  const slotEvent = (at: string): OrderLifecycleEvent =>
    ({
      id: "ordlce_slot",
      kind: "slot",
      from_status: "confirmed",
      to_status: "confirmed",
      actor_type: "admin",
      actor_id: null,
      reason: "покупатель просит четверг",
      from_slot_date: "2026-09-06",
      from_slot_window: "day",
      to_slot_date: "2026-09-10",
      to_slot_window: "morning",
      created_at: at,
    }) as OrderLifecycleEvent

  it("у нового заказа первая стадия текущая, остальные впереди", () => {
    const stages = orderCardStages("new", [])
    expect(stages.map((s) => s.state)).toEqual([
      "current",
      "upcoming",
      "upcoming",
      "upcoming",
      "upcoming",
      "upcoming",
      "upcoming",
    ])
    expect(stages).toHaveLength(ORDER_CARD_PATH.length)
    // Создание заказа переходом не логируется — времени у стадии нет.
    expect(stages[0].at).toBeNull()
  })

  it("проставляет время пройденных стадий из лога переходов", () => {
    const stages = orderCardStages("in_delivery", [
      event("new", "confirmed", "2026-08-11T18:00:00.000Z"),
      event("confirmed", "assembling", "2026-08-11T18:05:00.000Z"),
      event("assembling", "assembled", "2026-08-11T18:40:00.000Z"),
      event("assembled", "in_delivery", "2026-08-11T19:10:00.000Z"),
    ])

    expect(stages.map((s) => [s.status, s.state, s.at])).toEqual([
      ["new", "done", null],
      ["confirmed", "done", "2026-08-11T18:00:00.000Z"],
      ["assembling", "done", "2026-08-11T18:05:00.000Z"],
      ["assembled", "done", "2026-08-11T18:40:00.000Z"],
      ["in_delivery", "current", "2026-08-11T19:10:00.000Z"],
      ["delivered", "upcoming", null],
      ["closed", "upcoming", null],
    ])
  })

  it("частичная сборка стоит на стадии «Собран», отдельной стадии нет", () => {
    const stages = orderCardStages("partially_assembled", [
      event("new", "confirmed", "2026-08-11T18:00:00.000Z"),
      event("confirmed", "assembling", "2026-08-11T18:05:00.000Z"),
      event("assembling", "partially_assembled", "2026-08-11T18:30:00.000Z"),
    ])

    expect(stages.map((s) => s.status)).toEqual(ORDER_CARD_PATH)
    const assembled = stages.find((s) => s.status === "assembled")!
    expect(assembled.state).toBe("current")
    expect(assembled.at).toBe("2026-08-11T18:30:00.000Z")
  })

  it("отменённый заказ обрывает путь: пройденное + стадия «Отменён»", () => {
    const stages = orderCardStages("canceled", [
      event("new", "confirmed", "2026-08-11T18:00:00.000Z"),
      event("confirmed", "canceled", "2026-08-11T18:20:00.000Z"),
    ])

    const last = stages[stages.length - 1]
    expect(last.status).toBe("canceled")
    expect(last.state).toBe("current")
    expect(last.at).toBe("2026-08-11T18:20:00.000Z")
    expect(stages.find((s) => s.status === "confirmed")!.state).toBe("done")
    expect(stages.find((s) => s.status === "in_delivery")!.state).toBe(
      "upcoming"
    )
  })

  it("перенос доставки не сдвигает время стадии на таймлайне", () => {
    const stages = orderCardStages("confirmed", [
      event("new", "confirmed", "2026-09-04T10:00:00.000Z"),
      slotEvent("2026-09-04T15:00:00.000Z"),
    ])

    const confirmed = stages.find((s) => s.status === "confirmed")!
    expect(confirmed.state).toBe("current")
    expect(confirmed.at).toBe("2026-09-04T10:00:00.000Z")
  })

  it("у заказа без цикла ни одна стадия не считается текущей", () => {
    expect(orderCardStages(null, []).every((s) => s.state === "upcoming")).toBe(
      true
    )
  })
})

// Кнопка «Перенести доставку» показывается, пока заказ не уехал: список статусов
// здесь — зеркало SLOT_RESCHEDULE_STATUSES бэкенда (серверный код в бандл
// админки не тянется). Разъедутся — продавец увидит кнопку, которую сервер
// отклонит.
describe("admin lib/order — перенос доставки", () => {
  it("разрешает перенос до отгрузки", () => {
    for (const status of [
      "new",
      "confirmed",
      "assembling",
      "partially_assembled",
      "assembled",
    ]) {
      expect(canRescheduleDelivery("delivery", status)).toBe(true)
    }
  })

  it("запрещает перенос после отгрузки и у терминальных статусов", () => {
    for (const status of [
      "in_delivery",
      "delivered",
      "closed",
      "canceled",
      "returned",
    ]) {
      expect(canRescheduleDelivery("delivery", status)).toBe(false)
    }
  })

  it("запрещает перенос без статуса и у снятых способов получения", () => {
    expect(canRescheduleDelivery("delivery", null)).toBe(false)
    expect(canRescheduleDelivery(null, "new")).toBe(false)
    // pickup/counter сняты пивотом 2026-07-22, но в базе такие заказы есть.
    expect(canRescheduleDelivery("pickup", "new")).toBe(false)
  })
})
