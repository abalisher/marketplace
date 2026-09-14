import {
  AdminPriceStockRow,
  buildPriceStockChanges,
  clearPriceStockDrafts,
  clearStockDrafts,
  countFractionalDrafts,
  countOffscreen,
  fieldText,
  fillPriceStockDrafts,
  isAmountFractional,
  isFieldChanged,
  isFieldFractional,
  offscreenTitles,
  priceLock,
  priceStockRowTitle,
  sanitizeAmountInput,
  stockLock,
} from "../price-stock"

// Правила клетки экрана «Цены и остатки» (T10.14b). Экран их только рисует, а
// решают они деньги и склад, поэтому проверяем здесь: что считается правкой,
// какую клетку править нельзя и что уходит в партию.

const row = (patch: Partial<AdminPriceStockRow> = {}): AdminPriceStockRow => ({
  variant_id: "var_1",
  product_id: "prod_1",
  title: "Цемент М400",
  variant_title: "Цемент М400",
  sku: "CEM-400",
  unit: "мешок",
  status: "published",
  category_handle: "finishing",
  category_name: "Отделочные материалы",
  price: 2600,
  currency_code: "kzt",
  stocked: 400,
  reserved: 20,
  available: 380,
  stocked_total: 660,
  location_id: "sloc_center",
  location_name: "Склад Астана — Центр",
  locations_count: 2,
  stock_editable: true,
  price_editable: true,
  ...patch,
})

describe("sanitizeAmountInput", () => {
  it("снимает пробелы-разделители тысяч, буквы и знаки", () => {
    expect(sanitizeAmountInput("2 950 ₸")).toBe("2950")
    expect(sanitizeAmountInput("abc")).toBe("")
    expect(sanitizeAmountInput("-40")).toBe("40")
  })

  it("срезает ведущие нули, но оставляет сам ноль (ноль — это «нет в наличии»)", () => {
    expect(sanitizeAmountInput("007")).toBe("7")
    expect(sanitizeAmountInput("0")).toBe("0")
  })

  // Блокер Ф-прогона Данияра (2026-09-02): запятая выбрасывалась вместе с
  // пробелами, и цена из прайса «2 750,00» становилась 275 000 ₸ молча.
  it("сохраняет разделитель дробной части, а не склеивает цифры", () => {
    expect(sanitizeAmountInput("2 750,00")).toBe("2750,00")
    expect(sanitizeAmountInput("6250.5")).toBe("6250,5")
    expect(sanitizeAmountInput("-40,5")).toBe("40,5")
  })

  it("берёт только первый разделитель: «1,2,3» — набор, а не число", () => {
    expect(sanitizeAmountInput("1,2,3")).toBe("1,23")
    expect(sanitizeAmountInput(",5")).toBe("5")
  })
})

describe("isAmountFractional / parse", () => {
  it("дробное число в каталог не идёт — как и при импорте файла", () => {
    expect(isAmountFractional("2750,00")).toBe(true)
    expect(isAmountFractional("2750")).toBe(false)
    expect(isFieldChanged(row(), { var_1: { price: "2750,00" } }, "price")).toBe(
      false
    )
    expect(
      buildPriceStockChanges([row()], { var_1: { price: "2750,00" } })
    ).toEqual([])
  })

  it("клетка с копейками видна экрану и считается", () => {
    const drafts = { var_1: { price: "2750,00", stock: "12,5" } }
    expect(isFieldFractional(row(), drafts, "price")).toBe(true)
    expect(isFieldFractional(row(), drafts, "stock")).toBe(true)
    expect(countFractionalDrafts([row()], drafts)).toBe(2)
    expect(countFractionalDrafts([row()], { var_1: { price: "2750" } })).toBe(0)
  })
})

describe("countOffscreen / offscreenTitles", () => {
  const visible = [row()]
  const hidden = row({
    variant_id: "var_2",
    title: "Фитинг полипропиленовый",
    variant_title: "Муфта D25",
  })

  it("считает позиции партии, которых сейчас нет на экране", () => {
    expect(countOffscreen(visible, ["var_1"])).toBe(0)
    expect(countOffscreen(visible, ["var_1", "var_2"])).toBe(1)
  })

  it("называет их: «две штуки» продавцу ничего не говорит", () => {
    expect(offscreenTitles(visible, [...visible, hidden], ["var_1", "var_2"])).toEqual(
      ["Фитинг полипропиленовый — Муфта D25"]
    )
  })
})

describe("fieldText", () => {
  it("без правки показывает текущее число каталога", () => {
    expect(fieldText(row(), {}, "price")).toBe("2600")
    expect(fieldText(row(), {}, "stock")).toBe("400")
  })

  it("цена может быть не назначена — клетка пустая, а не «0»", () => {
    expect(fieldText(row({ price: null }), {}, "price")).toBe("")
  })

  it("набранное перебивает каталог", () => {
    expect(fieldText(row(), { var_1: { price: "2950" } }, "price")).toBe("2950")
  })
})

