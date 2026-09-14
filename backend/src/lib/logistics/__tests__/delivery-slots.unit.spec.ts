import {
  DELIVERY_WINDOW_HOURS,
  SLOT_HORIZON_DAYS,
  dateLabel,
  formatDeliverySlot,
  isSlotAvailable,
  isSlotDate,
  listDeliverySlots,
  parseDeliverySlot,
  slotStartMs,
} from "../delivery-slots"

// Домен слота доставки (T5.6). Всё «сейчас» фиксировано моментом UTC: слот
// живёт в астанинских сутках (UTC+5), и проверять его на локальном времени
// машины нельзя — прогон в другой зоне давал бы другой ответ.

// 5 сентября 2026, 07:00 по Астане (02:00 UTC) — утро рабочего дня.
const MORNING = new Date("2026-09-05T02:00:00.000Z")

describe("сутки и окна Астаны", () => {
  it("час UTC до полуночи — это уже следующие астанинские сутки", () => {
    // 20:30 UTC = 01:30 6 сентября в Астане.
    expect(dateLabel("2026-09-06", new Date("2026-09-05T20:30:00.000Z"))).toBe(
      "сегодня"
    )
  })

  it("ближние дни называются словами, дальние — числом и днём недели", () => {
    expect(dateLabel("2026-09-05", MORNING)).toBe("сегодня")
    expect(dateLabel("2026-09-06", MORNING)).toBe("завтра")
    expect(dateLabel("2026-09-08", MORNING)).toBe("8 сентября, вторник")
  })

  it("слот одной строкой читается человеком", () => {
    expect(
      formatDeliverySlot({ date: "2026-09-06", window: "day" }, MORNING)
    ).toBe("завтра, 13:00–17:00")
  })

  it("начало окна считается в астанинском времени", () => {
    // 09:00 в Астане = 04:00 UTC.
    expect(slotStartMs({ date: "2026-09-05", window: "morning" })).toBe(
      Date.parse("2026-09-05T04:00:00.000Z")
    )
  })
})

describe("валидация даты слота", () => {
  it("несуществующий день не проходит, хотя формат верный", () => {
    expect(isSlotDate("2026-02-31")).toBe(false)
    expect(isSlotDate("2026-02-28")).toBe(true)
  })

  it("свободный текст и другой формат отвергаются", () => {
    expect(isSlotDate("завтра")).toBe(false)
    expect(isSlotDate("05.09.2026")).toBe(false)
    expect(isSlotDate(undefined)).toBe(false)
  })
})

describe("доступность слота", () => {
  it("окно, до начала которого меньше запаса на сборку, не предлагается", () => {
    // 11:30 по Астане: дневное окно (13:00) ближе трёх часов — уже нельзя.
    const now = new Date("2026-09-05T06:30:00.000Z")
    expect(isSlotAvailable({ date: "2026-09-05", window: "day" }, now)).toBe(
      false
    )
    expect(isSlotAvailable({ date: "2026-09-05", window: "evening" }, now)).toBe(
      true
    )
  })

  it("вчерашнее окно взять нельзя", () => {
    expect(
      isSlotAvailable({ date: "2026-09-04", window: "evening" }, MORNING)
    ).toBe(false)
  })

  it("дальше горизонта планирования слотов нет", () => {
    expect(
      isSlotAvailable({ date: "2026-09-11", window: "morning" }, MORNING)
    ).toBe(true)
    expect(
      isSlotAvailable({ date: "2026-09-12", window: "morning" }, MORNING)
    ).toBe(false)
  })
})

describe("список слотов", () => {
  it("идёт по возрастанию времени и начинается с ближайшего доступного", () => {
    // В 07:00 утреннее окно (09:00) ближе запаса на сборку — первым идёт дневное.
    const slots = listDeliverySlots(MORNING)
    expect(slots[0]).toMatchObject({
      date: "2026-09-05",
      window: "day",
      window_label: "13:00–17:00",
      date_label: "сегодня",
      label: "сегодня, 13:00–17:00",
    })
    const starts = slots.map((slot) => slotStartMs(slot))
    expect([...starts].sort((a, b) => a - b)).toEqual(starts)
  })

  it("сегодняшние прошедшие окна выпадают, полные дни остаются целыми", () => {
    // 18:00 по Астане: сегодня не осталось ничего, считаем полные дни вперёд.
    const evening = new Date("2026-09-05T13:00:00.000Z")
    const slots = listDeliverySlots(evening)
    const windows = Object.keys(DELIVERY_WINDOW_HOURS).length
    expect(slots.every((slot) => slot.date > "2026-09-05")).toBe(true)
    expect(slots).toHaveLength((SLOT_HORIZON_DAYS - 1) * windows)
  })
})

describe("разбор слота из внешних данных", () => {
  it("возвращает слот только для валидного и ещё доступного окна", () => {
    expect(parseDeliverySlot("2026-09-06", "day", MORNING)).toEqual({
      date: "2026-09-06",
      window: "day",
    })
    expect(parseDeliverySlot("2026-09-06", "ночью", MORNING)).toBeNull()
    expect(parseDeliverySlot("2026-09-01", "day", MORNING)).toBeNull()
  })
})
