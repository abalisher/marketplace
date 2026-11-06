import {
  locateOnecList,
  parseOnecItems,
  parseOnecNumber,
  mergeOnecBalances,
  parseOnecBalances,
} from "../parse-items"

describe("parseOnecNumber", () => {
  it("понимает числа 1С: пробелы, неразрывные пробелы, запятую, «₸»", () => {
    expect(parseOnecNumber(1500)).toBe(1500)
    expect(parseOnecNumber("1 234,50")).toBe(1234.5)
    expect(parseOnecNumber("2 500")).toBe(2500)
    expect(parseOnecNumber("3 100 ₸")).toBe(3100)
    expect(parseOnecNumber("-4")).toBe(-4)
  })

  it("не число — null", () => {
    expect(parseOnecNumber("")).toBeNull()
    expect(parseOnecNumber("abc")).toBeNull()
    expect(parseOnecNumber(null)).toBeNull()
    expect(parseOnecNumber(NaN)).toBeNull()
  })
})

describe("locateOnecList", () => {
  it("массив в корне", () => {
    expect(locateOnecList([{ a: 1 }])).toEqual([{ a: 1 }])
  })

  it("массив под известным ключом, в том числе по-русски", () => {
    expect(locateOnecList({ items: [{ a: 1 }] })).toEqual([{ a: 1 }])
    expect(locateOnecList({ Товары: [{ a: 1 }] })).toEqual([{ a: 1 }])
    expect(locateOnecList({ result: { Номенклатура: [{ a: 1 }] } })).toEqual([
      { a: 1 },
    ])
  })

  it("единственный массив объектов среди полей", () => {
    expect(locateOnecList({ count: 1, whatever: [{ a: 1 }] })).toEqual([{ a: 1 }])
  })

  it("объект «код → позиция»", () => {
    expect(locateOnecList({ "001": { Наименование: "Цемент" } })).toEqual([
      { __map_key: "001", Наименование: "Цемент" },
    ])
  })

  it("непонятный ответ — null", () => {
    expect(locateOnecList("ok")).toBeNull()
    expect(locateOnecList({ status: "ok" })).toBeNull()
  })
})

describe("parseOnecItems", () => {
  it("русские ключи 1С", () => {
    const result = parseOnecItems([
      {
        Ссылка: "0b1c-guid",
        Код: "00-00000123",
        Артикул: "M500",
        Наименование: "Цемент М500 50 кг",
        ЕдиницаИзмерения: "меш",
        Цена: "2 750,00",
        Остаток: "120",
        Группа: "Сухие смеси",
      },
    ])
    expect(result.items).toEqual([
      {
        key: "0b1c-guid",
        code: "00-00000123",
        article: "M500",
        name: "Цемент М500 50 кг",
        description: null,
        unit: "меш",
        price: 2750,
        stock: 120,
        cost: null,
        barcode: null,
        group: "Сухие смеси",
        brand: null,
      },
    ])
    expect(result.fields).toMatchObject({
      key: "Ссылка",
      code: "Код",
      name: "Наименование",
      price: "Цена",
      stock: "Остаток",
    })
  })

  it("английские ключи и регистр не важен", () => {
    const { items } = parseOnecItems({
      data: [{ CODE: "A1", Name: "Kabel VVG", price: 300, quantity: 15, unit: "m" }],
    })
    expect(items[0]).toMatchObject({
      key: "A1",
      code: "A1",
      name: "Kabel VVG",
      price: 300,
      stock: 15,
      unit: "m",
    })
  })

  it("вложенные ссылки сводятся к наименованию, остатки по складам суммируются", () => {
    const { items } = parseOnecItems([
      {
        Код: "77",
        Наименование: "Гипсокартон 12,5 мм",
        ЕдиницаИзмерения: { Код: "796", Наименование: "лист" },
        Склады: [
          { Склад: "Основной", Остаток: 10 },
          { Склад: "Промзона", Остаток: "5,5" },
        ],
        Цены: [
          { ВидЦены: "Закупочная", Цена: 2000 },
          { ВидЦены: "Розничная", Цена: 2600 },
        ],
      },
    ])
    expect(items[0]).toMatchObject({
      unit: "лист",
      stock: 15.5,
      price: 2600,
    })
  })

  it("запись регистра { Номенклатура: {…}, Остаток } раскрывается", () => {
    const { items } = parseOnecItems([
      {
        Номенклатура: { Код: "15", Наименование: "Саморез 3,5×25" },
        Остаток: 900,
        Цена: 4,
      },
    ])
    expect(items[0]).toMatchObject({
      key: "15",
      name: "Саморез 3,5×25",
      stock: 900,
      price: 4,
    })
  })

  it("группы справочника и помеченные на удаление пропускаются молча", () => {
    const { items, issues, total } = parseOnecItems([
      { Код: "1", Наименование: "Отделка", ЭтоГруппа: true },
      { Код: "2", Наименование: "Старое", ПометкаУдаления: "true" },
      { Код: "3", Наименование: "Шпаклёвка" },
    ])
    expect(total).toBe(3)
    expect(items.map((item) => item.key)).toEqual(["3"])
    expect(issues).toEqual([])
  })

  it("брак: без названия, без ключа, повтор — в замечания, не в позиции", () => {
    const { items, issues } = parseOnecItems([
      { Код: "1" },
      { Наименование: "Без кода" },
      { Код: "2", Наименование: "Краска" },
      { Код: "2", Наименование: "Краска дубль" },
      "мусор",
    ])
    expect(items.map((item) => item.name)).toEqual(["Краска"])
    expect(issues.map((issue) => issue.index)).toEqual([0, 1, 3, 4])
  })

  it("отрицательная цена не берётся, отрицательный остаток отдаётся как есть", () => {
    const { items } = parseOnecItems([
      { Код: "1", Наименование: "Кран", Цена: -5, Остаток: -2 },
    ])
    expect(items[0].price).toBeNull()
    expect(items[0].stock).toBe(-2)
  })

  it("пустой массив — ноль позиций без ошибки", () => {
    expect(parseOnecItems([])).toMatchObject({ items: [], total: 0 })
  })

  it("ответ без списка — ошибка", () => {
    expect(() => parseOnecItems({ status: "ok" })).toThrow(/не найден список/)
  })
})

