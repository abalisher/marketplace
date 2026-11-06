import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { searchProductsTool } from "../tools/search-products"
import { AssistantContext } from "../types"

// Unit: search_products — результат для модели (цена, единица, наличие по
// вариантам) и разбор запроса. Карточек подбора в ленту инструмент больше не
// кладёт (T10.19). Ядро замокано (query.graph); живой поиск — http-тест + live-smoke.

const makeContainer = (rows: unknown[]): MedusaContainer =>
  ({
    resolve: (key: string) => {
      if (key === ContainerRegistrationKeys.QUERY) {
        return { graph: async () => ({ data: rows }) }
      }
      throw new Error(`unexpected resolve: ${key}`)
    },
  }) as unknown as MedusaContainer

describe("assistant search_products attachments", () => {
  it("returns price, unit and stock to the model and puts no cards into the feed", async () => {
    const container = makeContainer([
      {
        id: "prod_1",
        title: "Цемент ПЦ 400-Д20",
        status: "published",
        thumbnail: "https://cdn/x.jpg",
        product_card: { unit: "мешок" },
        variants: [
          {
            id: "var_1",
            prices: [{ amount: 3200, currency_code: "kzt" }],
            inventory_items: [
              {
                inventory: {
                  location_levels: [
                    { stocked_quantity: 10, reserved_quantity: 0 },
                  ],
                },
              },
            ],
          },
        ],
      },
    ])
    const context: AssistantContext = { attachments: [] }
    const out = await searchProductsTool.execute(
      container,
      { query: "цемент" },
      context
    )

    expect(out.products).toMatchObject([
      {
        title: "Цемент ПЦ 400-Д20",
        currency: "kzt",
        unit: "мешок",
        variants: [{ variant_id: "var_1", price: 3200, in_stock: true }],
      },
    ])
    expect(context.attachments).toEqual([])
  })

  it("blank query returns no products and no attachments, without touching the container", async () => {
    const trap = new Proxy(
      {},
      {
        get() {
          throw new Error("container must not be used on the empty-query path")
        },
      }
    ) as unknown as MedusaContainer
    const context: AssistantContext = { attachments: [] }
    const out = await searchProductsTool.execute(trap, { query: "  " }, context)
    expect(out.products).toEqual([])
    expect(context.attachments).toEqual([])
  })

  it("matches ALL query tokens (AND), so «арматура 12» finds «Арматура А500С 12 мм»", async () => {
    // Запросов может быть два: сначала AND, затем OR-фолбэк, если AND пуст
    // (см. «разбор запроса» ниже) — проверяем ПЕРВЫЙ, основной.
    const captured: { filters?: Record<string, unknown> }[] = []
    const container = {
      resolve: (key: string) => {
        if (key === ContainerRegistrationKeys.QUERY) {
          return {
            graph: async (arg: { filters?: Record<string, unknown> }) => {
              captured.push(arg)
              return { data: [] }
            },
          }
        }
        throw new Error(`unexpected resolve: ${key}`)
      },
    } as unknown as MedusaContainer

    await searchProductsTool.execute(
      container,
      { query: "арматура 12" },
      { attachments: [] }
    )
    expect(captured[0]?.filters?.$and).toEqual([
      { title: { $ilike: "%арматура%" } },
      { title: { $ilike: "%12%" } },
    ])
  })

  // Ложный отказ «у нас такого нет» на товар, лежащий на складе, — самый дорогой
  // дефект консультанта (прогон QA 2026-08-03: «минваты нет» при остатке 1950).
  // Причина была в разборе запроса, поэтому проверяем именно его. Примеры взяты
  // из действующего ассортимента (четыре категории, 2026-09-01).
  describe("разбор запроса (защита от ложного «у нас нет»)", () => {
    const captureFilters = () => {
      const calls: Record<string, unknown>[] = []
      const container = {
        resolve: (key: string) => {
          if (key === ContainerRegistrationKeys.QUERY) {
            return {
              graph: async (arg: { filters?: Record<string, unknown> }) => {
                calls.push(arg.filters ?? {})
                return { data: [] }
              },
            }
          }
          throw new Error(`unexpected resolve: ${key}`)
        },
      } as unknown as MedusaContainer
      return { container, calls }
    }

    it("разворачивает разговорное «провод» в слово каталога «кабель»", async () => {
      const { container, calls } = captureFilters()
      await searchProductsTool.execute(
        container,
        { query: "провод" },
        { attachments: [] }
      )
      expect(calls[0]).toMatchObject({ title: { $ilike: "%кабель%" } })
    })

    it("отбрасывает служебные слова: «саморезы для гипсокартона» ищет по «саморез»", async () => {
      const { container, calls } = captureFilters()
      await searchProductsTool.execute(
        container,
        { query: "саморезы для гипсокартона" },
        { attachments: [] }
      )
      // «для» отброшено, «саморезы» → «саморез»; остаётся два слова (AND).
      expect(calls[0].$and).toEqual([
        { title: { $ilike: "%саморез%" } },
        { title: { $ilike: "%гипсокартона%" } },
      ])
    })

    it("бьёт запрос по тире: «щебень фр. 20-40» даёт отдельные слова", async () => {
      const { container, calls } = captureFilters()
      await searchProductsTool.execute(
        container,
        { query: "щебень фр. 20-40" },
        { attachments: [] }
      )
      expect(calls[0].$and).toEqual([
        { title: { $ilike: "%щебень%" } },
        { title: { $ilike: "%фр%" } },
        { title: { $ilike: "%20%" } },
        { title: { $ilike: "%40%" } },
      ])
    })

    it("когда AND пусто — повторяет поиск по ЛЮБОМУ из слов (OR), а не сдаётся", async () => {
      const { container, calls } = captureFilters()
      await searchProductsTool.execute(
        container,
        { query: "щебень 20-40" },
        { attachments: [] }
      )
      expect(calls).toHaveLength(2)
      expect(calls[1].$or).toEqual([
        { title: { $ilike: "%щебень%" } },
        { title: { $ilike: "%20%" } },
        { title: { $ilike: "%40%" } },
      ])
    })

    it("одно слово без совпадений OR-повтором не дублирует запрос", async () => {
      const { container, calls } = captureFilters()
      await searchProductsTool.execute(
        container,
        { query: "унитаз" },
        { attachments: [] }
      )
      expect(calls).toHaveLength(1)
    })
  })

  it("surfaces ALL variants so the assistant can offer a choice", async () => {
    const container = makeContainer([
      {
        id: "prod_roof",
        title: "Металлочерепица Монтеррей 0.45 мм",
        status: "published",
        thumbnail: null,
        product_card: { unit: "м²" },
        variants: [
          {
            id: "var_graphite",
            title: "Полиэстер, графит",
            prices: [{ amount: 3200, currency_code: "kzt" }],
            inventory_items: [
              { inventory: { location_levels: [{ stocked_quantity: 100, reserved_quantity: 0 }] } },
            ],
          },
          {
            id: "var_brown",
            title: "Матовый, коричневый",
            prices: [{ amount: 3900, currency_code: "kzt" }],
            inventory_items: [
              { inventory: { location_levels: [{ stocked_quantity: 50, reserved_quantity: 0 }] } },
            ],
          },
        ],
      },
    ])
    const context: AssistantContext = { attachments: [] }
    const out = await searchProductsTool.execute(container, { query: "металлочерепица" }, context)

    // Оба варианта в результате товара — с ценой и подписью варианта: выбор
    // цвета модель предлагает текстом.
    const products = out.products as {
      variants: { variant_id: string; variant_title: string | null; price: number }[]
    }[]
    expect(products[0].variants).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          variant_id: "var_graphite",
          variant_title: "Полиэстер, графит",
          price: 3200,
        }),
        expect.objectContaining({
          variant_id: "var_brown",
          variant_title: "Матовый, коричневый",
          price: 3900,
        }),
      ])
    )
    expect(context.attachments).toEqual([])
  })

  // Категория каталога (T10.10): ассистент группирует по ней список и умеет
  // спросить ассортимент категории целиком.
  describe("категория каталога", () => {
    const captureCalls = (productRows: unknown[]) => {
      const calls: { entity?: string; filters?: Record<string, unknown> }[] = []
      const container = {
        resolve: (key: string) => {
          if (key === ContainerRegistrationKeys.QUERY) {
            return {
              graph: async (arg: {
                entity?: string
                filters?: Record<string, unknown>
              }) => {
                calls.push(arg)
                return { data: productRows }
              },
            }
          }
          throw new Error(`unexpected resolve: ${key}`)
        },
      } as unknown as MedusaContainer
      return { container, calls }
    }

    const productRow = {
      id: "prod_1",
      title: "Кабель ВВГнг-LS 3×2.5",
      status: "published",
      thumbnail: null,
      product_card: { unit: "м" },
      categories: [{ handle: "electrical", name: "Электрика" }],
      variants: [
        {
          id: "var_1",
          title: "3×2.5 мм²",
          prices: [{ amount: 620, currency_code: "kzt" }],
          inventory_items: [
            {
              inventory: {
                location_levels: [
                  { stocked_quantity: 500, reserved_quantity: 0 },
                ],
              },
            },
          ],
        },
      ],
    }

    it("сужает поиск категорией и отдаёт её название в результате", async () => {
      const { container, calls } = captureCalls([productRow])
      const out = await searchProductsTool.execute(
        container,
        { query: "кабель", category: "electrical" },
        { attachments: [] }
      )

      expect(calls[0].filters).toMatchObject({
        status: "published",
        categories: { handle: "electrical" },
        title: { $ilike: "%кабель%" },
      })
      expect(out.products).toMatchObject([{ category: "Электрика" }])
    })

    it("пустой запрос при заданной категории — это обзор ассортимента, а не пустой ответ", async () => {
      const { container, calls } = captureCalls([productRow])
      const out = await searchProductsTool.execute(
        container,
        { query: "", category: "electrical" },
        { attachments: [] }
      )

      // Фильтра по названию нет — только статус и категория.
      expect(calls[0].filters).toEqual({
        status: "published",
        categories: { handle: "electrical" },
      })
      expect((out.products as unknown[]).length).toEqual(1)
    })

    it("неизвестное значение category не сужает поиск молча", async () => {
      const { container, calls } = captureCalls([productRow])
      await searchProductsTool.execute(
        container,
        { query: "кабель", category: "roofing" },
        { attachments: [] }
      )
      expect(calls[0].filters).not.toHaveProperty("categories")
    })

    it("без запроса и без категории ядро не трогаем", async () => {
      const { container, calls } = captureCalls([productRow])
      const out = await searchProductsTool.execute(
        container,
        { query: "  " },
        { attachments: [] }
      )
      expect(out.products).toEqual([])
      expect(calls).toHaveLength(0)
    })
  })
})

