import { formatAmount, formatTenge } from "../money"

// Единый форматтер денег панели (T4.8). До него в панели жили три копии с разной
// локалью и разным знаком валюты: закуп показывал «94 000 ₸», скоринг — «5000»
// без валюты вовсе, а ядровые экраны — «₸ 8 000,00 KZT». Тест закрепляет один
// вид: целые тенге, разряды неразрывным пробелом, знак после числа.

describe("formatTenge", () => {
  it("показывает целые тенге со знаком валюты", () => {
    expect(formatTenge(242000).replace(/ /g, " ")).toBe("242 000 ₸")
    expect(formatTenge(0)).toBe("0 ₸")
  })

  it("не показывает тиыны (KZT де-факто целочислен)", () => {
    expect(formatTenge(2350.4).replace(/ /g, " ")).toBe("2 350 ₸")
  })
})

describe("formatAmount", () => {
  it("тенге форматирует как formatTenge — независимо от регистра кода", () => {
    expect(formatAmount(94000, "kzt")).toBe(formatTenge(94000))
    expect(formatAmount(94000, "KZT")).toBe(formatTenge(94000))
    // Валюта не указана — магазин работает в тенге.
    expect(formatAmount(94000)).toBe(formatTenge(94000))
  })

  it("чужую валюту показывает в ней самой, а не «переименовывает» в тенге", () => {
    // На стенде остались демо-заказы в евро (чистка — T7.2): сумма должна
    // читаться как евро, иначе оператор поверит, что это тенге.
    const eur = formatAmount(210, "eur")
    expect(eur).toContain("210")
    expect(eur).not.toContain("₸")
  })
})