describe("isFieldChanged", () => {
  it("пустая клетка — «не трогал», а не «обнулить»", () => {
    expect(isFieldChanged(row(), { var_1: { price: "" } }, "price")).toBe(false)
  })

  it("то же число — не правка (в журнал не должно попасть «2600 → 2600»)", () => {
    expect(isFieldChanged(row(), { var_1: { price: "2600" } }, "price")).toBe(
      false
    )
  })

  it("другое число — правка", () => {
    expect(isFieldChanged(row(), { var_1: { stock: "380" } }, "stock")).toBe(
      true
    )
  })

  it("ноль в остатке — правка: «нет в наличии» проставляют этим экраном", () => {
    expect(isFieldChanged(row(), { var_1: { stock: "0" } }, "stock")).toBe(true)
  })
})

describe("priceLock / stockLock", () => {
  it("цена по правилам с этого экрана не правится", () => {
    expect(priceLock(row({ price_editable: false }))).toBe("priceRules")
    expect(priceLock(row())).toBeNull()
  })

  it("остаток не ведётся — клетка закрыта", () => {
    expect(stockLock(row({ stock_editable: false }))).toBe("notManaged")
  })

  it("позиция на нескольких складах без разреза — сначала выберите склад", () => {
    expect(stockLock(row({ location_id: null }))).toBe("locationRequired")
  })
})

describe("buildPriceStockChanges", () => {
  it("собирает только настоящие правки и добавляет склад к остатку", () => {
    const rows = [row(), row({ variant_id: "var_2", price: 900 })]
    const changes = buildPriceStockChanges(rows, {
      var_1: { price: "2950", stock: "380", location_id: "sloc_center" },
      var_2: { price: "900" },
    })
    expect(changes).toEqual([
      {
        variant_id: "var_1",
        price: 2950,
        stock: 380,
        location_id: "sloc_center",
      },
    ])
  })

  it("правка запертой клетки в партию не уходит (ресурс отказал бы всей партии)", () => {
    const changes = buildPriceStockChanges(
      [row({ price_editable: false, stock_editable: false })],
      { var_1: { price: "2950", stock: "380" } }
    )
    expect(changes).toEqual([])
  })

  it("склад берётся из самой правки: разрез экрана могли сменить после ввода", () => {
    const changes = buildPriceStockChanges(
      [row({ location_id: "sloc_main", stocked: 260 })],
      { var_1: { stock: "300", location_id: "sloc_center" } }
    )
    expect(changes[0].location_id).toBe("sloc_center")
  })
})

describe("fillPriceStockDrafts", () => {
  const rows = [
    row(),
    row({ variant_id: "var_2", price_editable: false, stock_editable: false }),
    row({ variant_id: "var_3" }),
  ]

  it("одно число уходит во все выделенные строки — в черновик, не в каталог", () => {
    const result = fillPriceStockDrafts(rows, {}, ["var_1", "var_3"], {
      price: "3100",
    })
    expect(result.filled).toBe(2)
    expect(result.skipped).toBe(0)
    expect(result.drafts.var_1.price).toBe("3100")
    expect(result.drafts.var_3.price).toBe("3100")
  })

  it("строки, которые правку не принимают, считаются отдельно", () => {
    const result = fillPriceStockDrafts(rows, {}, ["var_1", "var_2"], {
      price: "3100",
      stock: "50",
    })
    expect(result.filled).toBe(1)
    expect(result.skipped).toBe(1)
    expect(result.drafts.var_2).toBeUndefined()
  })

  it("не выделенные строки не трогает, набранное вручную сохраняет", () => {
    const result = fillPriceStockDrafts(
      rows,
      { var_3: { stock: "12" } },
      ["var_1"],
      { price: "3100" }
    )
    expect(result.drafts.var_3).toEqual({ stock: "12" })
  })

  it("массовый остаток запоминает склад, на который уйдёт", () => {
    const result = fillPriceStockDrafts(rows, {}, ["var_1"], { stock: "50" })
    expect(result.drafts.var_1.location_id).toBe("sloc_center")
  })
})

describe("clearPriceStockDrafts / clearStockDrafts", () => {
  it("после записи убирает применённые позиции, остальные оставляет набранными", () => {
    const next = clearPriceStockDrafts(
      { var_1: { price: "2950" }, var_2: { stock: "10" } },
      ["var_1"]
    )
    expect(next).toEqual({ var_2: { stock: "10" } })
  })

  it("смена склада отменяет остатки, но не цены", () => {
    const next = clearStockDrafts({
      var_1: { price: "2950", stock: "380", location_id: "sloc_center" },
      var_2: { stock: "10", location_id: "sloc_center" },
    })
    expect(next).toEqual({ var_1: { price: "2950" } })
  })
})

describe("priceStockRowTitle", () => {
  it("у односортного товара вариант не дублируется", () => {
    expect(priceStockRowTitle(row())).toBe("Цемент М400")
  })

  it("сорт добавляется, когда он отличается от названия", () => {
    expect(priceStockRowTitle(row({ variant_title: "50 кг" }))).toBe(
      "Цемент М400 — 50 кг"
    )
  })
})
