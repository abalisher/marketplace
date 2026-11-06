import {
  formatOrderNumber,
  orderLabel,
  orderNumberYear,
  parseOrderNumberQuery,
} from "../order-number"

// Unit: номер заказа для людей — «ORG-26-0007» (код компании, год, номер
// внутри компании за год).
describe("номер заказа", () => {
  it("собирается из кода, года и порядкового номера", () => {
    expect(formatOrderNumber("ORG", 2026, 7)).toBe("ORG-26-0007")
    expect(formatOrderNumber("SM", 2027, 12345)).toBe("SM-27-12345")
  })

  it("год — по Астане: 31 декабря в 23:29 ещё прошлый год, после полуночи — новый", () => {
    expect(orderNumberYear(new Date("2026-12-31T18:29:00Z"))).toBe(2026)
    expect(orderNumberYear(new Date("2026-12-31T19:30:00Z"))).toBe(2027)
  })

  it("подпись: новый номер, а у старых заказов — «№5»", () => {
    expect(orderLabel("ORG-26-0007", 12)).toBe("ORG-26-0007")
    expect(orderLabel(null, 5)).toBe("№5")
    expect(orderLabel(null, null)).toBe("")
  })

  it("разбирает номер из поиска: полный, без нулей, хвост цифрами", () => {
    expect(parseOrderNumberQuery("ORG-26-0007")).toEqual({ number: "ORG-26-0007" })
    expect(parseOrderNumberQuery(" org-26-7 ")).toEqual({ number: "ORG-26-0007" })
    expect(parseOrderNumberQuery("№ 7")).toEqual({ digits: 7 })
    expect(parseOrderNumberQuery("#24")).toEqual({ digits: 24 })
    expect(parseOrderNumberQuery("Айгерим")).toBeNull()
  })
})
