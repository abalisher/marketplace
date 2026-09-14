import {
  sanitizeRecognizedInvoice,
  RecognizedInvoice,
} from "../invoice-ai"

// Unit: санитизация ответа Gemini для ИИ-приёмки (procurement подзадача 2). Модель
// может вернуть строки вместо чисел, отрицательные/дробные цены, мусорные строки —
// граница доверия здесь. Сеть/сам вызов Gemini покрыты live-smoke (ключ есть).
describe("sanitizeRecognizedInvoice", () => {
  it("coerces numeric strings, rounds price to whole tenge, keeps float quantity", () => {
    const out: RecognizedInvoice = sanitizeRecognizedInvoice({
      reference: "ТТН-42",
      received_at: "2026-07-20",
      lines: [
        {
          recognized_title: "Цемент М400",
          quantity: "30",
          unit: "мешок",
          unit_cost: "1499.6",
        },
      ],
    })
    expect(out.reference).toEqual("ТТН-42")
    expect(out.received_at).toEqual("2026-07-20")
    expect(out.lines).toHaveLength(1)
    expect(out.lines[0]).toEqual({
      recognized_title: "Цемент М400",
      quantity: 30,
      unit: "мешок",
      unit_cost: 1500,
    })
  })

  it("drops junk lines (no title, non-positive qty) and clamps negatives", () => {
    const out = sanitizeRecognizedInvoice({
      lines: [
        { recognized_title: "", quantity: 5, unit: "шт", unit_cost: 10 }, // no title
        { recognized_title: "Итого", quantity: 0, unit: "", unit_cost: 999 }, // qty 0
        { recognized_title: "Песок", quantity: 2, unit: "", unit_cost: -50 }, // neg cost, empty unit
      ],
    })
    expect(out.lines).toHaveLength(1)
    // Пустая единица → дефолт «шт»; отрицательная цена → 0.
    expect(out.lines[0]).toEqual({
      recognized_title: "Песок",
      quantity: 2,
      unit: "шт",
      unit_cost: 0,
    })
  })

  it("returns empty lines and null meta for missing/garbage input", () => {
    expect(sanitizeRecognizedInvoice(null)).toEqual({
      reference: null,
      received_at: null,
      supplier: null,
      lines: [],
    })
    expect(sanitizeRecognizedInvoice({ lines: "nope" })).toEqual({
      reference: null,
      received_at: null,
      supplier: null,
      lines: [],
    })
  })

  it("читает поставщика из шапки и чистит БИН до 12 цифр", () => {
    const out = sanitizeRecognizedInvoice({
      supplier_name: '  ТОО «СтройБаза Астана» ',
      supplier_bin: "БИН 140 540 019 283",
      lines: [],
    })

    expect(out.supplier).toEqual({
      name: "ТОО «СтройБаза Астана»",
      bin: "140540019283",
    })
  })

  it("некорректный БИН отбрасывается, поставщик остаётся по названию", () => {
    const out = sanitizeRecognizedInvoice({
      supplier_name: "ИП Ким",
      supplier_bin: "1234",
      lines: [],
    })

    expect(out.supplier).toEqual({ name: "ИП Ким", bin: null })
  })

  it("без названия поставщика — supplier null", () => {
    expect(
      sanitizeRecognizedInvoice({ supplier_bin: "140540019283", lines: [] })
        .supplier
    ).toBeNull()
  })
})
