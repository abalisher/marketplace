// Строки экрана «Цены и остатки» (T10.14) и правила правки. Роут — тонкий:
// выборка из ядра там, вся сборка строк и вся проверка правок здесь (та же
// раскладка, что у shipping-queue/rows.ts) — иначе правила не покрыть unit-тестами.
//
// Решение развилки №9 — вариант (а): источник правды по цене и остатку остаётся
// ЯДРО (вариант → price set → цена; inventory item → level → остаток). Своей
// таблицы не заводим, экран лишь прячет цепочку: продавец видит товар, цену и
// остаток, а не «price set» и «inventory level».

import { CATALOG_CATEGORY_HANDLES } from "../../../lib/catalog/categories"
import {
  ONEC_PRODUCT_SOURCE,
  OnecManagedField,
  brandOf,
  onecFieldsOf,
  roundQuantity,
} from "../../../lib/onec/plan"
import { actorLabel } from "../actor-label"

// Единственный рынок — тенге; цены в каталоге целые (см. seed-kz).
export const PRICE_STOCK_CURRENCY = "kzt"

// Сколько позиций правим одним запросом. Правка в строке — партия из одной;
// массовая правка выделенных упирается в этот потолок. Считаем его по импорту
// (T10.14c): файл применяется ЦЕЛИКОМ, иначе «либо всё, либо ничего» распалось
// бы на десяток партий. Страница экрана (50 строк) проходит в любом случае.
export const PRICE_STOCK_MAX_CHANGES = 500

// Фильтр остатка для чипов экрана.
export const PRICE_STOCK_FILTERS = ["zero", "low"] as const
export type PriceStockFilter = (typeof PRICE_STOCK_FILTERS)[number]

// Чип-мешок «вне ассортимента»: позиции, чья категория не входит в четвёрку
// (lib/catalog/categories.ts) — снятый с продажи общестрой, живой остаток
// стартового сида, товар, которому категорию ещё не назначили.
//
// ЗАЧЕМ. Ассортимент магазина — ровно четыре категории, и погашенные категории
// в чипы не идут (их незачем показывать как отдел). Но цена и остаток у таких
// позиций живые, и с экрана они не исчезают — иначе тринадцать черновиков
// пропали бы вместе со своими числами. Без этого чипа они висели в таблице, и
// отфильтровать их было нечем (Ф-прогон Данияра 2026-09-02, косметика №1).
export const PRICE_STOCK_OTHER_CATEGORY = "other"

// Позиция из ассортимента — та, чья категория входит в четвёрку. Погашенная
// категория и её отсутствие — одинаково «вне ассортимента»: продавцу важно
// «этого нет в отделах», а не чем именно позиция была раньше.
export const isAssortmentCategory = (handle: string | null): boolean =>
  !!handle && (CATALOG_CATEGORY_HANDLES as string[]).includes(handle)

// --- Сырые строки ядра (то, что отдаёт query.graph) ---

export type RawPrice = {
  id?: string
  amount?: number
  currency_code?: string
  rules_count?: number
}

export type RawLevel = {
  id?: string
  location_id?: string
  stocked_quantity?: number
  reserved_quantity?: number
}

export type RawVariant = {
  id: string
  title?: string | null
  sku?: string | null
  manage_inventory?: boolean
  // Себестоимость единицы из 1С (подставляет load.ts из onec_item).
  cost?: number | null
  prices?: RawPrice[]
  inventory_items?: {
    inventory?: { id?: string; location_levels?: RawLevel[] } | null
  }[]
}

export type RawProduct = {
  id: string
  title: string
  status?: string
  thumbnail?: string | null
  product_card?: { unit?: string | null } | null
  categories?: { handle?: string | null; name?: string | null }[]
  metadata?: Record<string, unknown> | null
  variants?: RawVariant[]
}

// --- DTO экрана ---

