import * as XLSX from "xlsx"
import { readOnecFile } from "../file-feed"
import { buildOnecFileTemplate } from "../file-template"
import { desiredProduct, onecMetadata } from "../plan"

// Unit: каталог компании из Excel-файла сводится к тем же позициям, что ответ
// 1С (lib/onec/file-feed.ts), и дальше идёт её путём.

const xlsx = (rows: unknown[][], sheet = "Лист1"): Buffer => {
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), sheet)
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer
}

describe("readOnecFile", () => {
  it("находит заголовки под шапкой, пропускает пустые строки и «Итого»", () => {
    const feed = readOnecFile(
      xlsx([
        ["Остатки товаров на 22.10.2026"],
        [],
        ["Код", "Наименование", "Ед. изм.", "Остаток", "Цена"],
        ["00125", "Цемент ПЦ 400, 50 кг", "мешок", 120, 3200],
        [null, null, null, null, null],
        ["00412", "Арматура А500С 12 мм", "т", 3.75, 285000],
        [null, "Итого", null, 123.75, null],
      ]),
      "остатки.xlsx"
    )
    expect(feed.sheet).toEqual("Лист1")
    expect(feed.header_row).toEqual(3)
    expect(feed.items).toHaveLength(2)
    expect(feed.items[0]).toMatchObject({
      key: "00125",
      code: "00125",
      name: "Цемент ПЦ 400, 50 кг",
      unit: "мешок",
      stock: 120,
      price: 3200,
    })
    expect(feed.items[1].stock).toEqual(3.75)
    expect(feed.fields).toMatchObject({
      code: "Код",
      name: "Наименование",
      unit: "Ед. изм.",
      stock: "Остаток",
      price: "Цена",
    })
  })

  it("узнаёт вольные заголовки: «Код товара», «Кол-во», «Цена, тг»", () => {
    const feed = readOnecFile(
      xlsx([
        ["Код товара", "Наименование товара", "Кол-во", "Цена, тг", "Примечание"],
        [125, "Гипсокартон ГКЛ", "450", "2 600", "у окна"],
      ]),
      "catalog.XLSX"
    )
    expect(feed.fields).toMatchObject({
      code: "Код товара",
      name: "Наименование товара",
      stock: "Кол-во",
      price: "Цена, тг",
    })
    expect(feed.items[0]).toMatchObject({ key: "125", stock: 450, price: 2600 })
  })

  it("без кода и артикула связывает позиции по наименованию и предупреждает", () => {
    const feed = readOnecFile(
      xlsx([
        ["Наименование", "Остаток"],
        ["Песок мытый", 12],
      ]),
      "b.xlsx"
    )
    expect(feed.items[0].key).toEqual("Песок мытый")
    expect(feed.items[0].code).toBeNull()
    expect(feed.issues[0].message).toMatch(/порядковые номера/)
  })

  it("строка с пустым кодом не теряется: связывается по наименованию", () => {
    const feed = readOnecFile(
      xlsx([
        ["Код", "Наименование", "Остаток"],
        ["00125", "Цемент ПЦ 400", 12],
        [null, "Песок мытый", 3],
      ]),
      "b.xlsx"
    )
    expect(feed.items.map((item) => [item.key, item.code])).toEqual([
      ["00125", "00125"],
      ["Песок мытый", null],
    ])
    expect(feed.issues[0].message).toMatch(/У 1 строк не заполнен код/)
  })

  it("бренд — отдельное поле позиции: одноимённые товары разных брендов не сливаются", () => {
    const feed = readOnecFile(
      xlsx([
        ["Наименование", "Торговая марка", "Цена"],
        ["Гипсокартон 12,5 мм", "Knauf", 2600],
        ["Гипсокартон 12,5 мм", "Волма", 2450],
        ["Гипсокартон Knauf 9,5 мм", "Knauf", 2300],
      ]),
      "b.xlsx"
    )
    expect(feed.fields.brand).toEqual("Торговая марка")
    expect(feed.items.map((item) => [item.name, item.brand])).toEqual([
      ["Гипсокартон 12,5 мм Knauf", "Knauf"],
      ["Гипсокартон 12,5 мм Волма", "Волма"],
      ["Гипсокартон Knauf 9,5 мм", "Knauf"],
    ])
    expect(new Set(feed.items.map((item) => item.key)).size).toEqual(3)
    expect(feed.name_parts).toEqual(["Торговая марка"])
  })

  it("только себестоимость — ценой продажи она не становится, цену ставит продавец", () => {
    const rows = [
      ["Артикул", "Наименование", "Себестоимость"],
      ["A-1", "Профиль ПС 60×27", 1000],
    ]
    const feed = readOnecFile(xlsx(rows), "c.xlsx")
    expect(feed.items[0]).toMatchObject({ cost: 1000, price: null })
    expect(feed.fields.price).toBeUndefined()
    expect(feed.issues[0].message).toMatch(/задаст продавец/)
  })

  it("дописывает к наименованию «Характеристику» и «Бренд» — строки прайса не сливаются", () => {
    // Прайс NUR-STROI: одно «Бур по бетону» на десятки размеров.
    const feed = readOnecFile(
      xlsx([
        [null, "Наименование", "Характеристика", "Ед. изм", "Цена, тенге"],
        ["DUHENG MAX", "Бур по бетону", "6*110", "шт", 315],
        ["DUHENG MAX", "Бур по бетону", "6*160", "шт", 355],
        ["DUHENG MAX", "Уровень", "10см", "шт", 800],
      ]),
      "Прайс.xlsx"
    )
    expect(feed.items.map((item) => item.name)).toEqual([
      "Бур по бетону 6*110",
      "Бур по бетону 6*160",
      "Уровень 10см",
    ])
    expect(new Set(feed.items.map((item) => item.key)).size).toEqual(3)
    expect(feed.items[0]).toMatchObject({ unit: "шт", price: 315 })
    expect(feed.name_parts).toEqual(["Характеристика"])

    const branded = readOnecFile(
      xlsx([
        ["Бренд", "Наименование", "Характеристика", "Ед. изм", "Закупочная цена, тенге"],
        ["DUHENG MAX", "Бур по бетону", "6*110", "шт", 315],
        ["DUHENG MAX", "Сверло DUHENG MAX по кафелю", "6мм", "шт", 420],
        [null, "Кельма", null, "шт", 900],
      ]),
      "Прайс.xlsx"
    )
    expect(branded.items.map((item) => item.name)).toEqual([
      "Бур по бетону DUHENG MAX 6*110",
      "Сверло DUHENG MAX по кафелю 6мм",
      "Кельма",
    ])
    // Закупочная цена — себестоимость, ценой продажи не становится.
    expect(branded.items[0]).toMatchObject({ cost: 315, price: null, brand: "DUHENG MAX" })
    expect(branded.items[2].brand).toBeNull()
    expect(branded.name_parts).toEqual(["Бренд", "Характеристика"])
  })

  it("читает .csv тем же разбором", () => {
    const csv = Buffer.from(
      "Код,Наименование,Остаток,Цена\n7,Гвозди 100 мм,40,750\n",
      "utf8"
    )
    const feed = readOnecFile(csv, "b.csv")
    expect(feed.items[0]).toMatchObject({ key: "7", stock: 40, price: 750 })
  })

  it("отказывает понятной ошибкой: не тот файл и нет заголовков", () => {
    expect(() => readOnecFile(Buffer.from("x"), "price.pdf")).toThrow(/Excel/)
    expect(() =>
      readOnecFile(xlsx([["просто текст"], ["ещё текст"]]), "a.xlsx")
    ).toThrow(/строку заголовков/)
  })
})

describe("buildOnecFileTemplate", () => {
  it("шаблон читается разбором: все колонки узнаны, образцов в каталоге нет", () => {
    const feed = readOnecFile(buildOnecFileTemplate(), "Шаблон каталога.xlsx")
    expect(feed.sheet).toEqual("Каталог")
    expect(feed.items).toHaveLength(0)
    expect(Object.keys(feed.fields).sort()).toEqual(
      ["brand", "code", "cost", "group", "name", "price", "stock", "unit"].sort()
    )
  })
})

describe("товары из Excel помечены источником", () => {
  it("onec_feed = file только у файлового каталога", () => {
    expect(onecMetadata("k", "1", ["stock"], "file")).toMatchObject({
      source: "1c",
      onec_feed: "file",
    })
    expect(onecMetadata("k", "1", ["stock"])).not.toHaveProperty("onec_feed")
    const item = {
      key: "1",
      code: "1",
      article: null,
      name: "Цемент",
      description: null,
      unit: "мешок",
      price: 3200,
      stock: 5,
      cost: null,
      barcode: null,
      group: null,
      brand: null,
    }
    expect(desiredProduct("companyb", item, ["price", "stock"], false, "file").feed).toEqual(
      "file"
    )
  })
})
