import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createInventoryLevelsWorkflow,
  createProductsWorkflow,
} from "@medusajs/medusa/core-flows"
import { CatalogCategoryHandle } from "../lib/catalog/categories"
import { ensureCatalogCategories } from "../lib/catalog/ensure-catalog-categories"
import { createProductCardWorkflow } from "../workflows/create-product-card"
import { submitProductForModerationWorkflow } from "../workflows/submit-product-for-moderation"
import { approveProductCardWorkflow } from "../workflows/approve-product-card"
import { ProductSegment } from "../modules/catalog/models/product-card"

// Демо-каталог «для показа»: расширяет seed-kz реальными фото и дополнительными
// товарами ЧЕТЫРЁХ категорий (отделка, электрика, сантехника, метизы — решение
// владельца 2026-08-25/2026-09-01), чтобы витрина/мобилка выглядели как
// настоящий магазин, а заказ собирался сразу из нескольких категорий.
// Фото лежат в backend/static (отдаются НАШИМ роутом /media/:file — он ставит
// CORS-заголовки, в отличие от ядрового /static) — работают и для витрины
// (next/image разрешает localhost), и для мобилки (Image.network). Запуск:
// npx medusa exec ./src/scripts/seed-demo-showcase.ts. Идемпотентен: у уже
// существующих товаров (по названию) только проставляются фото, новые —
// создаются и проводятся через реальный флоу модерации (карточка → submit →
// approve) в published. Требует прогнанный seed-kz (регион/склады/категории).
export default async function seedDemoShowcase({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const productService = container.resolve(Modules.PRODUCT)
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL)
  const stockLocationService = container.resolve(Modules.STOCK_LOCATION)
  const fulfillmentService = container.resolve(Modules.FULFILLMENT)

  const CURRENCY = "kzt"
  // База для URL фотографий (отдаются файловым модулем из backend/static).
  const STATIC_BASE = process.env.STATIC_BASE_URL || "http://localhost:9000"
  // Через НАШ роут /media/:file, а не ядровый /static: express.static ядра
  // отдаёт файлы без CORS-заголовков, и в web-сборке buyer (origin :3000) фото
  // не грузились (см. src/api/media/[file]/route.ts).
  const img = (name: string) => `${STATIC_BASE}/media/${name}`

  // --- Предусловия из seed-kz: категории, канал продаж, склады, профиль. ---
  const categoryIds = await ensureCatalogCategories(container, (m) =>
    console.log(m)
  )
  const [salesChannel] = await salesChannelService.listSalesChannels(
    { name: "Default Sales Channel" },
    { take: 1 }
  )
  if (!salesChannel) {
    throw new Error("Default Sales Channel not found — run core seed first")
  }
  const warehouseNames = ["Склад Астана — Центр", "Склад Астана — Промзона"]
  const warehouseIds: string[] = []
  for (const name of warehouseNames) {
    const [wh] = await stockLocationService.listStockLocations(
      { name },
      { take: 1 }
    )
    if (wh) {
      warehouseIds.push(wh.id)
    }
  }
  if (!warehouseIds.length) {
    throw new Error("Склады не найдены — сначала прогоните seed-kz.ts")
  }
  const [shippingProfile] = await fulfillmentService.listShippingProfiles(
    { type: "default" },
    { take: 1 }
  )

  type SeedVariant = {
    title: string
    sku: string
    price: number // тенге, major units
    stock: number[] // остаток по складам, порядок = warehouseIds
  }
  type SeedProduct = {
    title: string
    description: string
    category: CatalogCategoryHandle
    segment: ProductSegment
    unit: string
    optionTitle: string
    // Имя файла в backend/static; null — фото пока нет (карточка рисуется без
    // картинки, клиенты это умеют).
    image: string | null
    certificates: { name: string; url: string }[]
    variants: SeedVariant[]
  }

  const products: SeedProduct[] = [
    // --- Отделочные материалы. ---
    {
      title: "Цемент ПЦ 400-Д20",
      description:
        "Портландцемент общестроительный марки М400 (ЦЕМ II) для кладочных и штукатурных растворов, стяжки и бетона. Соответствует ГОСТ 31108-2020.",
      category: "finishing",
      segment: "economy",
      unit: "мешок",
      optionTitle: "Фасовка",
      image: "img-cement.jpg",
      certificates: [{ name: "ГОСТ 31108-2020", url: "/files/cert-cement.pdf" }],
      variants: [
        { title: "Мешок 25 кг", sku: "KZ-CEM400-25", price: 3200, stock: [400, 250] },
        { title: "Мешок 50 кг", sku: "KZ-CEM400-50", price: 6000, stock: [300, 180] },
      ],
    },
    {
      title: "Гипсокартон ГКЛ 12.5 мм",
      description:
        "Гипсокартонный лист 2500×1200×12.5 мм для стен и перегородок. Стеновой (обычный) и влагостойкий (ГКЛВ) варианты. ГОСТ 32614-2012.",
      category: "finishing",
      segment: "economy",
      unit: "лист",
      optionTitle: "Тип",
      image: "img-drywall.jpg",
      certificates: [{ name: "ГОСТ 32614-2012", url: "/files/cert-gkl.pdf" }],
      variants: [
        { title: "Стеновой", sku: "KZ-GKL-125", price: 2600, stock: [800, 600] },
        { title: "Влагостойкий", sku: "KZ-GKLV-125", price: 3200, stock: [500, 350] },
      ],
    },
    {
      title: "Профиль для гипсокартона",
      description:
        "Оцинкованный профиль для каркаса под ГКЛ, длина 3 м, толщина стали 0.5 мм. ПС — стоечный, ПН — направляющий. ГОСТ Р 56594-2015.",
      category: "finishing",
      segment: "economy",
      unit: "шт",
      optionTitle: "Тип",
      image: null,
      certificates: [
        { name: "ГОСТ Р 56594-2015", url: "/files/cert-profile.pdf" },
      ],
      variants: [
        { title: "ПС 60×27, 3 м", sku: "KZ-PROF-PS-6027", price: 1100, stock: [900, 600] },
        { title: "ПН 28×27, 3 м", sku: "KZ-PROF-PN-2827", price: 700, stock: [1100, 700] },
      ],
    },
    {
      title: "Штукатурка гипсовая",
      description:
        "Гипсовая штукатурка для выравнивания стен и потолков внутри помещений, слой 5–50 мм. Расход ~8.5 кг/м² при слое 10 мм.",
      category: "finishing",
      segment: "comfort",
      unit: "мешок",
      optionTitle: "Фасовка",
      image: null,
      certificates: [{ name: "ГОСТ 31377-2008", url: "/files/cert-plaster.pdf" }],
      variants: [
        { title: "Мешок 30 кг", sku: "KZ-PLASTER-30", price: 3900, stock: [500, 350] },
      ],
    },
    {
      title: "Грунтовка глубокого проникновения",
      description:
        "Акриловая грунтовка для укрепления оснований перед штукатуркой, шпаклёвкой и укладкой плитки. Расход 100–200 мл/м².",
      category: "finishing",
      segment: "economy",
      unit: "канистра",
      optionTitle: "Объём",
      image: null,
      certificates: [{ name: "ГОСТ 28196-89", url: "/files/cert-primer.pdf" }],
      variants: [
        { title: "10 л", sku: "KZ-PRIMER-10", price: 4200, stock: [300, 200] },
        { title: "5 л", sku: "KZ-PRIMER-5", price: 2400, stock: [400, 250] },
      ],
    },
    {
      title: "Краска водно-дисперсионная интерьерная",
      description:
        "Матовая краска для стен и потолков внутри помещений, без запаха. Укрывистость за два слоя, расход ~130 г/м².",
      category: "finishing",
      segment: "comfort",
      unit: "ведро",
      optionTitle: "Фасовка",
      image: null,
      certificates: [{ name: "ГОСТ 28196-89", url: "/files/cert-paint.pdf" }],
      variants: [
        { title: "14 кг", sku: "KZ-PAINT-14", price: 12500, stock: [200, 140] },
        { title: "7 кг", sku: "KZ-PAINT-7", price: 6900, stock: [260, 180] },
      ],
    },
    {
      title: "Плитка керамическая напольная",
      description:
        "Керамогранитная плитка для пола 600×600 мм, износостойкость PEI IV. Для жилых и коммерческих помещений. Цена за м².",
      category: "finishing",
      segment: "comfort",
      unit: "м²",
      optionTitle: "Формат",
      image: "img-tile.jpg",
      certificates: [{ name: "ГОСТ 6787-2001", url: "/files/cert-tile.pdf" }],
      variants: [
        { title: "600×600 мм", sku: "KZ-TILE-600", price: 4500, stock: [900, 700] },
        { title: "300×300 мм", sku: "KZ-TILE-300", price: 3200, stock: [1100, 800] },
      ],
    },
    {
      title: "Пескобетон М300 40 кг",
      description:
        "Сухая цементно-песчаная смесь М300 для стяжки пола и кладки. Мешок 40 кг. Расход ~20 кг/м² при слое 10 мм.",
      category: "finishing",
      segment: "economy",
      unit: "мешок",
      optionTitle: "Фасовка",
      image: "img-drymix.jpg",
      certificates: [{ name: "ГОСТ 28013-98", url: "/files/cert-drymix.pdf" }],
      variants: [
        { title: "Мешок 40 кг", sku: "KZ-DRYMIX-M300-40", price: 1500, stock: [600, 450] },
      ],
    },

    // --- Электрика. ---
    {
      title: "Автоматический выключатель C16",
      description:
        "Однополюсный модульный автомат на DIN-рейку, характеристика C, отключающая способность 4.5 кА. Для групп освещения и розеток.",
      category: "electrical",
      segment: "comfort",
      unit: "шт",
      optionTitle: "Номинал",
      image: null,
      certificates: [
        { name: "ГОСТ IEC 60898-1-2020", url: "/files/cert-breaker.pdf" },
      ],
      variants: [
        { title: "C16 1P", sku: "KZ-BRK-C16", price: 1800, stock: [400, 260] },
        { title: "C25 1P", sku: "KZ-BRK-C25", price: 1950, stock: [320, 200] },
      ],
    },
    {
      title: "Розетка скрытой установки с заземлением",
      description:
        "Розетка 16 А, 250 В со шторками и заземляющим контактом, для монтажа в подрозетник. Корпус из самозатухающего пластика.",
      category: "electrical",
      segment: "economy",
      unit: "шт",
      optionTitle: "Исполнение",
      image: null,
      certificates: [{ name: "ГОСТ 7396.1-89", url: "/files/cert-socket.pdf" }],
      variants: [
        { title: "Одинарная", sku: "KZ-SOCKET-1", price: 1400, stock: [600, 380] },
        { title: "Двойная", sku: "KZ-SOCKET-2", price: 2200, stock: [420, 280] },
      ],
    },
    {
      title: "Гофра ПВХ с зондом",
      description:
        "Гибкая гофрированная труба ПВХ для скрытой прокладки кабеля с протяжкой внутри. Не поддерживает горение.",
      category: "electrical",
      segment: "economy",
      unit: "м",
      optionTitle: "Диаметр",
      image: null,
      certificates: [{ name: "ГОСТ Р 50827-95", url: "/files/cert-conduit.pdf" }],
      variants: [
        { title: "D20 мм", sku: "KZ-CONDUIT-20", price: 120, stock: [3000, 2000] },
        { title: "D25 мм", sku: "KZ-CONDUIT-25", price: 160, stock: [2200, 1500] },
      ],
    },
    {
      title: "Подрозетник для бетона D68",
      description:
        "Установочная коробка для монтажа розеток и выключателей в бетон и кирпич, глубина 45 мм, с распорными лапками.",
      category: "electrical",
      segment: "economy",
      unit: "шт",
      optionTitle: "Глубина",
      image: null,
      certificates: [{ name: "ГОСТ Р 50827-95", url: "/files/cert-box.pdf" }],
      variants: [
        { title: "45 мм", sku: "KZ-BOX-D68", price: 190, stock: [1500, 900] },
      ],
    },

    // --- Сантехника. ---
    {
      title: "Фитинг полипропиленовый",
      description:
        "Соединительная деталь для труб PN20 под пайку: муфта и угол 90°. Рабочая температура до 95 °C.",
      category: "plumbing",
      segment: "economy",
      unit: "шт",
      optionTitle: "Тип",
      image: null,
      certificates: [{ name: "ГОСТ 32415-2013", url: "/files/cert-fitting.pdf" }],
      variants: [
        { title: "Муфта D25", sku: "KZ-FIT-M25", price: 180, stock: [1200, 800] },
        { title: "Угол 90° D25", sku: "KZ-FIT-A25", price: 210, stock: [1000, 700] },
      ],
    },
    {
      title: "Кран шаровой",
      description:
        "Латунный шаровой кран с рукояткой-бабочкой для воды и отопления, рабочее давление 16 бар, полнопроходной.",
      category: "plumbing",
      segment: "comfort",
      unit: "шт",
      optionTitle: "Размер",
      image: null,
      certificates: [{ name: "ГОСТ 21345-2005", url: "/files/cert-valve.pdf" }],
      variants: [
        { title: "1/2 дюйма", sku: "KZ-VALVE-12", price: 2600, stock: [400, 260] },
        { title: "3/4 дюйма", sku: "KZ-VALVE-34", price: 3400, stock: [300, 200] },
      ],
    },
    {
      title: "Смеситель для кухни",
      description:
        "Однорычажный смеситель с высоким изливом и керамическим картриджем 35 мм, гибкая подводка в комплекте.",
      category: "plumbing",
      segment: "business",
      unit: "шт",
      optionTitle: "Излив",
      image: null,
      certificates: [{ name: "ГОСТ 25809-96", url: "/files/cert-mixer.pdf" }],
      variants: [
        { title: "Высокий поворотный", sku: "KZ-MIXER-K1", price: 18900, stock: [120, 80] },
      ],
    },
    {
      title: "Сифон для мойки",
      description:
        "Бутылочный сифон для кухонной мойки с отводом на стиральную машину и выпуском 40 мм.",
      category: "plumbing",
      segment: "economy",
      unit: "шт",
      optionTitle: "Тип",
      image: null,
      certificates: [{ name: "ГОСТ 23289-2016", url: "/files/cert-siphon.pdf" }],
      variants: [
        { title: "Бутылочный", sku: "KZ-SIPHON-B", price: 2900, stock: [260, 180] },
      ],
    },

    // --- Крепёж (метизы). ---
    {
      title: "Дюбель-гвоздь",
      description:
        "Нейлоновый дюбель с ударным шурупом для быстрого монтажа профиля, кабель-каналов и реек в бетон и кирпич. Упаковка 100 шт.",
      category: "fasteners",
      segment: "economy",
      unit: "упаковка 100 шт",
      optionTitle: "Размер",
      image: null,
      certificates: [{ name: "DIN 1481", url: "/files/cert-dowel.pdf" }],
      variants: [
        { title: "6×40 мм", sku: "KZ-DOWEL-6X40", price: 1100, stock: [500, 320] },
        { title: "6×60 мм", sku: "KZ-DOWEL-6X60", price: 1500, stock: [380, 240] },
      ],
    },
    {
      title: "Анкер клиновой",
      description:
        "Стальной оцинкованный анкер для тяжёлых креплений в бетон: подвесы, кронштейны, оборудование.",
      category: "fasteners",
      segment: "comfort",
      unit: "шт",
      optionTitle: "Размер",
      image: null,
      certificates: [{ name: "ГОСТ 28778-90", url: "/files/cert-anchor.pdf" }],
      variants: [
        { title: "8×75 мм", sku: "KZ-ANCHOR-8X75", price: 190, stock: [900, 600] },
        { title: "10×90 мм", sku: "KZ-ANCHOR-10X90", price: 280, stock: [700, 450] },
      ],
    },
    {
      title: "Гвозди строительные",
      description:
        "Гвозди с плоской головкой для опалубки, обрешётки и черновых работ. Цена за килограмм.",
      category: "fasteners",
      segment: "economy",
      unit: "кг",
      optionTitle: "Размер",
      image: null,
      certificates: [{ name: "ГОСТ 4028-63", url: "/files/cert-nail.pdf" }],
      variants: [
        { title: "3.0×80 мм", sku: "KZ-NAIL-3X80", price: 750, stock: [600, 400] },
        { title: "4.0×100 мм", sku: "KZ-NAIL-4X100", price: 780, stock: [500, 330] },
      ],
    },
  ]

  for (const def of products) {
    const [existing] = await productService.listProducts(
      { title: def.title },
      { take: 1 }
    )

    // Уже существует (из seed-kz или прошлого прогона) — проставим категорию
    // и фото, идемпотентно.
    if (existing) {
      await productService.updateProducts(existing.id, {
        category_ids: [categoryIds[def.category]],
        ...(def.image
          ? { thumbnail: img(def.image), images: [{ url: img(def.image) }] }
          : {}),
      })
      console.log(`~ обновлён: ${def.title} → ${def.category}`)
      continue
    }

    // Новый товар: создаём черновиком с фото, ценами и привязкой к каналу.
    const { result: createdProducts } = await createProductsWorkflow(
      container
    ).run({
      input: {
        products: [
          {
            title: def.title,
            description: def.description,
            status: ProductStatus.DRAFT,
            category_ids: [categoryIds[def.category]],
            sales_channels: [{ id: salesChannel.id }],
            ...(def.image
              ? { thumbnail: img(def.image), images: [{ url: img(def.image) }] }
              : {}),
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

    // Остатки по складам.
    const { data: withInventory } = await query.graph({
      entity: "product",
      fields: ["variants.sku", "variants.inventory_items.inventory.id"],
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

    // Привязка к профилю доставки (нужна для оформления заказа).
    if (shippingProfile) {
      await link.create({
        [Modules.PRODUCT]: { product_id: product.id },
        [Modules.FULFILLMENT]: { shipping_profile_id: shippingProfile.id },
      })
    }

    // Карточка каталога → отправка на модерацию → одобрение (published).
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

    console.log(
      `+ товар создан и опубликован: ${def.title} (${def.category}, ${def.segment})`
    )
  }

  console.log("Демо-каталог для показа готов.")
}
