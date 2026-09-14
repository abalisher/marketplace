import {
  DEFAULT_ORDER_SLA_HOURS,
  orderQueueTiming,
  orderSlaHours,
  parseSlaOverrides,
} from "../sla"

// Сроки стадий и время строки очереди: правило считается на бэкенде, панель
// только рисует. Проверяем то, из-за чего таск и заведён — заказ, стоящий в
// статусе дольше нормы, обязан помечаться просроченным (T4.12).

const hoursAgo = (hours: number, now: number) =>
  new Date(now - hours * 3_600_000).toISOString()

describe("orderQueueTiming", () => {
  const now = Date.parse("2026-09-03T12:00:00.000Z")
  const sla = DEFAULT_ORDER_SLA_HOURS

  it("считает возраст заказа и время в текущем статусе раздельно", () => {
    const timing = orderQueueTiming(
      {
        status: "assembled",
        created_at: hoursAgo(150, now),
        updated_at: hoursAgo(6, now),
      },
      sla,
      now
    )

    expect(timing.age_hours).toBe(150)
    expect(timing.status_hours).toBe(6)
  })

  it("помечает просрочку по сроку СВОЕГО статуса", () => {
    const shared = { created_at: hoursAgo(200, now) }

    // «Собран» имеет 12 часов на отгрузку — шесть часов ещё в норме.
    expect(
      orderQueueTiming(
        { ...shared, status: "assembled", updated_at: hoursAgo(6, now) },
        sla,
        now
      ).overdue
    ).toBe(false)
    // «Новый» — два часа на подтверждение: те же шесть часов уже просрочка.
    expect(
      orderQueueTiming(
        { ...shared, status: "new", updated_at: hoursAgo(6, now) },
        sla,
        now
      ).overdue
    ).toBe(true)
  })

  it("не назначает срок доставленным, закрытым и отменённым", () => {
    for (const status of ["delivered", "closed", "canceled", "returned"] as const) {
      const timing = orderQueueTiming(
        {
          status,
          created_at: hoursAgo(500, now),
          updated_at: hoursAgo(400, now),
        },
        sla,
        now
      )
      expect(timing.sla_hours).toBeNull()
      expect(timing.overdue).toBe(false)
    }
  })

  it("считает время в статусе от оформления, если переходов ещё не было", () => {
    const timing = orderQueueTiming(
      { status: "new", created_at: hoursAgo(5, now), updated_at: null },
      sla,
      now
    )

    expect(timing.status_hours).toBe(5)
    expect(timing.overdue).toBe(true)
  })

  it("битую дату считает нулём, а не выдуманным возрастом", () => {
    const timing = orderQueueTiming(
      { status: "new", created_at: "не дата", updated_at: "не дата" },
      sla,
      now
    )

    expect(timing.age_hours).toBe(0)
    expect(timing.status_hours).toBe(0)
    expect(timing.overdue).toBe(false)
  })
})

describe("parseSlaOverrides", () => {
  it("читает пары «статус=часы»", () => {
    expect(parseSlaOverrides("new=1,assembled=6")).toEqual({
      new: 1,
      assembled: 6,
    })
  })

  it("ноль и отрицательное значение читает как «срока нет»", () => {
    expect(parseSlaOverrides("new=0,confirmed=-3")).toEqual({
      new: null,
      confirmed: null,
    })
  })

  it("молча пропускает мусор: опечатка в env не валит очередь", () => {
    expect(parseSlaOverrides("нету=5,new=абв,,=,in_delivery=48")).toEqual({
      in_delivery: 48,
    })
    expect(parseSlaOverrides(undefined)).toEqual({})
    expect(parseSlaOverrides("   ")).toEqual({})
  })
})

describe("orderSlaHours", () => {
  afterEach(() => {
    delete process.env.ORDER_SLA_HOURS
  })

  it("без env отдаёт нормы по умолчанию", () => {
    expect(orderSlaHours()).toEqual(DEFAULT_ORDER_SLA_HOURS)
  })

  it("перекрывает только заданные статусы", () => {
    process.env.ORDER_SLA_HOURS = "new=1"
    const sla = orderSlaHours()

    expect(sla.new).toBe(1)
    expect(sla.assembled).toBe(DEFAULT_ORDER_SLA_HOURS.assembled)
  })
})
