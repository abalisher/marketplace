import {
  PRICE_STOCK_OTHER_CATEGORY,
  RawProduct,
  RawVariant,
  buildHistoryRow,
  buildPriceStockRow,
  buildPriceStockRows,
  countByCategory,
  countStock,
  filterByCategory,
  filterByStock,
  isNoopChange,
  resolveChange,
  trimUnchanged,
  variantPrice,
  withLocationNames,
} from "../rows"

// Правила экрана «Цены и остатки» (T10.14): что показываем в строке и что
// вообще разрешаем править. Экран тонкий — решения здесь.

const variant = (over: Partial<RawVariant> = {}): RawVariant => ({
  id: "variant_1",
  title: "Мешок 25 кг",
  sku: "GKL-25",
  manage_inventory: true,
  prices: [{ id: "price_1", amount: 2400, currency_code: "kzt", rules_count: 0 }],
  inventory_items: [
    {
      inventory: {
        id: "iitem_1",
        location_levels: [
          {
            location_id: "sloc_1",
            stocked_quantity: 40,
            reserved_quantity: 12,
          },
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

describe("строка экрана", () => {
  it("складывает остаток по складам и показывает свободный", () => {
    const row = buildPriceStockRow(
      product(),
      variant({
        inventory_items: [
          {
            inventory: {
              id: "iitem_1",
              location_levels: [
                { location_id: "sloc_1", stocked_quantity: 40, reserved_quantity: 12 },
                { location_id: "sloc_2", stocked_quantity: 10, reserved_quantity: 0 },
              ],
            },
          },
        ],
      })
    )

    expect(row.stocked).toBe(50)
    expect(row.reserved).toBe(12)
    expect(row.available).toBe(38)
    expect(row.stocked_total).toBe(50)
    // Складов два — куда писать правку, экран обязан спросить.
    expect(row.location_id).toBeNull()
    expect(row.locations_count).toBe(2)
  })

  it("в разрезе одного склада показывает остаток этого склада", () => {
    const twoLocations = variant({
      inventory_items: [
        {
          inventory: {
            id: "iitem_1",
            location_levels: [
              { location_id: "sloc_1", stocked_quantity: 40, reserved_quantity: 12 },
              { location_id: "sloc_2", stocked_quantity: 10, reserved_quantity: 0 },
            ],
          },
        },
      ],
    })

    const row = buildPriceStockRow(product(), twoLocations, "sloc_2")

    expect(row.stocked).toBe(10)
    expect(row.reserved).toBe(0)
    expect(row.available).toBe(10)
    // Сумма по складам остаётся под рукой: «10 из 50 на этом складе».
    expect(row.stocked_total).toBe(50)
    // Правка пойдёт на выбранный склад — спрашивать больше нечего.
    expect(row.location_id).toBe("sloc_2")
    expect(row.locations_count).toBe(2)
  })

  it("несёт цену, единицу и категорию без технических полей ядра", () => {
    const row = buildPriceStockRow(product(), variant())

    expect(row.price).toBe(2400)
    expect(row.currency_code).toBe("kzt")
    expect(row.unit).toBe("мешок")
    expect(row.category_handle).toBe("finishing")
    expect(row.category_name).toBe("Отделочные материалы")
    expect(row.location_id).toBe("sloc_1")
    expect(row.price_editable).toBe(true)
    expect(row.stock_editable).toBe(true)
  })

  it("даёт по строке на каждый вариант товара", () => {
    const rows = buildPriceStockRows([
      product({
        variants: [
          variant({ id: "variant_1", title: "Мешок 25 кг" }),
          variant({ id: "variant_2", title: "Мешок 40 кг" }),
        ],
      }),
    ])

    expect(rows.map((row) => row.variant_id)).toEqual(["variant_1", "variant_2"])
  })

  it("подставляет название склада вместо id", () => {
    const rows = withLocationNames(
      buildPriceStockRows([product()]),
      new Map([["sloc_1", "Склад на Пушкина"]])
    )

    expect(rows[0].location_name).toBe("Склад на Пушкина")
  })

  it("не даёт править цену, заданную правилами", () => {
    const row = buildPriceStockRow(
      product(),
      variant({
        prices: [
          { id: "price_1", amount: 2400, currency_code: "kzt", rules_count: 1 },
        ],
      })
    )

    expect(row.price).toBe(2400)
    expect(row.price_editable).toBe(false)
  })

  it("не даёт править остаток, который не ведётся", () => {
    const row = buildPriceStockRow(
      product(),
      variant({ manage_inventory: false })
    )

    expect(row.stock_editable).toBe(false)
  })

  it("проносит цены в других валютах через правку", () => {
    const price = variantPrice(
      variant({
        prices: [
          { amount: 2400, currency_code: "kzt" },
          { amount: 5, currency_code: "usd" },
        ],
      })
    )

    expect(price.amount).toBe(2400)
    expect(price.carry_prices).toEqual([{ amount: 5, currency_code: "usd" }])
  })

  it("считает чипы по свободному остатку, а не по складскому", () => {
    const rows = buildPriceStockRows([
      product({
        variants: [
          // Лежит 40, зарезервировано 40 — продавать нечего.
          variant({
            id: "variant_1",
            inventory_items: [
              {
                inventory: {
                  id: "iitem_1",
                  location_levels: [
                    { location_id: "sloc_1", stocked_quantity: 40, reserved_quantity: 40 },
                  ],
                },
              },
            ],
          }),
          variant({ id: "variant_2" }),
        ],
      }),
    ])

    expect(countStock(rows, 10)).toEqual({ total: 2, zero: 1, low: 1 })
    expect(filterByStock(rows, "zero", 10).map((row) => row.variant_id)).toEqual([
      "variant_1",
    ])
    expect(filterByStock(rows, undefined, 10)).toHaveLength(2)
  })
})

describe("товар из 1С компании", () => {
  const managed = product({
    metadata: { source: "1c", onec_key: "k1", onec_fields: ["price", "stock"] },
  })
  const own = product({ metadata: { source: "1c", onec_key: "k1", onec_fields: [] } })

  it("что ведёт 1С — только для чтения, строка помечена", () => {
    const row = buildPriceStockRow(managed, variant())
    expect(row.managed_by).toBe("onec")
    expect(row.onec_fields).toEqual(["price", "stock"])
    expect(row.price_editable).toBe(false)
    expect(row.stock_editable).toBe(false)
  })

  it("чего 1С не присылает — правит продавец", () => {
    const row = buildPriceStockRow(own, variant())
    expect(row.managed_by).toBe("onec")
    expect(row.price_editable).toBe(true)
    expect(row.stock_editable).toBe(true)
  })

  it("товар первой версии без метки полей — ведёт 1С целиком", () => {
    const legacy = product({ metadata: { source: "1c" } })
    expect(buildPriceStockRow(legacy, variant()).onec_fields).toEqual(["price", "stock"])
  })

  it("обычный товар не помечен", () => {
    const row = buildPriceStockRow(product(), variant())
    expect(row.managed_by).toBeNull()
    expect(row.onec_fields).toEqual([])
  })

  it("правка поля, которое ведёт 1С, — понятный отказ", () => {
    const found = { product: managed, variant: variant() }
    expect(
      resolveChange({ variant_id: "variant_1", stock: 5 }, found).issue
    ).toMatchObject({ code: "onec_managed" })
    expect(
      resolveChange({ variant_id: "variant_1", price: 1 }, found).issue
    ).toMatchObject({ code: "onec_managed" })
  })

  it("правка поля, которое 1С не ведёт, проходит", () => {
    const found = { product: own, variant: variant() }
    expect(resolveChange({ variant_id: "variant_1", price: 2600 }, found).resolved)
      .toMatchObject({ new_price: 2600 })
  })
})

describe("разбор правки", () => {
  const found = { product: product(), variant: variant() }

  it("собирает снимок «было» для журнала", () => {
    const { resolved } = resolveChange(
      { variant_id: "variant_1", price: 2600, stock: 55 },
      found
    )

    expect(resolved).toMatchObject({
      variant_id: "variant_1",
      product_title: "Пескобетон М300",
      old_price: 2400,
      new_price: 2600,
      old_stock: 40,
      new_stock: 55,
      location_id: "sloc_1",
      inventory_item_id: "iitem_1",
    })
  })

  it("правка одной цены не трогает остаток", () => {
    const { resolved } = resolveChange({ variant_id: "variant_1", price: 2600 }, found)

    expect(resolved?.new_stock).toBeNull()
    expect(resolved?.old_stock).toBeNull()
    expect(resolved?.location_id).toBeNull()
  })

  it("отказывает по строке, а не по всей партии", () => {
    expect(resolveChange({ variant_id: "нет такого", price: 1 }, undefined).issue)
      .toMatchObject({ code: "unknown_variant" })

    expect(resolveChange({ variant_id: "variant_1" }, found).issue).toMatchObject({
      code: "empty_change",
    })

    expect(
      resolveChange({ variant_id: "variant_1", price: 1 }, {
        product: product(),
        variant: variant({
          prices: [{ amount: 2400, currency_code: "kzt", rules_count: 2 }],
        }),
      }).issue
    ).toMatchObject({ code: "price_rules" })

    expect(
      resolveChange({ variant_id: "variant_1", stock: 5 }, {
        product: product(),
        variant: variant({ manage_inventory: false }),
      }).issue
    ).toMatchObject({ code: "stock_not_managed", title: "Пескобетон М300 — Мешок 25 кг" })
  })

  it("требует назвать склад, когда позиция лежит на нескольких", () => {
    const twoLocations = {
      product: product(),
      variant: variant({
        inventory_items: [
          {
            inventory: {
              id: "iitem_1",
              location_levels: [
                { location_id: "sloc_1", stocked_quantity: 40 },
                { location_id: "sloc_2", stocked_quantity: 10 },
              ],
            },
          },
        ],
      }),
    }

    expect(
      resolveChange({ variant_id: "variant_1", stock: 5 }, twoLocations).issue
    ).toMatchObject({ code: "location_required" })

    const { resolved } = resolveChange(
      { variant_id: "variant_1", stock: 5, location_id: "sloc_2" },
      twoLocations
    )
    expect(resolved).toMatchObject({ location_id: "sloc_2", old_stock: 10, new_stock: 5 })
  })

  it("первый завоз на склад — правка, а не ошибка", () => {
    const { resolved } = resolveChange(
      { variant_id: "variant_1", stock: 12, location_id: "sloc_2" },
      found
    )

    expect(resolved).toMatchObject({ location_id: "sloc_2", old_stock: 0, new_stock: 12 })
  })

  it("вычёркивает половину правки, совпавшую с текущим числом", () => {
    // Продавец поменял только остаток, а экран прислал строку целиком.
    const { resolved } = resolveChange(
      { variant_id: "variant_1", price: 2400, stock: 55 },
      found
    )
    const trimmed = trimUnchanged(resolved!)

    expect(trimmed.new_price).toBeNull()
    expect(trimmed.new_stock).toBe(55)
    expect(isNoopChange(resolved!)).toBe(false)

    // ...и наоборот: остаток тот же — склад и снимок остатка не нужны.
    const priceOnly = trimUnchanged(
      resolveChange({ variant_id: "variant_1", price: 2500, stock: 40 }, found)
        .resolved!
    )
    expect(priceOnly.new_price).toBe(2500)
    expect(priceOnly.new_stock).toBeNull()
    expect(priceOnly.location_id).toBeNull()
    expect(priceOnly.old_stock).toBeNull()
  })

  it("правка «в то же число» ничего не пишет", () => {
    const { resolved } = resolveChange(
      { variant_id: "variant_1", price: 2400, stock: 40 },
      found
    )

    expect(isNoopChange(resolved!)).toBe(true)
    expect(
      isNoopChange(resolveChange({ variant_id: "variant_1", price: 2500 }, found).resolved!)
    ).toBe(false)
  })
})

describe("чипы категорий", () => {
  // Ассортимент — четыре категории; всё остальное (погашенная категория,
  // товар без категории) считается одним мешком «вне ассортимента»: иначе
  // такие строки висят в таблице, и отфильтровать их нечем (T10.14e).
  const rows = buildPriceStockRows([
    product({ id: "prod_1", variants: [variant({ id: "variant_1" })] }),
    product({
      id: "prod_2",
      categories: [{ handle: "plumbing", name: "Сантехника" }],
      variants: [variant({ id: "variant_2" })],
    }),
    product({
      id: "prod_3",
      // Снятый с продажи общестрой: категория погашена, но позиция жива.
      categories: [{ handle: "building", name: "Строительные материалы" }],
      variants: [variant({ id: "variant_3" })],
    }),
    product({
      id: "prod_4",
      categories: [],
      variants: [variant({ id: "variant_4" })],
    }),
  ])

  it("считает по позиции на каждую категорию и мешок вне ассортимента", () => {
    expect(countByCategory(rows)).toEqual({
      finishing: 1,
      electrical: 0,
      plumbing: 1,
      fasteners: 0,
      [PRICE_STOCK_OTHER_CATEGORY]: 2,
    })
  })

  it("фильтрует по категории, а «вне ассортимента» собирает остаток", () => {
    expect(
      filterByCategory(rows, "plumbing").map((row) => row.variant_id)
    ).toEqual(["variant_2"])
    expect(
      filterByCategory(rows, PRICE_STOCK_OTHER_CATEGORY).map(
        (row) => row.variant_id
      )
    ).toEqual(["variant_3", "variant_4"])
    expect(filterByCategory(rows, undefined)).toHaveLength(4)
  })
})

describe("строка журнала", () => {
  const change = {
    id: "pchg_1",
    variant_id: "variant_1",
    product_title: "Пескобетон М300",
    variant_title: "Мешок 25 кг",
    sku: "GKL-25",
    currency_code: "kzt",
    old_stock: 373,
    new_stock: 370,
    location_id: "sloc_1",
    changed_by_name: "admin@example.com",
    source: "manual",
    created_at: "2026-09-02T08:00:00.000Z",
  }

  it("называет склад правки остатка", () => {
    const row = buildHistoryRow(
      change,
      new Map([["sloc_1", "Склад на Пушкина"]])
    )

    expect(row.location_id).toBe("sloc_1")
    expect(row.location_name).toBe("Склад на Пушкина")
  })

  it("склад мог быть удалён — правка остаётся без названия", () => {
    expect(buildHistoryRow(change, new Map()).location_name).toBeNull()
    expect(
      buildHistoryRow({ ...change, location_id: null }, new Map()).location_id
    ).toBeNull()
  })

  it("в графе «Кто» — учётка, а не её почта", () => {
    expect(buildHistoryRow(change).changed_by_name).toBe("admin")
    expect(
      buildHistoryRow({ ...change, changed_by_name: "Продавец" })
        .changed_by_name
    ).toBe("Продавец")
    expect(
      buildHistoryRow({ ...change, changed_by_name: null }).changed_by_name
    ).toBeNull()
  })
})