export type PriceStockRow = {
  variant_id: string
  product_id: string
  // Название товара и вариант отдельно: экран группирует строки по товару, а
  // подпись строки собирает сам (у односортных товаров вариант не показывается).
  title: string
  variant_title: string | null
  sku: string | null
  // Бренд товара (product.metadata.brand — из 1С или Excel компании); null —
  // не указан. Одинаковые товары разных брендов продавец различает по нему.
  brand: string | null
  unit: string | null
  status: string | null
  category_handle: string | null
  category_name: string | null
  price: number | null
  // Себестоимость единицы (учётная цена из 1С компании); null — неизвестна.
  // Только для чтения и только в панели.
  cost: number | null
  currency_code: string
  // Остаток: сколько лежит, сколько зарезервировано под заказы, сколько
  // свободно. Свободный остаток (T11.2) обязан показывать ту же цифру.
  // Числа СРЕЗА: если экран смотрит один склад (location_id в запросе) — это
  // остаток того склада, иначе сумма по всем. stocked_total — всегда сумма:
  // «40 из 67 на этом складе» видно без второго запроса.
  stocked: number
  reserved: number
  available: number
  stocked_total: number
  // Куда пишется правка остатка. Склад один — правим молча; складов у позиции
  // несколько — экран обязан спросить какой (locations_count > 1).
  location_id: string | null
  location_name: string | null
  locations_count: number
  // Остаток не ведётся (manage_inventory = false) или цена задана правилами —
  // такую строку экран показывает, но править её здесь нельзя.
  stock_editable: boolean
  price_editable: boolean
  // Товар из 1С компании (lib/onec) — её собственный каталог; "file" — тот же
  // каталог, но пришедший Excel-файлом.
  managed_by: "onec" | "file" | null
  // Что из цены и остатка ведёт 1С: эти клетки только для чтения (правка
  // перезаписалась бы следующей синхронизацией). Чего 1С не присылает, то
  // задаёт продавец.
  onec_fields: OnecManagedField[]
}

// Товар заведён синхронизацией с 1С компании.
export const isOnecManaged = (product: RawProduct): boolean =>
  product.metadata?.source === ONEC_PRODUCT_SOURCE

export type PriceStockHistoryRow = {
  id: string
  variant_id: string
  product_title: string
  variant_title: string | null
  sku: string | null
  currency_code: string | null
  old_price: number | null
  new_price: number | null
  old_stock: number | null
  new_stock: number | null
  // Склад правки остатка: цена в магазине одна, а остаток — у каждого склада
  // свой, и «остаток 373 → 370» при двух складах не отвечает «где» (Ф-прогон
  // Данияра 2026-09-02, «мешает» №2). У правки цены склада нет.
  location_id: string | null
  location_name: string | null
  changed_by_name: string | null
  source: string
  created_at: string
}

// Цена варианта в рабочей валюте. Цена, заданная правилами (регион, канал
// продаж, количество), — не наша: ядро принимает список цен варианта целиком,
// поэтому правка снесла бы правила. Такую строку экран показывает, но не правит
// (price_editable = false) — цены по правилам живут в карточке товара.
//
// carry_prices — цены в ДРУГИХ валютах: их надо пронести через правку без
// изменений, иначе ядро сочтёт их удалёнными.
export const variantPrice = (
  variant: RawVariant,
  currency = PRICE_STOCK_CURRENCY
): {
  amount: number | null
  editable: boolean
  carry_prices: { amount: number; currency_code: string }[]
} => {
  const prices = variant.prices ?? []
  const hasRules = prices.some((price) => Number(price.rules_count ?? 0) > 0)
  const matching = prices.filter((price) => price.currency_code === currency)
  const carry = prices
    .filter(
      (price) =>
        price.currency_code !== currency &&
        !!price.currency_code &&
        price.amount != null
    )
    .map((price) => ({
      amount: Number(price.amount),
      currency_code: String(price.currency_code),
    }))

  const amount =
    matching.length && matching[0].amount != null
      ? Number(matching[0].amount)
      : null
  return {
    // Цены нет вовсе — её можно назначить: продавец за этим и пришёл.
    // Две цены в одной валюте — тоже не наш случай: какую из них правим,
    // знает только тот, кто их завёл.
    amount,
    editable: !hasRules && matching.length <= 1,
    carry_prices: carry,
  }
}