describe("выгрузка номенклатуры ORGSTROY (getxtsitems)", () => {
  // Форма реального ответа 1С:Fresh ORGSTROY: id / item / description / uom,
  // без цен и остатков.
  const feed = [
    { id: "00000000282", item: "ГКЛВ 9 мм", description: "ГКЛВ 9 мм", uom: "шт" },
    { id: "00000000090", item: "Грендер ", description: "Грендер ", uom: "шт" },
    {
      id: "00000000311",
      item: "Изделия тепло- и звукоизол. TS230 Aquastatik 50x610x123мм 36 па",
      description: "Изделия тепло- и звукоизол. TS230 Aquastatik 50x610x123мм 36 пач",
      uom: "упак",
    },
    {
      id: "00000000301",
      item: "Перчатки прорезиненые",
      description: "Перчатки прорезиненые\n",
      uom: "шт",
    },
    {
      id: "00000000302",
      item: "СВП для кафеля 1мм - 500 шт",
      description: "СВП для кафеля 1,5 мм - 500 шт",
      uom: "Пачка",
    },
    { id: "00000000400", item: "Комиссия банка", description: "Комиссия банка", uom: "Одна услуга" },
  ]

  it("id — ключ и код, item — название, uom — единица; цен и остатков нет", () => {
    const { items, fields } = parseOnecItems(feed)
    expect(items[0]).toMatchObject({
      key: "00000000282",
      code: "00000000282",
      name: "ГКЛВ 9 мм",
      description: null,
      unit: "шт",
      price: null,
      stock: null,
    })
    expect(fields.price).toBeUndefined()
    expect(fields.stock).toBeUndefined()
  })

  it("обрезанное название заменяется полным, повтор названия — не описание", () => {
    const { items } = parseOnecItems(feed)
    expect(items.find((i) => i.key === "00000000311")?.name).toMatch(/36 пач$/)
    expect(items.find((i) => i.key === "00000000311")?.description).toBeNull()
    expect(items.find((i) => i.key === "00000000301")?.description).toBeNull()
    expect(items.find((i) => i.key === "00000000090")?.name).toBe("Грендер")
    // Расходящееся описание остаётся описанием, название — из «Наименования».
    expect(items.find((i) => i.key === "00000000302")).toMatchObject({
      name: "СВП для кафеля 1мм - 500 шт",
      description: "СВП для кафеля 1,5 мм - 500 шт",
    })
  })

  it("услуги — не товары", () => {
    const { items, issues } = parseOnecItems(feed)
    expect(items.map((i) => i.key)).not.toContain("00000000400")
    expect(items).toHaveLength(5)
    expect(issues).toEqual([])
  })
})

