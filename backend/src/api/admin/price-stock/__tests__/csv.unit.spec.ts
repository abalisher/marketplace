import {
  decodeUploadedText,
  matchColumns,
  parseAmountCell,
  parseTable,
  serializeTable,
} from "../csv"

// Формат обмена экрана «Цены и остатки» (T10.14c). Всё, что здесь проверяется,
// приходит из Excel продавца: своя кодировка, свой разделитель и числа с
// разрядами. Ошибиться тут — значит показать «Ð¦ÐµÐ¼ÐµÐ½Ñ‚» вместо названий или
// прочитать «2 600,00» как ничто.

const bytes = (...values: number[]) => Uint8Array.from(values)

describe("decodeUploadedText", () => {
  it("читает UTF-8 с BOM (так сохраняет «CSV UTF-8»)", () => {
    const utf8 = Buffer.from("Артикул;Цена", "utf-8")
    expect(decodeUploadedText(bytes(0xef, 0xbb, 0xbf, ...utf8))).toEqual(
      "Артикул;Цена"
    )
  })

  it("читает UTF-8 без BOM", () => {
    expect(decodeUploadedText(Buffer.from("Цемент;2600", "utf-8"))).toEqual(
      "Цемент;2600"
    )
  })

  it("читает windows-1251 — так русский Excel сохраняет CSV по умолчанию", () => {
    // «Цемент» в однобайтовой кириллице: строгий UTF-8 на этих байтах падает.
    expect(decodeUploadedText(bytes(0xd6, 0xe5, 0xec, 0xe5, 0xed, 0xf2))).toEqual(
      "Цемент"
    )
  })

  it("читает UTF-16LE с BOM («Юникод-текст» Excel)", () => {
    const utf16 = Buffer.from("Цена\t2600", "utf16le")
    expect(decodeUploadedText(bytes(0xff, 0xfe, ...utf16))).toEqual("Цена\t2600")
  })
})

describe("parseTable", () => {
  it("делит по «;» и держит кавычки с запятой внутри", () => {
    const table = parseTable(
      'Артикул;Товар;Цена\r\nPB-300;"Пескобетон М300, мешок";2600\r\n'
    )

    expect(table).toEqual([
      ["Артикул", "Товар", "Цена"],
      ["PB-300", "Пескобетон М300, мешок", "2600"],
    ])
  })

  it("сам находит разделитель: запятая и табуляция читаются так же", () => {
    expect(parseTable("Артикул,Цена\nPB-300,2600\n")).toEqual([
      ["Артикул", "Цена"],
      ["PB-300", "2600"],
    ])
    expect(parseTable("Артикул\tЦена\nPB-300\t2600\n")).toEqual([
      ["Артикул", "Цена"],
      ["PB-300", "2600"],
    ])
  })

  it("метку «sep=,» Excel считает не данными, а разделителем", () => {
    expect(parseTable("sep=,\nАртикул,Цена\nPB-300,2600\n")).toEqual([
      ["Артикул", "Цена"],
      ["PB-300", "2600"],
    ])
  })

  it("удвоенная кавычка внутри значения — одна кавычка", () => {
    expect(parseTable('Товар\n"Труба ""Полипласт"""\n')).toEqual([
      ["Товар"],
      ['Труба "Полипласт"'],
    ])
  })

  it("хвостовые пустые строки в нумерацию не попадают", () => {
    expect(parseTable("Артикул;Цена\r\nPB-300;2600\r\n\r\n\r\n")).toHaveLength(2)
  })
})

describe("serializeTable", () => {
  it("экранирует разделитель, кавычки и перевод строки", () => {
    const csv = serializeTable([
      ["Артикул", "Товар"],
      ["PB-300", 'Пескобетон; мешок "25"'],
      ["KBL-25", null],
    ])

    expect(csv).toEqual(
      'Артикул;Товар\r\nPB-300;"Пескобетон; мешок ""25"""\r\nKBL-25;\r\n'
    )
  })

  it("выгрузка читается обратно тем же разбором", () => {
    const rows = [
      ["Артикул", "Товар", "Цена, ₸"],
      ["PB-300", "Пескобетон М300, мешок", 2600],
    ]

    expect(parseTable(serializeTable(rows))).toEqual([
      ["Артикул", "Товар", "Цена, ₸"],
      ["PB-300", "Пескобетон М300, мешок", "2600"],
    ])
  })
})

describe("matchColumns", () => {
  it("находит колонки выгрузки", () => {
    expect(
      matchColumns([
        "Артикул",
        "Товар",
        "Категория",
        "Единица",
        "Цена, ₸",
        "Остаток",
        "Свободно",
        "Склад",
      ])
    ).toEqual({ sku: 0, price: 4, stock: 5, location: 7 })
  })

  it("не придирается к написанию заголовка", () => {
    expect(matchColumns(["sku", "кол-во"])).toEqual({
      sku: 0,
      price: null,
      stock: 1,
      location: null,
    })
  })

  it("без артикула или без цены и остатка файл не читается", () => {
    expect(matchColumns(["Товар", "Цена"])).toBeNull()
    expect(matchColumns(["Артикул", "Товар"])).toBeNull()
  })
})

describe("parseAmountCell", () => {
  const price = (raw: string) => parseAmountCell(raw, 1_000_000_000)

  it("пустая клетка — «не трогаем», а не ноль", () => {
    expect(price("")).toEqual({ amount: null, error: null })
    expect(price("   ")).toEqual({ amount: null, error: null })
  })

  it("читает числа так, как их пишет Excel", () => {
    expect(price("2600").amount).toEqual(2600)
    // Неразрывный пробел в разрядах и нулевые копейки.
    expect(price("2 600,00").amount).toEqual(2600)
    expect(price("2 600 ₸").amount).toEqual(2600)
    expect(price("0").amount).toEqual(0)
  })

  it("дробное число отвергает, а не округляет — это деньги продавца", () => {
    expect(price("2600,50").error).toEqual("fraction")
  })

  it("не число и число за потолком — отказ строки, а не 400 из ядра", () => {
    expect(price("две тысячи").error).toEqual("not_number")
    expect(price("-5").error).toEqual("not_number")
    expect(price("9999999999").error).toEqual("not_number")
  })
})