// Все уровни остатка варианта по всем складам.
export const variantLevels = (variant: RawVariant): RawLevel[] =>
  (variant.inventory_items ?? []).flatMap(
    (item) => item.inventory?.location_levels ?? []
  )

// Складская позиция ядра, к которой привязан остаток варианта. Их у варианта
// может быть несколько (комплект) — тогда остатком по строке не управляем:
// какая из позиций «остаток товара», знает только продавец.
export const variantInventoryItemIds = (variant: RawVariant): string[] => [
  ...new Set(
    (variant.inventory_items ?? [])
      .map((item) => item.inventory?.id)
      .filter((id): id is string => !!id)
  ),
]

// scopeLocationId — склад, который смотрит экран. У магазина складов может быть
// несколько (ядро допускает до пяти на город), и тогда «остаток» в одной клетке
// двусмыслен: экран выбирает склад сверху, а строка показывает и правит его.
// Без выбора строка показывает сумму по складам, и правка остатка требует
// назвать склад — молча писать в один из двух нельзя.
//
// visibleLocationIds — склады, которые строке вообще разрешено видеть
// (продавец компании — только склады своего канала); без списка — все склады.
export const buildPriceStockRow = (
  product: RawProduct,
  variant: RawVariant,
  scopeLocationId?: string | null,
  visibleLocationIds?: string[]
): PriceStockRow => {
  const price = variantPrice(variant)
  const allLevels = variantLevels(variant).filter(
    (level) =>
      !visibleLocationIds ||
      (!!level.location_id && visibleLocationIds.includes(level.location_id))
  )
  const locations = [
    ...new Set(
      allLevels
        .map((level) => level.location_id)
        .filter((id): id is string => !!id)
    ),
  ]
  const levels = scopeLocationId
    ? allLevels.filter((level) => level.location_id === scopeLocationId)
    : allLevels
  const stocked = levels.reduce(
    (sum, level) => sum + Number(level.stocked_quantity ?? 0),
    0
  )
  const reserved = levels.reduce(
    (sum, level) => sum + Number(level.reserved_quantity ?? 0),
    0
  )
  const stockedTotal = allLevels.reduce(
    (sum, level) => sum + Number(level.stocked_quantity ?? 0),
    0
  )
  const category = product.categories?.[0]
  const onec = isOnecManaged(product)
  const onecFields = onecFieldsOf(product.metadata)

  return {
    variant_id: variant.id,
    product_id: product.id,
    title: product.title,
    variant_title: variant.title ?? null,
    sku: variant.sku ?? null,
    brand: brandOf(product.metadata),
    unit: product.product_card?.unit ?? null,
    status: product.status ?? null,
    category_handle: category?.handle ?? null,
    category_name: category?.name ?? null,
    price: price.amount,
    cost: variant.cost ?? null,
    currency_code: PRICE_STOCK_CURRENCY,
    // Остатки бывают дробными (м³, т из 1С) — до тысячных, без хвостов
    // плавающей точки.
    stocked: roundQuantity(stocked),
    reserved: roundQuantity(reserved),
    available: roundQuantity(stocked - reserved),
    stocked_total: roundQuantity(stockedTotal),
    location_id:
      scopeLocationId ?? (locations.length === 1 ? locations[0] : null),
    location_name: null,
    locations_count: locations.length,
    stock_editable:
      !onecFields.includes("stock") &&
      variant.manage_inventory !== false &&
      variantInventoryItemIds(variant).length === 1,
    price_editable: !onecFields.includes("price") && price.editable,
    managed_by: onec
      ? product.metadata?.onec_feed === "file"
        ? "file"
        : "onec"
      : null,
    onec_fields: onecFields,
  }
}

