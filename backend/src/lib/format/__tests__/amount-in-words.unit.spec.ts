import {
  amountInWords,
  integerInWords,
  pluralForm,
} from "../amount-in-words"

// Пропись — обязательная строка накладной З-2 и счёта. Проверяем склонения на
// границах (11-19, оканчивающиеся на 1/2-4/5-0) и женский род тысяч.
describe("amount-in-words", () => {
  it("склоняет слово разряда по числу", () => {
    const forms = ["тенге", "тенге", "тенге"] as const
    expect(pluralForm(1, forms)).toBe("тенге")
    const items = ["наименование", "наименования", "наименований"] as const
    expect(pluralForm(1, items)).toBe("наименование")
    expect(pluralForm(3, items)).toBe("наименования")
    expect(pluralForm(5, items)).toBe("наименований")
    expect(pluralForm(11, items)).toBe("наименований")
    expect(pluralForm(21, items)).toBe("наименование")
    expect(pluralForm(112, items)).toBe("наименований")
    expect(pluralForm(123, items)).toBe("наименования")
  })

  it("пишет целые числа словами, тысячи — женским родом", () => {
    expect(integerInWords(0)).toBe("ноль")
    expect(integerInWords(1)).toBe("один")
    expect(integerInWords(11)).toBe("одиннадцать")
    expect(integerInWords(21)).toBe("двадцать один")
    expect(integerInWords(1000)).toBe("одна тысяча")
    expect(integerInWords(2000)).toBe("две тысячи")
    expect(integerInWords(5000)).toBe("пять тысяч")
    expect(integerInWords(123456)).toBe(
      "сто двадцать три тысячи четыреста пятьдесят шесть"
    )
    expect(integerInWords(1000000)).toBe("один миллион")
    expect(integerInWords(2500000)).toBe("два миллиона пятьсот тысяч")
  })

  it("пишет сумму в тенге с тиынами цифрами", () => {
    expect(amountInWords(0, "kzt")).toBe("Ноль тенге 00 тиын")
    expect(amountInWords(1, "kzt")).toBe("Один тенге 00 тиын")
    expect(amountInWords(242000, "kzt")).toBe(
      "Двести сорок две тысячи тенге 00 тиын"
    )
    expect(amountInWords(1234.5, "kzt")).toBe(
      "Одна тысяча двести тридцать четыре тенге 50 тиын"
    )
    expect(amountInWords(12.34, "kzt")).toBe("Двенадцать тенге 34 тиын")
  })

  it("округляет разменную часть вверх до целой единицы", () => {
    expect(amountInWords(99.999, "kzt")).toBe("Сто тенге 00 тиын")
  })

  it("незнакомую валюту печатает кодом", () => {
    expect(amountInWords(150, "usd")).toBe("Сто пятьдесят USD")
  })
})