describe("остатки и цены отдельным сервисом", () => {
  const items = parseOnecItems([
    { id: "001", item: "ГКЛВ 9 мм", uom: "шт" },
    { id: "002", item: "Цемент М500", uom: "меш" },
    { id: "003", item: "Кабель ВВГ", uom: "м" },
  ]).items

  it("разбор: позиция по коду, остаток и цена, без названия", () => {
    const { balances, fields } = parseOnecBalances([
      { id: "001", quantity: "60", price: "6 465,52" },
      { Номенклатура: { Код: "002" }, Остаток: 283 },
    ])
    expect(balances).toEqual([
      { key: "001", code: "001", article: null, stock: 60, price: 6465.52, cost: null },
      { key: null, code: "002", article: null, stock: 283, price: null, cost: null },
    ])
    expect(fields).toMatchObject({ stock: "quantity", price: "price" })
  })

  it("сведение: по коду, склады складываются, нет в остатках — 0", () => {
    const { balances } = parseOnecBalances([
      { id: "001", quantity: 40, price: 3200 },
      { id: "001", quantity: 20 },
      { code: "002", quantity: 7 },
    ])
    const { items: merged, matched } = mergeOnecBalances(items, balances)
    expect(matched).toBe(2)
    expect(merged.map((i) => [i.key, i.stock, i.price])).toEqual([
      ["001", 60, 3200],
      ["002", 7, null],
      ["003", 0, null],
    ])
  })

  it("пустая выгрузка остатков — пустой список, не ошибка", () => {
    expect(parseOnecBalances([])).toMatchObject({ balances: [], total: 0 })
  })
})

describe("формат getitems по описанию API 1С:Fresh (проект XTS)", () => {
  // StockBalance: { id, warehouse, qty, rate }; rate — учётная цена
  // (себестоимость), а не цена продажи.
  const stock = [
    { id: "00000009812", warehouse: "Склад Алматы", qty: 140, rate: 1450.0 },
    { id: "00000009812", warehouse: "Склад Астана", qty: 10, rate: 1450.0 },
    { id: "АБ-М12 ", warehouse: "Склад Алматы", qty: 5, rate: 90 },
  ]

  it("остаток — qty, склады складываются; учётная цена ценой продажи не считается", () => {
    const { balances, fields } = parseOnecBalances(stock)
    expect(fields.stock).toBe("qty")
    expect(fields.price).toBeUndefined()
    const items = parseOnecItems([
      { id: "00000009812", item: "Бикрост ХПП", description: "Бикрост ХПП", uom: "м" },
      { id: "АБ-М12 ", item: "Анкерный болт-М12-120", description: "Анкерный болт-М12-120", uom: "шт" },
    ]).items
    const { items: merged, matched } = mergeOnecBalances(items, balances)
    expect(matched).toBe(2)
    expect(merged.map((i) => [i.key, i.stock, i.price])).toEqual([
      ["00000009812", 150, null],
      ["АБ-М12", 5, null],
    ])
  })
})

describe("учётная цена — себестоимость, не цена продажи", () => {
  it("цена продажи из rate не считается; на разных складах берётся наибольшая учётная", () => {
    const items = parseOnecItems([{ id: "1", item: "Бикрост", uom: "м" }]).items
    const { balances, fields } = parseOnecBalances([
      { id: "1", warehouse: "А", qty: 10, rate: 1000 },
      { id: "1", warehouse: "Б", qty: 5, rate: 1100 },
    ])
    expect(fields.cost).toBe("rate")
    expect(mergeOnecBalances(items, balances).items[0]).toMatchObject({
      stock: 15,
      price: null,
      cost: 1100,
    })
  })
})

describe("бренд позиции", () => {
  it("берётся из поля бренда (в том числе ссылкой на справочник) и дописывается к наименованию", () => {
    const { items, fields } = parseOnecItems([
      { Код: "1", Наименование: "Затирка FIXLINE 2 кг", Бренд: "AlinEX" },
      { Код: "2", Наименование: "Затирка CE 33 2 кг", Производитель: { Наименование: "Ceresit" } },
      { Код: "3", Наименование: "Затирка AlinEX FIXLINE 4 кг", Бренд: "alinex" },
      { Код: "4", Наименование: "Кельма" },
    ])
    expect(fields.brand).toEqual("Бренд")
    expect(items.map((item) => [item.name, item.brand])).toEqual([
      ["Затирка FIXLINE 2 кг AlinEX", "AlinEX"],
      ["Затирка CE 33 2 кг Ceresit", "Ceresit"],
      ["Затирка AlinEX FIXLINE 4 кг", "alinex"],
      ["Кельма", null],
    ])
  })
})
