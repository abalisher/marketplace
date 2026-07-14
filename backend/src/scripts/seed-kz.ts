import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createStockLocationsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"
import { createProductCardWorkflow } from "../workflows/create-product-card"
import { submitProductForModerationWorkflow } from "../workflows/submit-product-for-moderation"
import { approveProductCardWorkflow } from "../workflows/approve-product-card"
import { ProductSegment } from "../modules/catalog/models/product-card"

// Сид региона Казахстан для витрины: валюта KZT, регион с страной kz, склады
// в Астане (город = stock_location.address.city), демо-каталог стройматериалов
// с ценами в тенге и остатками по складам (все статусы модерации → published).
// Запуск: npx medusa exec ./src/scripts/seed-kz.ts. Идемпотентен: регион,
// валюта, склады и товары создаются только если их ещё нет (проверка по имени).
//
// Оговорка: fulfillment/доставку регион пока НЕ получает (оформление заказа —
// задача placeOrder, Фаза 2); сид закрывает отображение каталога, цены и
// остатки «город → склад → остаток».
export default async function seedKz({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const regionService = container.resolve(Modules.REGION)
  const stockLocationService = container.resolve(Modules.STOCK_LOCATION)
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL)
  const productService = container.resolve(Modules.PRODUCT)

  const CITY = "Astana"
  const CURRENCY = "kzt"

  // 1. Валюта KZT в списке поддерживаемых валют магазина (дефолт не трогаем —
  // регион сам задаёт валюту витрины). supported_currencies — relation,
  // тянем через query.graph (listStores её не отдаёт → потерялся бы is_default).
  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id", "supported_currencies.currency_code", "supported_currencies.is_default"],
  })
  const store = stores[0]
  if (!store) {
    throw new Error("Store not found — run core migrations/seed first")
  }
  const currencies = (store.supported_currencies ?? []) as {
    currency_code: string
    is_default: boolean
  }[]
  const hasKzt = currencies.some((c) => c.currency_code === CURRENCY)
  if (!hasKzt) {
    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: store.id },
        update: {
          supported_currencies: [
            ...currencies.map((c) => ({
              currency_code: c.currency_code,
              is_default: c.is_default,
            })),
            { currency_code: CURRENCY },
          ],
        },
      },
    })
    console.log(`+ валюта ${CURRENCY.toUpperCase()} добавлена в магазин`)
  } else {
    console.log(`— валюта ${CURRENCY.toUpperCase()} уже поддерживается`)
  }

  // 2. Регион Казахстан (страна kz, валюта KZT, платёжный провайдер — ядровый
  // manual). Дальше товары получают цены в KZT, а витрина — регион по умолчанию.
  let [region] = await regionService.listRegions({ name: "Kazakhstan" }, { take: 1 })
  if (!region) {
    const { result } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "Kazakhstan",
            currency_code: CURRENCY,
            countries: ["kz"],
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    })
    region = result[0]
    console.log(`+ регион Kazakhstan создан (${region.id})`)
  } else {
    console.log(`— регион Kazakhstan уже есть (${region.id})`)
  }

  // 3. Дефолтный канал продаж — к нему привязываем склады и товары.
  const [salesChannel] = await salesChannelService.listSalesChannels(
    { name: "Default Sales Channel" },
    { take: 1 }
  )
  if (!salesChannel) {
    throw new Error("Default Sales Channel not found — run core seed first")
  }

  // 4. Склады в Астане (город = address.city). Middleware ограничивает ≤5 на
  // город — здесь создаём 2. Новые склады линкуем к каналу продаж.
  const warehouseDefs = [
    { name: "Склад Астана — Центр", address_1: "пр. Мангилик Ел, 10" },
    { name: "Склад Астана — Промзона", address_1: "ул. Индустриальная, 25" },
  ]
  const warehouseIds: string[] = []
  for (const def of warehouseDefs) {
    const [existing] = await stockLocationService.listStockLocations(
      { name: def.name },
      { take: 1 }
    )
    if (existing) {
      warehouseIds.push(existing.id)
      console.log(`— склад уже есть: ${def.name}`)
      continue
    }
    const { result } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          {
            name: def.name,
            address: {
              city: CITY,
              country_code: "kz",
              address_1: def.address_1,
            },
          },
        ],
      },
    })
    const created = result[0]
    warehouseIds.push(created.id)
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: { id: created.id, add: [salesChannel.id] },
    })
    console.log(`+ склад создан: ${def.name} (${created.id})`)
  }

  // 5. Категория каталога.
  const CATEGORY_NAME = "Строительные материалы"
  let [category] = await productService.listProductCategories(
    { name: CATEGORY_NAME },
    { take: 1 }
  )
  if (!category) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: { product_categories: [{ name: CATEGORY_NAME, is_active: true }] },
    })
    category = result[0]
    console.log(`+ категория создана: ${CATEGORY_NAME}`)
  } else {
    console.log(`— категория уже есть: ${CATEGORY_NAME}`)
  }

  // 6. Демо-товары: сегмент, ед. изм., варианты (фасовка) с ценой в KZT и
  // остатками по обоим складам. Создаём черновиком, затем через реальный флоу
  // модерации (карточка → submit → approve) выводим в published.
  type SeedVariant = {
    title: string
    sku: string
    price: number // тенге, major units
    stock: number[] // остаток по складам, порядок = warehouseIds
  }
  type SeedProduct = {
    title: string
    segment: ProductSegment
    unit: string
    optionTitle: string
    certificates: { name: string; url: string }[]
    variants: SeedVariant[]
  }

  const products: SeedProduct[] = [
    {
      title: "Цемент ПЦ 400-Д20",
      segment: "economy",
      unit: "мешок",
      optionTitle: "Фасовка",
      certificates: [{ name: "ГОСТ 31108-2020", url: "/files/cert-cement.pdf" }],
      variants: [
        { title: "Мешок 25 кг", sku: "KZ-CEM400-25", price: 3200, stock: [400, 250] },
        { title: "Мешок 50 кг", sku: "KZ-CEM400-50", price: 6000, stock: [300, 180] },
      ],
    },
    {
      title: "Кирпич керамический рядовой М150",
      segment: "comfort",
      unit: "шт",
      optionTitle: "Тип",
      certificates: [{ name: "ГОСТ 530-2012", url: "/files/cert-brick.pdf" }],
      variants: [
        { title: "Полнотелый", sku: "KZ-BRICK-M150", price: 120, stock: [12000, 8000] },
      ],
    },
    {
      title: "Арматура А500С 12 мм",
      segment: "business",
      unit: "тонна",
      optionTitle: "Диаметр",
      certificates: [{ name: "ГОСТ 34028-2016", url: "/files/cert-rebar.pdf" }],
      variants: [
        { title: "12 мм", sku: "KZ-REBAR-12", price: 450000, stock: [40, 30] },
      ],
    },
    {
      title: "Песок строительный мытый",
      segment: "economy",
      unit: "тонна",
      optionTitle: "Фракция",
      certificates: [{ name: "ГОСТ 8736-2014", url: "/files/cert-sand.pdf" }],
      variants: [
        { title: "0–2 мм", sku: "KZ-SAND-0-2", price: 8000, stock: [500, 350] },
      ],
    },
  ]

  for (const def of products) {
    const [existing] = await productService.listProducts(
      { title: def.title },
      { take: 1 }
    )
    if (existing) {
      console.log(`— товар уже есть: ${def.title}`)
      continue
    }

    // 6a. Товар с вариантами, ценами и привязкой к каналу продаж (черновик).
    const { result: createdProducts } = await createProductsWorkflow(
      container
    ).run({
      input: {
        products: [
          {
            title: def.title,
            status: ProductStatus.DRAFT,
            category_ids: [category.id],
            sales_channels: [{ id: salesChannel.id }],
            options: [
              { title: def.optionTitle, values: def.variants.map((v) => v.title) },
            ],
            variants: def.variants.map((v) => ({
              title: v.title,
              sku: v.sku,
              manage_inventory: true,
              options: { [def.optionTitle]: v.title },
              prices: [{ amount: v.price, currency_code: CURRENCY }],
            })),
          },
        ],
      },
    })
    const product = createdProducts[0]

    // 6b. Остатки по складам: получаем inventory item каждого варианта и
    // создаём уровни на обоих складах.
    const { data: withInventory } = await query.graph({
      entity: "product",
      fields: [
        "variants.sku",
        "variants.inventory_items.inventory.id",
      ],
      filters: { id: product.id },
    })
    const inventoryLevels: {
      inventory_item_id: string
      location_id: string
      stocked_quantity: number
    }[] = []
    for (const variant of withInventory[0]?.variants ?? []) {
      const inventoryItemId = variant?.inventory_items?.[0]?.inventory?.id
      if (!inventoryItemId) {
        continue
      }
      const seedVariant = def.variants.find((v) => v.sku === variant.sku)
      if (!seedVariant) {
        continue
      }
      warehouseIds.forEach((locationId, idx) => {
        inventoryLevels.push({
          inventory_item_id: inventoryItemId,
          location_id: locationId,
          stocked_quantity: seedVariant.stock[idx] ?? 0,
        })
      })
    }
    if (inventoryLevels.length) {
      await createInventoryLevelsWorkflow(container).run({
        input: { inventory_levels: inventoryLevels },
      })
    }

    // 6c. Карточка каталога → отправка на модерацию → одобрение (published).
    await createProductCardWorkflow(container).run({
      input: {
        product_id: product.id,
        segment: def.segment,
        unit: def.unit,
        certificates: def.certificates,
      },
      throwOnError: true,
    })
    await submitProductForModerationWorkflow(container).run({
      input: { product_id: product.id },
      throwOnError: true,
    })
    await approveProductCardWorkflow(container).run({
      input: { product_id: product.id },
      throwOnError: true,
    })

    console.log(`+ товар создан и опубликован: ${def.title} (${def.segment})`)
  }

  console.log("Сид региона Казахстан завершён.")
}