describe("search_products: бренд", () => {
  const product = (id: string, title: string, brand: string | null, price: number) => ({
    id,
    title,
    status: "published",
    metadata: brand ? { brand } : {},
    variants: [{ id: `var_${id}`, prices: [{ amount: price, currency_code: "kzt" }] }],
  })

  const recordingContainer = (answer: (filters: Record<string, unknown>) => unknown[]) => {
    const calls: Record<string, unknown>[] = []
    const container = {
      resolve: (key: string) => {
        if (key === ContainerRegistrationKeys.QUERY) {
          return {
            graph: async ({ filters }: { filters: Record<string, unknown> }) => {
              calls.push(filters)
              return { data: answer(filters) }
            },
          }
        }
        throw new Error(`unexpected resolve: ${key}`)
      },
    } as unknown as MedusaContainer
    return { container, calls }
  }

  it("отдаёт бренд каждого товара — одноимённые товары разных брендов различимы", async () => {
    const { container } = recordingContainer(() => [
      product("p1", "Гипсокартон 12,5 мм Knauf", "Knauf", 2600),
      product("p2", "Гипсокартон 12,5 мм Волма", "Волма", 2450),
    ])
    const out = await searchProductsTool.execute(
      container,
      { query: "гипсокартон" },
      { attachments: [] }
    )
    expect((out.products as { title: string; brand: string | null }[]).map((p) => p.brand)).toEqual([
      "Волма",
      "Knauf",
    ])
    expect(out).not.toHaveProperty("brand_not_found")
  })

  it("названный бренд сужает поиск по названию", async () => {
    const { container, calls } = recordingContainer(() => [
      product("p1", "Гипсокартон 12,5 мм Knauf", "Knauf", 2600),
    ])
    await searchProductsTool.execute(
      container,
      { query: "гипсокартон", brand: "Knauf" },
      { attachments: [] }
    )
    expect(calls[0]).toMatchObject({
      $and: [{ title: { $ilike: "%гипсокартон%" } }, { title: { $ilike: "%knauf%" } }],
    })
  })

  it("бренда нет — честный признак brand_not_found и тот же товар других брендов", async () => {
    const { container, calls } = recordingContainer((filters) =>
      "$and" in filters ? [] : [product("p2", "Гипсокартон 12,5 мм Волма", "Волма", 2450)]
    )
    const out = await searchProductsTool.execute(
      container,
      { query: "гипсокартон", brand: "Gyproc" },
      { attachments: [] }
    )
    expect(out.brand_not_found).toBe("Gyproc")
    expect((out.products as { brand: string | null }[])[0].brand).toBe("Волма")
    expect(calls).toHaveLength(2)
  })
})
