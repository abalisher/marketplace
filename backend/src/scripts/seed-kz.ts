import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createInventoryLevelsWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateRegionsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"
import { PAYMENT_PROVIDER_IDS } from "../lib/payments/providers"
import { DOCUMENTS_MODULE } from "../modules/documents"
import DocumentsModuleService from "../modules/documents/service"
import { CatalogCategoryHandle } from "../lib/catalog/categories"
import { ensureCatalogCategories } from "../lib/catalog/ensure-catalog-categories"
import { createProductCardWorkflow } from "../workflows/create-product-card"
import { submitProductForModerationWorkflow } from "../workflows/submit-product-for-moderation"
import { approveProductCardWorkflow } from "../workflows/approve-product-card"
import { ProductSegment } from "../modules/catalog/models/product-card"

// Сид региона Казахстан для витрины: валюта KZT, регион с страной kz, склады
// в Астане (город = stock_location.address.city), четыре категории каталога и
// по одному стартовому товару в каждой (отделка, электрика, сантехника, метизы)
// с ценами в тенге и остатками по складам (через реальный флоу → published),
// доставка региона: fulfillment-набор «Доставка по Астане» (shipping) —
// единственный способ получения после пивота 2026-07-22 (самовывоз снят).
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
  const STORE_NAME = "СтройМаркет"

  // 1. Валюта KZT в списке поддерживаемых валют магазина И валюта по умолчанию.
  //
  // Дефолт раньше не трогали («регион сам задаёт валюту витрины») — и в панели
  // продавца висел EUR: «Настройки → Магазин: валюта по умолчанию EUR Euro», в
  // одном списке заказов «₸ 242 000,00 KZT» рядом с «€ 210,00 EUR». Ф-прогон
  // T4.6: управляющий и закупщик прямо сказали, что таким цифрам не верят
  // (T4.8). Магазин в Астане — валюта по умолчанию тенге.
  // supported_currencies — relation, тянем через query.graph (listStores её не
  // отдаёт → потерялся бы is_default).
  const { data: stores } = await query.graph({
    entity: "store",
    fields: [
      "id",
      "name",
      "supported_currencies.currency_code",
      "supported_currencies.is_default",
    ],
  })
  const store = stores[0]
  if (!store) {
    throw new Error("Store not found — run core migrations/seed first")
  }

  // Название магазина видно в панели продавца на каждой странице (левый верхний
  // угол оболочки), поэтому ядровое «Default Store» — не прод-вид.
  if (store.name !== STORE_NAME) {
    await updateStoresWorkflow(container).run({
      input: { selector: { id: store.id }, update: { name: STORE_NAME } },
    })
    console.log(`+ магазин переименован в «${STORE_NAME}»`)
  }
  const currencies = (store.supported_currencies ?? []) as {
    currency_code: string
    is_default: boolean
  }[]
  const kztIsDefault = currencies.some(
    (c) => c.currency_code === CURRENCY && c.is_default
  )
  if (!kztIsDefault) {
    // Пересобираем список: KZT — по умолчанию, прочие валюты остаются
    // поддерживаемыми (в них лежат старые демо-заказы; их чистка — T7.2).
    const rest = currencies.filter((c) => c.currency_code !== CURRENCY)
    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: store.id },
        update: {
          supported_currencies: [
            { currency_code: CURRENCY, is_default: true },
            ...rest.map((c) => ({
              currency_code: c.currency_code,
              is_default: false,
            })),
          ],
        },
      },
    })
    console.log(`+ валюта по умолчанию — ${CURRENCY.toUpperCase()}`)
  } else {
    console.log(`— валюта по умолчанию уже ${CURRENCY.toUpperCase()}`)
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
  // Вместе с Kaspi — оплата «вне банка» (перевод на номер Kaspi, в долг):
  // какие из способов принимает продавец, решают его настройки оплаты.
  const missingProviders = PAYMENT_PROVIDER_IDS.filter(
    (id) => !providerIds.includes(id)
  )
  if (missingProviders.length) {
    await updateRegionsWorkflow(container).run({
      input: {
        selector: { id: region.id },
        update: {
          payment_providers: [...providerIds, ...missingProviders],
        },
      },
    })
    console.log(
      `+ провайдеры ${missingProviders.join(", ")} добавлены региону Kazakhstan`
    )
  } else {
    console.log(`— платёжные провайдеры уже подключены к региону`)
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

  // 5. Четыре категории каталога (T10.10): отделка, электрика, сантехника,
  // метизы. У товара ровно одна — по ней ассистент группирует подбор, панель
  // фильтрует список, заказ распадается на задания сборки.
  const categoryIds = await ensureCatalogCategories(container, (m) =>
    console.log(m)
  )

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
    category: CatalogCategoryHandle
    segment: ProductSegment
    unit: string
    optionTitle: string
    certificates: { name: string; url: string }[]
    variants: SeedVariant[]
  }

  const products: SeedProduct[] = [
    {
      title: "Цемент ПЦ 400-Д20",
      category: "finishing",
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
      title: "Кабель ВВГнг-LS",
      category: "electrical",
      segment: "comfort",
      unit: "м",
      optionTitle: "Сечение",
      certificates: [{ name: "ГОСТ 31996-2012", url: "/files/cert-cable.pdf" }],
      variants: [
        { title: "3×1.5 мм²", sku: "KZ-CABLE-3X15", price: 400, stock: [4000, 2500] },
        { title: "3×2.5 мм²", sku: "KZ-CABLE-3X25", price: 620, stock: [3500, 2000] },
      ],
    },
    {
      title: "Труба полипропиленовая PN20",
      category: "plumbing",
      segment: "economy",
      unit: "м",
      optionTitle: "Диаметр",
      certificates: [{ name: "ГОСТ 32415-2013", url: "/files/cert-pipe.pdf" }],
      variants: [
        { title: "D20 мм", sku: "KZ-PPR-D20", price: 380, stock: [2000, 1200] },
        { title: "D25 мм", sku: "KZ-PPR-D25", price: 480, stock: [1800, 1000] },
      ],
    },
    {
      title: "Саморез по гипсокартону",
      category: "fasteners",
      segment: "economy",
      unit: "упаковка 1000 шт",
      optionTitle: "Размер",
      certificates: [{ name: "DIN 18182", url: "/files/cert-screw.pdf" }],
      variants: [
        { title: "3.5×25 мм", sku: "KZ-SCREW-35X25", price: 2300, stock: [300, 200] },
        { title: "3.5×35 мм", sku: "KZ-SCREW-35X35", price: 2900, stock: [250, 150] },
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
            category_ids: [categoryIds[def.category]],
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
  // manual на складах, fulfillment-набор с сервисной зоной kz и shipping
  // option. После пивота 2026-07-22 единственный способ получения — доставка
  // («Доставка по Астане», 2000 KZT); самовывоз (pickup) снят.
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

  // 7d. Fulfillment-набор + shipping option. Набор → зона kz → опция; набор
  // линкуется к складу. Идемпотентность — по имени набора и имени опции.
  const warehouses = warehouseDefs.map((def, idx) => ({
    ...def,
    id: warehouseIds[idx],
  }))
  const fulfillmentDefs: {
    setName: string
    setType: "shipping"
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
            label: "Delivery",
            description: "Доставка по городу",
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

  // 6. Реквизиты продавца для документов (T4.9). Решение владельца 2026-08-11:
  // MVP делаем на МОК-реквизитах — реальные БИН/адрес/банк подставляются
  // заменой значений в «Настройки → Реквизиты документов», код не меняется.
  // Без заполненных реквизитов документы вообще не выпускаются (см.
  // modules/documents/requisites.ts), поэтому стенд без них нерабочий.
  // Идемпотентность: заполняем только пустые поля и ядровую заглушку
  // «Marketplace» — правки владельца в панели не затираем.
  const documentsService =
    container.resolve<DocumentsModuleService>(DOCUMENTS_MODULE)
  const settings = await documentsService.getOrCreateSettings()
  const mockRequisites: Record<string, string> = {
    seller_name: 'ТОО «СтройМаркет»',
    seller_bin: "180540021764",
    seller_address: "г. Астана, ул. Кабанбай батыра, 53, офис 12",
    seller_phone: "+7 7172 55-11-22",
    seller_email: "docs@stroymarket.kz",
    seller_bank_name: 'АО «Kaspi Bank»',
    seller_bank_bik: "CASPKZKA",
    seller_iban: "KZ12 3456 7890 1234 5678",
    seller_kbe: "17",
    seller_knp: "710",
    director_name: "Ержан Смагулов",
    footer_note:
      "Демонстрационные реквизиты. Документ сформирован платформой СтройМаркет " +
      "и не является официальной ЭСФ.",
  }
  const patch: Record<string, string> = {}
  for (const [key, value] of Object.entries(mockRequisites)) {
    const current = (settings as unknown as Record<string, string | null>)[key]
    const isPlaceholder = key === "seller_name" && current === "Marketplace"
    if (!current || `${current}`.trim() === "" || isPlaceholder) {
      patch[key] = value
    }
  }
  if (Object.keys(patch).length) {
    await documentsService.updateDocumentSettings({ id: settings.id, ...patch })
    console.log(
      `+ реквизиты документов заполнены (демо): ${Object.keys(patch).join(", ")}`
    )
  } else {
    console.log("— реквизиты документов уже заполнены")
  }

  console.log("Сид региона Казахстан завершён.")
}