// Подпись позиции: у односортного товара — его название, у многосортного —
// «товар — вариант». Одно правило на всю панель: так позиция называется в
// таблице, в выгрузке, в отказе партии, в журнале и на плитке дашборда.
export const priceStockRowTitle = (row: {
  title: string
  variant_title: string | null
}): string =>
  row.variant_title && row.variant_title !== row.title
    ? `${row.title} — ${row.variant_title}`
    : row.title

// Все покупаемые строки страницы: товар с несколькими вариантами даёт несколько
// строк (цена и остаток живут на варианте, а не на товаре).
export const buildPriceStockRows = (
  products: RawProduct[],
  scopeLocationId?: string | null,
  visibleLocationIds?: string[]
): PriceStockRow[] =>
  products.flatMap((product) =>
    (product.variants ?? []).map((variant) =>
      buildPriceStockRow(product, variant, scopeLocationId, visibleLocationIds)
    )
  )

// Названия складов подставляем после сборки строк: имя живёт в stock_location
// ядра, а не в выборке товаров. Технический id остаётся в строке для правки, но
// на экране продавец видит название.
export const withLocationNames = (
  rows: PriceStockRow[],
  names: Map<string, string>
): PriceStockRow[] =>
  rows.map((row) => ({
    ...row,
    location_name: row.location_id ? names.get(row.location_id) ?? null : null,
  }))

// Сводка для чипов экрана: сколько позиций всего, сколько без остатка и сколько
// на исходе. Считается по ВСЕМУ срезу (поиск + категория), а не по странице.
export const countStock = (
  rows: PriceStockRow[],
  lowThreshold: number
): { total: number; zero: number; low: number } => ({
  total: rows.length,
  zero: rows.filter((row) => row.available <= 0).length,
  low: rows.filter((row) => row.available <= lowThreshold).length,
})

// Счётчики чипов категорий: сколько позиций в каждом отделе и сколько вне
// ассортимента. Считаются по срезу БЕЗ фильтра категории и без чипа остатка —
// чип показывает, что будет, если по нему нажать (так же считаются «нет в
// наличии» и «на исходе»: по срезу до своего фильтра).
export const countByCategory = (
  rows: PriceStockRow[]
): Record<string, number> => {
  const counts: Record<string, number> = {}
  for (const handle of CATALOG_CATEGORY_HANDLES) {
    counts[handle] = 0
  }
  counts[PRICE_STOCK_OTHER_CATEGORY] = 0
  for (const row of rows) {
    const key = isAssortmentCategory(row.category_handle)
      ? (row.category_handle as string)
      : PRICE_STOCK_OTHER_CATEGORY
    counts[key] = (counts[key] ?? 0) + 1
  }
  return counts
}

// Фильтр категории применяем ПОСЛЕ сборки строк, а не выборкой ядра: чип «вне
// ассортимента» — это «категория не из четвёрки ИЛИ её нет вовсе», и такого
// фильтра у ядра нет. Заодно счётчики чипов считаются по одному и тому же
// срезу, что и сами строки.
export const filterByCategory = (
  rows: PriceStockRow[],
  category: string | undefined
): PriceStockRow[] => {
  if (!category) {
    return rows
  }
  if (category === PRICE_STOCK_OTHER_CATEGORY) {
    return rows.filter((row) => !isAssortmentCategory(row.category_handle))
  }
  return rows.filter((row) => row.category_handle === category)
}

// Фильтр остатка применяем ПОСЛЕ сборки строк: «мало» и «нет» считаются от
// свободного остатка, а его ядро фильтром не отдаёт (сумма по складам минус
// резервы).
export const filterByStock = (
  rows: PriceStockRow[],
  filter: PriceStockFilter | undefined,
  lowThreshold: number
): PriceStockRow[] => {
  if (!filter) {
    return rows
  }
  return rows.filter((row) =>
    filter === "zero" ? row.available <= 0 : row.available <= lowThreshold
  )
}

// --- Правка ---

export type PriceStockChange = {
  variant_id: string
  price?: number
  stock?: number
  location_id?: string
}

