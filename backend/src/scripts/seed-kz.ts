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
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateRegionsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"
import { KASPI_PROVIDER_ID } from "../modules/payment-kaspi"
import { createProductCardWorkflow } from "../workflows/create-product-card"
import { submitProductForModerationWorkflow } from "../workflows/submit-product-for-moderation"
import { approveProductCardWorkflow } from "../workflows/approve-product-card"
import { ProductSegment } from "../modules/catalog/models/product-card"

// Сид региона Казахстан для витрины: валюта KZT, регион с страной kz, склады
// в Астане (город = stock_location.address.city), демо-каталог стройматериалов
// с ценами в тенге и остатками по складам (все статусы модерации → published),
// доставка региона: fulfillment-набор «Доставка по Астане» (shipping) + наборы
// самовывоза на каждый склад (pickup — витрина-стартер различает их по
// fulfillment_set.type и показывает переключатель «Pick up your order»).
// Запуск: npx medusa exec ./src/scripts/seed-kz.ts. Идемпотентен: регион,
// валюта, склады, товары и доставка создаются только если их ещё нет
// (проверка по имени).
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

  // 2a. Провайдер Kaspi у региона (идемпотентно): без него нельзя создать
  // платёжную сессию pp_kaspi_kaspi в оформлении (POST /store/carts/:id/
  // payment/kaspi). payment_providers — link, читаем через query.graph.
  const { data: regionsWithProviders } = await query.graph({
    entity: "region",
    fields: ["id", "payment_providers.id"],
    filters: { id: region.id },
  })
  const providerIds = (
    (regionsWithProviders[0]?.payment_providers ?? []) as { id: string }[]
  ).map((p) => p.id)
  if (!providerIds.includes(KASPI_PROVIDER_ID)) {
    await updateRegionsWorkflow(container).run({
      input: {
        selector: { id: region.id },
        update: {
          payment_providers: [...providerIds, KASPI_PROVIDER_ID],
        },
      },
    })
    console.log(`+ провайдер ${KASPI_PROVIDER_ID} добавлен региону Kazakhstan`)
  } else {
    console.log(`— провайдер ${KASPI_PROVIDER_ID} уже подключён к региону`)
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

  // 7. Доставка региона KZ (набор из фикстуры order-lifecycle-workflows /
  // seed-demo-order): профиль доставки, link товаров к профилю, провайдер
  // manual на складах, fulfillment-наборы с сервисной зоной kz и shipping
  // options. Способы получения покупателя: «Доставка по Астане» (shipping,
  // 2000 KZT) и «Самовывоз» с каждого склада (pickup, 0 KZT) — тип набора
  // pickup витрина показывает отдельным переключателем, а оформление мапит
  // его в delivery_method=pickup.
  const fulfillmentService = container.resolve(Modules.FULFILLMENT)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const PROVIDER_ID = "manual_manual"

  // 7a. Профиль доставки по умолчанию.
  let [shippingProfile] = await fulfillmentService.listShippingProfiles(
    { type: "default" },
    { take: 1 }
  )
  if (!shippingProfile) {
    shippingProfile = await fulfillmentService.createShippingProfiles({
      name: "Default",
      type: "default",
    })
    console.log("+ профиль доставки Default создан")
  }

  // 7b. Link товаров сида к профилю — без него completeCart не даст оформить
  // заказ. Идемпотентно: линкуем только товары без профиля.
  const { data: seededProducts } = await query.graph({
    entity: "product",
    fields: ["id", "title", "shipping_profile.id"],
    filters: { title: products.map((p) => p.title) },
  })
  for (const product of seededProducts) {
    if (product.shipping_profile?.id) {
      continue
    }
    await link.create({
      [Modules.PRODUCT]: { product_id: product.id },
      [Modules.FULFILLMENT]: { shipping_profile_id: shippingProfile.id },
    })
    console.log(`+ товар привязан к профилю доставки: ${product.title}`)
  }

  // 7c. Провайдер manual на каждом складе (нужен и доставке, и самовывозу —
  // fulfillment при сборке создаётся с этого склада).
  const { data: locationsWithProviders } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name", "fulfillment_providers.id"],
    filters: { id: warehouseIds },
  })
  for (const location of locationsWithProviders) {
    const providerIds = (
      (location.fulfillment_providers ?? []) as { id: string }[]
    ).map((p) => p.id)
    if (providerIds.includes(PROVIDER_ID)) {
      continue
    }
    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: PROVIDER_ID },
    })
    console.log(`+ провайдер ${PROVIDER_ID} подключён к складу: ${location.name}`)
  }

  // 7d. Fulfillment-наборы + shipping options. Набор → зона kz → опция;
  // набор линкуется к складу (у pickup-наборов витрина берёт адрес склада
  // из этого link'а). Идемпотентность — по имени набора и имени опции.
  const warehouses = warehouseDefs.map((def, idx) => ({
    ...def,
    id: warehouseIds[idx],
  }))
  const fulfillmentDefs: {
    setName: string
    setType: "shipping" | "pickup"
    locationId: string
    optionName: string
    optionCode: string
    amount: number
  }[] = [
    {
      setName: "Kazakhstan Delivery",
      setType: "shipping",
      locationId: warehouses[0].id,
      optionName: "Доставка по Астане",
      optionCode: "delivery",
      amount: 2000,
    },
    ...warehouses.map((w) => ({
      setName: `Pickup — ${w.name}`,
      setType: "pickup" as const,
      locationId: w.id,
      optionName: `Самовывоз: ${w.name}`,
      optionCode: "pickup",
      amount: 0,
    })),
  ]

  for (const def of fulfillmentDefs) {
    let [fulfillmentSet] = await fulfillmentService.listFulfillmentSets(
      { name: def.setName },
      { relations: ["service_zones"], take: 1 }
    )
    if (!fulfillmentSet) {
      fulfillmentSet = await fulfillmentService.createFulfillmentSets({
        name: def.setName,
        type: def.setType,
        service_zones: [
          {
            name: `${def.setName} Zone`,
            geo_zones: [{ country_code: "kz", type: "country" }],
          },
        ],
      })
      await link.create({
        [Modules.STOCK_LOCATION]: { stock_location_id: def.locationId },
        [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
      })
      console.log(`+ fulfillment-набор создан: ${def.setName} (${def.setType})`)
    } else {
      console.log(`— fulfillment-набор уже есть: ${def.setName}`)
    }

    const [existingOption] = await fulfillmentService.listShippingOptions(
      { name: def.optionName },
      { take: 1 }
    )
    if (existingOption) {
      console.log(`— способ получения уже есть: ${def.optionName}`)
      continue
    }
    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: def.optionName,
          price_type: "flat",
          provider_id: PROVIDER_ID,
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: def.setType === "pickup" ? "Pickup" : "Delivery",
            description:
              def.setType === "pickup"
                ? "Самовывоз со склада"
                : "Доставка по городу",
            code: def.optionCode,
          },
          prices: [
            { currency_code: CURRENCY, amount: def.amount },
            { region_id: region.id, amount: def.amount },
          ],
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" },
            { attribute: "is_return", value: "false", operator: "eq" },
          ],
        },
      ],
    })
    console.log(`+ способ получения создан: ${def.optionName} (${def.amount} KZT)`)
  }

  console.log("Сид региона Казахстан завершён.")
}
