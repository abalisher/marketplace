import { durationUnit, waitingUnit } from "../waiting"

// Ожидание в человеческих единицах (гейт U по T4.11). До помощника очередь
// претензий и плитка дашборда показывали «443 ч» — оператор такие часы в дни в
// голове не переводит. Тест закрепляет порог перехода на сутки и то, что часы
// остаются часами, пока срок ответа (24 ч) ещё что-то значит.

describe("waitingUnit", () => {
  it("до двух суток считает часами", () => {
    expect(waitingUnit(0)).toEqual({ unit: "hours", value: 0 })
    expect(waitingUnit(6)).toEqual({ unit: "hours", value: 6 })
    expect(waitingUnit(47)).toEqual({ unit: "hours", value: 47 })
  })

  it("от двух суток переходит на дни", () => {
    expect(waitingUnit(48)).toEqual({ unit: "days", value: 2 })
    expect(waitingUnit(62)).toEqual({ unit: "days", value: 3 })
    expect(waitingUnit(443)).toEqual({ unit: "days", value: 18 })
  })

  it("округляет часы и не уходит в минус", () => {
    expect(waitingUnit(2.6)).toEqual({ unit: "hours", value: 3 })
    expect(waitingUnit(-5)).toEqual({ unit: "hours", value: 0 })
    expect(waitingUnit(null)).toEqual({ unit: "hours", value: 0 })
    expect(waitingUnit(undefined)).toEqual({ unit: "hours", value: 0 })
  })
})

// Длительность стадии (T4.12): среднее время сборки бывает в минутах, а
// среднее время доставки — в сутках; одна единица на оба случая врала бы.
describe("durationUnit", () => {
  it("до часа считает минутами", () => {
    expect(durationUnit(0)).toEqual({ unit: "minutes", value: 0 })
    expect(durationUnit(40)).toEqual({ unit: "minutes", value: 40 })
    expect(durationUnit(59)).toEqual({ unit: "minutes", value: 59 })
  })

  it("от часа до двух суток — часами", () => {
    expect(durationUnit(60)).toEqual({ unit: "hours", value: 1 })
    expect(durationUnit(150)).toEqual({ unit: "hours", value: 3 })
    expect(durationUnit(2879)).toEqual({ unit: "hours", value: 48 })
  })

  it("от двух суток — сутками", () => {
    expect(durationUnit(2880)).toEqual({ unit: "days", value: 2 })
    expect(durationUnit(7200)).toEqual({ unit: "days", value: 5 })
  })

  it("пустое значение и минус считает нулём", () => {
    expect(durationUnit(null)).toEqual({ unit: "minutes", value: 0 })
    expect(durationUnit(-10)).toEqual({ unit: "minutes", value: 0 })
  })
})