// Что именно пишем по одной позиции. old_* — снимок до правки: он же уходит
// в журнал «было → стало».
export type ResolvedChange = {
  variant_id: string
  product_id: string
  product_title: string
  variant_title: string | null
  sku: string | null
  currency_code: string
  old_price: number | null
  new_price: number | null
  // Цены в других валютах — проносим через правку (см. variantPrice).
  carry_prices: { amount: number; currency_code: string }[]
  // Остаток: склад, складская позиция ядра и абсолютные значения.
  location_id: string | null
  inventory_item_id: string | null
  old_stock: number | null
  new_stock: number | null
}

export const PRICE_STOCK_ISSUES = [
  // Варианта нет в каталоге (удалён, пока экран был открыт).
  "unknown_variant",
  // В правке нет ни цены, ни остатка.
  "empty_change",
  // Цена задана правилами (регион/канал) — правится в карточке товара.
  "price_rules",
  // Остаток по позиции не ведётся или складских позиций несколько.
  "stock_not_managed",
  // Позиция лежит на нескольких складах — правка обязана назвать склад.
  "location_required",
  // Названный склад для этой позиции не заведён.
  "unknown_location",
  // Позиция названа в партии дважды: обе правки считались бы от одного снимка,
  // и остаток сложился бы дважды (40 → 50 и 40 → 60 дали бы 70).
  "duplicate_change",
  // Цена общая для всей площадки — продавец компании её не меняет (правит
  // владелец площадки); продавцу доступны только остатки своих складов.
  "price_locked",
  // Позицию ведёт 1С компании: цену и остаток меняют в 1С, площадка их
  // подтягивает синхронизацией.
  "onec_managed",
] as const
export type PriceStockIssueCode = (typeof PRICE_STOCK_ISSUES)[number]

export type PriceStockIssue = {
  variant_id: string
  code: PriceStockIssueCode
  title: string | null
}

// Разбор одной правки против текущего состояния позиции. Возвращает либо
// готовую строку записи, либо причину отказа — по строке, а не «что-то не так»:
// в массовой правке продавец обязан видеть, какая позиция помешала.
//
// visibleLocationIds — склады, в которые правке разрешено писать (продавец
// компании — только склады своего канала): «единственный склад позиции» без
// этого ограничения мог оказаться складом площадки.
export const resolveChange = (
  change: PriceStockChange,
  found: { product: RawProduct; variant: RawVariant } | undefined,
  visibleLocationIds?: string[]
): { resolved?: ResolvedChange; issue?: PriceStockIssue } => {
  if (!found) {
    return {
      issue: { variant_id: change.variant_id, code: "unknown_variant", title: null },
    }
  }
  const { product, variant } = found
  const row = buildPriceStockRow(product, variant, null, visibleLocationIds)
  const title = priceStockRowTitle(row)
  const fail = (code: PriceStockIssueCode) => ({
    issue: { variant_id: change.variant_id, code, title },
  })

  const wantsPrice = change.price != null
  const wantsStock = change.stock != null
  if (!wantsPrice && !wantsStock) {
    return fail("empty_change")
  }
  if (
    (wantsPrice && row.onec_fields.includes("price")) ||
    (wantsStock && row.onec_fields.includes("stock"))
  ) {
    return fail("onec_managed")
  }
  if (wantsPrice && !row.price_editable) {
    return fail("price_rules")
  }

  let locationId: string | null = null
  let inventoryItemId: string | null = null
  let oldStock: number | null = null

  if (wantsStock) {
    if (!row.stock_editable) {
      return fail("stock_not_managed")
    }
    inventoryItemId = variantInventoryItemIds(variant)[0] ?? null
    if (!inventoryItemId) {
      return fail("stock_not_managed")
    }
    const levels = variantLevels(variant)
    if (change.location_id) {
      locationId = change.location_id
      // Склад без уровня — норма (первый завоз): уровень заведёт workflow.
      // Отказываем только если склада нет вовсе — это проверяет роут по списку
      // складов магазина, здесь же ловим опечатку в известных уровнях.
      oldStock = Number(
        levels.find((level) => level.location_id === change.location_id)
          ?.stocked_quantity ?? 0
      )
    } else if (row.location_id) {
      locationId = row.location_id
      oldStock = row.stocked
    } else if (row.locations_count > 1) {
      return fail("location_required")
    } else {
      // Позиция не лежит ни на одном складе, и склад не назван.
      return fail("location_required")
    }
  }

  return {
    resolved: {
      variant_id: variant.id,
      product_id: product.id,
      product_title: product.title,
      variant_title: row.variant_title,
      sku: row.sku,
      currency_code: PRICE_STOCK_CURRENCY,
      old_price: row.price,
      new_price: wantsPrice ? Number(change.price) : null,
      carry_prices: variantPrice(variant).carry_prices,
      location_id: locationId,
      inventory_item_id: inventoryItemId,
      old_stock: oldStock,
      new_stock: wantsStock ? Number(change.stock) : null,
    },
  }
}

