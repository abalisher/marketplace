import { serializeTable } from "../csv"
import { buildExportTable } from "../export"
import {
  ImportFileRow,
  buildImportPreview,
  indexBySku,
  readImportFile,
} from "../import"
import { RawProduct, RawVariant, buildPriceStockRows } from "../rows"

// Импорт файла (T10.14c): что именно поменяется, если продавец нажмёт
// «Применить». Файл сам ничего не пишет — он обязан честно показать пару
// «было → станет» и назвать строку, которую принять нельзя.

const variant = (over: Partial<RawVariant> = {}): RawVariant => ({
  id: "variant_1",
  title: "Мешок 25 кг",
  sku: "PB-300",
  manage_inventory: true,
  prices: [{ id: "price_1", amount: 2600, currency_code: "kzt", rules_count: 0 }],
  inventory_items: [
    {
      inventory: {
        id: "iitem_1",
        location_levels: [
          { location_id: "sloc_1", stocked_quantity: 40, reserved_quantity: 0 },
        ],
      },
    },
  ],
  ...over,
})

const product = (over: Partial<RawProduct> = {}): RawProduct => ({
  id: "prod_1",
  title: "Пескобетон М300",
  status: "published",
  product_card: { unit: "мешок" },
  categories: [{ handle: "finishing", name: "Отделочные материалы" }],
  variants: [variant()],
  ...over,
})

const fileRow = (over: Partial<ImportFileRow> = {}): ImportFileRow => ({
  line: 2,
  sku: "PB-300",
  price: "",
  stock: "",
  location: "",
  ...over,
})

const catalog = (products: RawProduct[] = [product()]) => indexBySku(products)

describe("readImportFile", () => {
  it("читает строки по заголовку и запоминает склад файла", () => {
    const result = readImportFile(
      "Артикул;Товар;Цена, ₸;Остаток;Склад\r\n" +
        "PB-300;Пескобетон М300;2950;38;Склад Астана — Центр\r\n"
    )

    expect(result.error).toBeUndefined()
    expect(result.rows).toEqual([
      {
        line: 2,
        sku: "PB-300",
        price: "2950",
        stock: "38",
        location: "Склад Астана — Центр",
      },
    ])
    expect(result.locations).toEqual(["Склад Астана — Центр"])
  })

  it("пустые строки пропускает, но номера строк не сдвигает", () => {
    const result = readImportFile(
      "Артикул;Цена\r\nPB-300;2950\r\n;\r\nKBL-25;700\r\n"
    )

    expect(result.rows?.map((row) => [row.line, row.sku])).toEqual([
      [2, "PB-300"],
      [4, "KBL-25"],
    ])
  })

  it("файл без заголовка и файл из одной шапки не читаются", () => {
    expect(readImportFile("PB-300;2950\r\n").error).toEqual("no_columns")
    expect(readImportFile("Артикул;Цена\r\n").error).toEqual("empty_file")
    expect(readImportFile("").error).toEqual("empty_file")
  })
})

