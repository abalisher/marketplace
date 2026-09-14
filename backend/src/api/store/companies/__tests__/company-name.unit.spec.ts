import {
  StoreCreateCompany,
  StoreUpdateCompanyApplication,
} from "../validators"

// Название юрлица модератор читает глазами и по нему принимает решение. На
// стенде накопились три заявки, где вместо названия стояли символы замены
// (U+FFFD): клиент прислал байты не в UTF-8, и разбор JSON потерял текст —
// заявку стало невозможно одобрить осмысленно (находка Ф-прогона 2026-08-18,
// персона Тимур). Тест закрепляет, что такое имя не принимается ВООБЩЕ, а
// нормальные названия на кириллице, латинице и с кавычками проходят.

const BIN = "180440018374"

// Символы замены и управляющий символ — экранированными кодами: в исходнике их
// иначе не видно, а именно они и ломали экран модератора.
const REPLACEMENT = String.fromCharCode(0xfffd)
const BROKEN = `${REPLACEMENT.repeat(3)} ${REPLACEMENT}214`
const WITH_CONTROL = `${String.fromCharCode(7)} TOO Stroy`

describe("название компании", () => {
  it("принимает обычные названия", () => {
    for (const name of [
      "ТОО «Астана Курылыс Строй»",
      'ТОО "Есиль Групп"',
      "Astana Stroy LLP",
      "ИП Мұхаметқали",
    ]) {
      expect(StoreCreateCompany.safeParse({ name, bin: BIN }).success).toBe(true)
    }
  })

  it("не принимает имя с символом замены — это потерянные байты", () => {
    expect(
      StoreCreateCompany.safeParse({ name: BROKEN, bin: BIN }).success
    ).toBe(false)
  })

  it("не принимает управляющие символы — на экране их не видно", () => {
    expect(
      StoreCreateCompany.safeParse({ name: WITH_CONTROL, bin: BIN }).success
    ).toBe(false)
  })

  it("правит заявку по тому же правилу", () => {
    expect(
      StoreUpdateCompanyApplication.safeParse({ name: BROKEN }).success
    ).toBe(false)
    expect(
      StoreUpdateCompanyApplication.safeParse({ name: "ТОО «Есиль Групп»" })
        .success
    ).toBe(true)
  })
})