// Половина правки, совпавшая с текущим числом, вычёркивается: экран присылает
// все выделенные строки целиком, а поменяли в них, как правило, одно поле.
// Иначе ядро переписывало бы ту же цену, а в журнале появлялась бы пара
// «2400 → 2400» рядом с настоящей правкой остатка.
export const trimUnchanged = (change: ResolvedChange): ResolvedChange => {
  const priceSame =
    change.new_price != null &&
    Number(change.new_price) === Number(change.old_price)
  const stockSame =
    change.new_stock != null &&
    Number(change.new_stock) === Number(change.old_stock)
  if (!priceSame && !stockSame) {
    return change
  }
  return {
    ...change,
    new_price: priceSame ? null : change.new_price,
    new_stock: stockSame ? null : change.new_stock,
    // Склад держим, пока правка остатка жива: по нему пишется журнал.
    location_id: stockSame ? null : change.location_id,
    inventory_item_id: stockSame ? null : change.inventory_item_id,
    old_stock: stockSame ? null : change.old_stock,
  }
}

// Правка, которая ничего не меняет: и цена, и остаток совпали с текущими. В
// журнал не пишем и ядро ею не тревожим.
export const isNoopChange = (change: ResolvedChange): boolean => {
  const trimmed = trimUnchanged(change)
  return trimmed.new_price == null && trimmed.new_stock == null
}

// Строка журнала для экрана: наружу отдаём готовые числа и названия, не
// сущности модуля. Названия складов приходят картой (как и в строках экрана:
// имя живёт в stock_location ядра), подпись автора — правилом actorLabel:
// имя учётки, а не её почта.
export const buildHistoryRow = (
  change: {
    id: string
    variant_id: string
    product_title: string
    variant_title?: string | null
    sku?: string | null
    currency_code?: string | null
    old_price?: number | string | null
    new_price?: number | string | null
    old_stock?: number | null
    new_stock?: number | null
    location_id?: string | null
    changed_by_name?: string | null
    source?: string | null
    created_at: Date | string
  },
  locationNames?: Map<string, string>
): PriceStockHistoryRow => ({
  id: change.id,
  variant_id: change.variant_id,
  product_title: change.product_title,
  variant_title: change.variant_title ?? null,
  sku: change.sku ?? null,
  currency_code: change.currency_code ?? null,
  old_price: change.old_price == null ? null : Number(change.old_price),
  new_price: change.new_price == null ? null : Number(change.new_price),
  old_stock: change.old_stock == null ? null : Number(change.old_stock),
  new_stock: change.new_stock == null ? null : Number(change.new_stock),
  location_id: change.location_id ?? null,
  // Склад мог быть удалён после правки — тогда в журнале останется правка без
  // названия склада, а не пустая строка вместо всей правки.
  location_name: change.location_id
    ? (locationNames?.get(change.location_id) ?? null)
    : null,
  changed_by_name: actorLabel(change.changed_by_name),
  source: change.source ?? "manual",
  created_at:
    change.created_at instanceof Date
      ? change.created_at.toISOString()
      : String(change.created_at),
})