describe("buildImportPreview", () => {
  it("собирает партию из изменившихся клеток и считает остальные", () => {
    const preview = buildImportPreview(
      [
        fileRow({ price: "2950", stock: "38" }),
        // Те же числа, что в каталоге, — не правка: продавец выгрузил весь
        // срез, а поправил в нём одну строку.
        fileRow({ line: 3, sku: "KBL-25", price: "700", stock: "5" }),
      ],
      catalog([
        product(),
        product({
          id: "prod_2",
          title: "Кабель ВВГнг",
          variants: [
            variant({
              id: "variant_2",
              sku: "KBL-25",
              prices: [
                { id: "p2", amount: 700, currency_code: "kzt", rules_count: 0 },
              ],
              inventory_items: [
                {
                  inventory: {
                    id: "iitem_2",
                    location_levels: [
                      {
                        location_id: "sloc_1",
                        stocked_quantity: 5,
                        reserved_quantity: 0,
                      },
                    ],
                  },
                },
              ],
            }),
          ],
        }),
      ]),
      "sloc_1"
    )

    expect(preview.changes).toEqual([
      {
        variant_id: "variant_1",
        price: 2950,
        stock: 38,
        location_id: "sloc_1",
      },
    ])
    expect(preview.summary).toEqual({
      rows: 2,
      changes: 1,
      unchanged: 1,
      issues: 0,
    })
    expect(preview.rows).toEqual([
      {
        line: 2,
        sku: "PB-300",
        title: "Пескобетон М300 — Мешок 25 кг",
        variant_id: "variant_1",
        unit: "мешок",
        old_price: 2600,
        new_price: 2950,
        old_stock: 40,
        new_stock: 38,
        issue: null,
      },
    ])
  })

  it("пустая клетка не трогает величину — правится только вторая", () => {
    const preview = buildImportPreview(
      [fileRow({ price: "2950" })],
      catalog(),
      "sloc_1"
    )

    expect(preview.changes).toEqual([{ variant_id: "variant_1", price: 2950 }])
  })

  it("называет строку, которую принять нельзя, номером в файле", () => {
    const preview = buildImportPreview(
      [
        fileRow({ line: 2, sku: "", price: "2950" }),
        fileRow({ line: 3, sku: "НЕТ-ТАКОГО", price: "2950" }),
        fileRow({ line: 4, price: "две тысячи" }),
        fileRow({ line: 5, sku: "pb-300", price: "3000" }),
      ],
      catalog(),
      "sloc_1"
    )

    expect(preview.rows.map((row) => [row.line, row.issue])).toEqual([
      [2, "missing_sku"],
      [3, "unknown_sku"],
      [4, "bad_price"],
      // Артикул уже был в файле выше (регистр не считается): обе правки шли бы
      // от одного снимка, и остаток сложился бы дважды.
      [5, "duplicate_sku"],
    ])
    expect(preview.changes).toHaveLength(0)
    expect(preview.summary.issues).toEqual(4)
  })

  it("артикул сверяет без учёта регистра", () => {
    const preview = buildImportPreview(
      [fileRow({ sku: "pb-300", price: "2950" })],
      catalog(),
      "sloc_1"
    )

    expect(preview.changes).toEqual([{ variant_id: "variant_1", price: 2950 }])
  })

  it("запертую клетку не пишет: цена по правилам, остаток не ведётся", () => {
    const byRules = buildImportPreview(
      [fileRow({ price: "2950" })],
      catalog([
        product({
          variants: [
            variant({
              prices: [
                { id: "p1", amount: 2600, currency_code: "kzt", rules_count: 1 },
              ],
            }),
          ],
        }),
      ]),
      "sloc_1"
    )
    expect(byRules.rows[0].issue).toEqual("price_rules")
    expect(byRules.changes).toHaveLength(0)

    const notManaged = buildImportPreview(
      [fileRow({ stock: "38" })],
      catalog([product({ variants: [variant({ manage_inventory: false })] })]),
      "sloc_1"
    )
    expect(notManaged.rows[0].issue).toEqual("stock_not_managed")
  })

  it("без склада остаток не принимает — числа уехали бы наугад", () => {
    const twoLocations = product({
      variants: [
        variant({
          inventory_items: [
            {
              inventory: {
                id: "iitem_1",
                location_levels: [
                  {
                    location_id: "sloc_1",
                    stocked_quantity: 40,
                    reserved_quantity: 0,
                  },
                  {
                    location_id: "sloc_2",
                    stocked_quantity: 20,
                    reserved_quantity: 0,
                  },
                ],
              },
            },
          ],
        }),
      ],
    })

    const noScope = buildImportPreview(
      [fileRow({ stock: "38" })],
      catalog([twoLocations]),
      null
    )
    expect(noScope.rows[0].issue).toEqual("location_required")

    // С разрезом остаток считается от числа ЭТОГО склада, а не от суммы.
    const scoped = buildImportPreview(
      [fileRow({ stock: "38" })],
      catalog([twoLocations]),
      "sloc_2"
    )
    expect(scoped.rows[0]).toMatchObject({ old_stock: 20, new_stock: 38 })
    expect(scoped.changes).toEqual([
      { variant_id: "variant_1", stock: 38, location_id: "sloc_2" },
    ])
  })
})

describe("выгрузка и загрузка — один и тот же файл", () => {
  it("правка цены в выгруженном файле возвращается партией из одной позиции", () => {
    const products = [product()]
    const rows = buildPriceStockRows(products, "sloc_1").map((row) => ({
      ...row,
      location_name: "Склад Астана — Центр",
    }))
    const csv = serializeTable(buildExportTable(rows))

    // Продавец меняет в Excel одну клетку.
    const edited = csv.replace(";2600;", ";2950;")
    const file = readImportFile(edited)
    const preview = buildImportPreview(
      file.rows as ImportFileRow[],
      indexBySku(products),
      "sloc_1"
    )

    expect(file.locations).toEqual(["Склад Астана — Центр"])
    expect(preview.changes).toEqual([{ variant_id: "variant_1", price: 2950 }])
    expect(preview.summary).toMatchObject({ rows: 1, changes: 1, issues: 0 })
  })
})
