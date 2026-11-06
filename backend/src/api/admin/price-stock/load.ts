import { AuthenticatedMedusaRequest } from "@medusajs/framework/http"
import { RemoteQueryFunction } from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { lowStockThreshold } from "../dashboard/constants"
import {
  PriceStockFilter,
  PriceStockRow,
  RawProduct,
  buildPriceStockRows,
  countByCategory,
  countStock,
  filterByCategory,
  filterByStock,
} from "./rows"

type Query = Omit<RemoteQueryFunction, symbol>

// Сколько позиций каталога просматриваем за раз. Отдельного индекса «мало на
// складе» у ядра нет, строка экрана — вариант, а не товар, поэтому страница
// режется в памяти (тот же приём, что в сводке дня и очереди отгрузки).
// Для одного магазина каталог заведомо меньше потолка.
export const PRICE_STOCK_SCAN_CAP = 1000

// Поля одной строки экрана: название и статус товара, единица из карточки,
// категория, цена варианта в валюте и уровни остатка по складам.
const FIELDS = [
  "id",
  "title",
  "status",
  "thumbnail",
  "metadata",
  "product_card.unit",
  "categories.handle",
  "categories.name",
  "variants.id",
  "variants.title",
  "variants.sku",
  "variants.manage_inventory",
  "variants.prices.id",
  "variants.prices.amount",
  "variants.prices.currency_code",
  "variants.prices.rules_count",
  "variants.inventory_items.inventory.id",
  "variants.inventory_items.inventory.location_levels.location_id",
  "variants.inventory_items.inventory.location_levels.stocked_quantity",
  "variants.inventory_items.inventory.location_levels.reserved_quantity",
]

// Категории в выборке НЕТ намеренно: чип категории фильтрует уже собранные
// строки (см. filterByCategory) — иначе мешок «вне ассортимента» пришлось бы
// собирать вторым запросом, а счётчики чипов считать по третьему.
export type PriceStockScope = {
  q?: string
  status?: string
  variant_ids?: string[]
  // Канал продаж компании: продавец компании видит и правит только товары
  // своего каталога (у каждой компании он свой — из её 1С).
  sales_channel_id?: string
  // Несколько каналов сразу — товары, которые продаются со склада, выбранного
  // владельцем площадки (у склада компании это каталог компании).
  sales_channel_ids?: string[]
}

// Каналы продаж, которые торгуют со склада.
export const loadLocationChannelIds = async (
  query: Query,
  locationId: string
): Promise<string[]> => {
  const { data } = await query.graph({
    entity: "sales_channel_location",
    fields: ["sales_channel_id"],
    filters: { stock_location_id: locationId },
  })
  return [
    ...new Set(
      (data as { sales_channel_id: string }[]).map((row) => row.sales_channel_id)
    ),
  ]
}

// Товары каталога канала (или нескольких каналов) продаж.
export const loadChannelProductIds = async (
  query: Query,
  salesChannelId: string | string[]
): Promise<string[]> => {
  const { data } = await query.graph({
    entity: "product_sales_channel",
    fields: ["product_id"],
    filters: { sales_channel_id: salesChannelId },
  })
  return [
    ...new Set((data as { product_id: string }[]).map((row) => row.product_id)),
  ]
}

// Товары среза. Поиск идёт по названию товара И по артикулу варианта: на складе
// позицию чаще ищут по артикулу с коробки, чем по названию.
export const loadPriceStockProducts = async (
  query: Query,
  scope: PriceStockScope
): Promise<RawProduct[]> => {
  if (scope.variant_ids && !scope.variant_ids.length) {
    return []
  }

  const filters: Record<string, unknown> = {}
  const channels = scope.sales_channel_id
    ? [scope.sales_channel_id]
    : scope.sales_channel_ids
  if (channels) {
    const productIds = channels.length
      ? await loadChannelProductIds(query, channels)
      : []
    if (!productIds.length) {
      return []
    }
    filters.id = productIds
  }
  if (scope.status) {
    filters.status = scope.status
  }

  if (scope.variant_ids) {
    filters.variants = { id: scope.variant_ids }
  }
  const term = scope.q?.trim()
  if (term) {
    filters.$or = [
      { title: { $ilike: `%${term}%` } },
      { variants: { sku: { $ilike: `%${term}%` } } },
    ]
  }

  const { data } = await query.graph({
    entity: "product",
    fields: FIELDS,
    filters,
    pagination: {
      skip: 0,
      take: PRICE_STOCK_SCAN_CAP,
      order: { title: "ASC" },
    },
  })
  const products = data as RawProduct[]

  // Себестоимость — из позиций 1С (onec_item.cost), а не из товара: в товаре
  // её увидел бы покупатель. У товара не из 1С её нет.
  const variantIds = products.flatMap((product) =>
    (product.variants ?? []).map((variant) => variant.id)
  )
  if (variantIds.length) {
    const { data: items } = await query.graph({
      entity: "onec_item",
      fields: ["variant_id", "cost"],
      filters: { variant_id: variantIds },
    })
    const costs = new Map(
      (items as unknown as { variant_id: string; cost: number | null }[])
        .filter((item) => item.cost != null)
        .map((item) => [item.variant_id, Number(item.cost)])
    )
    for (const product of products) {
      for (const variant of product.variants ?? []) {
        variant.cost = costs.get(variant.id) ?? null
      }
    }
  }
  return products
}

// Названия складов: id → название. Без списка id отдаёт все склады магазина
// (их единицы) — этим же списком проверяется склад, названный в правке.
// Со списком — только названные: журнал правок читает склады своей страницы.
export const loadLocationNames = async (
  query: Query,
  locationIds?: string[]
): Promise<Map<string, string>> => {
  const ids = locationIds ? [...new Set(locationIds)] : null
  if (ids && !ids.length) {
    return new Map()
  }

  const { data } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
    ...(ids ? { filters: { id: ids } } : {}),
  })
  return new Map(
    (data as { id: string; name?: string | null }[]).map((location) => [
      location.id,
      location.name ?? location.id,
    ])
  )
}

// Кто правит — имя для журнала (учётки может не быть: ключ API, удалённый
// пользователь). Идиома та же, что в очереди отгрузки. В журнал ложится СНИМОК
// имени на момент правки, поэтому почта здесь остаётся как есть — в подпись на
// экране её превращает actorLabel при чтении.
export const resolveActorName = async (
  req: AuthenticatedMedusaRequest
): Promise<string | null> => {
  const userId = req.auth_context?.actor_id
  if (!userId) {
    return null
  }
  const userService = req.scope.resolve(Modules.USER)
  const [user] = await userService.listUsers({ id: userId }, { take: 1 })
  if (!user) {
    return null
  }
  const name = [user.first_name, user.last_name]
    .filter((part) => !!part?.trim())
    .join(" ")
    .trim()
  return name || user.email || null
}

// Срез экрана целиком: строки (по всему каталогу, отсортированные и
// отфильтрованные), счётчики чипов и разрез склада. Один и тот же срез читают
// экран (страницами) и выгрузка в файл (целиком) — иначе «выгрузить то, что
// вижу» разъехалось бы с тем, что видно.
//
// locationIds — склады, которыми срез ограничен (продавец компании видит только
// склады своего канала); без списка — все склады магазина. salesChannelId —
// каталог компании: товары других компаний в её срез не попадают.
export const loadPriceStockSlice = async (
  query: Query,
  params: {
    q?: string
    category?: string
    status?: string
    stock?: PriceStockFilter
    location_id?: string
  },
  locationIds?: string[],
  salesChannelId?: string
): Promise<{
  rows: PriceStockRow[]
  counts: { total: number; zero: number; low: number }
  categoryCounts: Record<string, number>
  locationNames: Map<string, string>
  scope: string | null
  threshold: number
}> => {
  const locationNames = await loadLocationNames(query, locationIds)
  if (params.location_id && !locationNames.has(params.location_id)) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Склад не найден")
  }
  // Склад один — смотрим его молча: спрашивать «какой склад» там, где он
  // единственный, значит усложнять на пустом месте.
  const scope =
    params.location_id ??
    (locationNames.size === 1 ? [...locationNames.keys()][0] : null)

  // Владелец площадки выбрал склад — показываем товары, которые с него
  // продаются: у склада компании это её каталог, а не все товары площадки с
  // нулём (или остатком, заведённым когда-то по общему каталогу).
  const locationChannels =
    !salesChannelId && params.location_id
      ? await loadLocationChannelIds(query, params.location_id)
      : undefined
  const products = await loadPriceStockProducts(query, {
    q: params.q,
    status: params.status,
    sales_channel_id: salesChannelId,
    // Склад ни одного канала не обслуживает — фильтровать не по чему.
    sales_channel_ids: locationChannels?.length ? locationChannels : undefined,
  })

  const threshold = lowStockThreshold()
  // Порядок фильтров = порядок чипов на экране: сначала поиск (выборка), затем
  // категория, затем остаток. Счётчики каждого чипа считаются по срезу ДО его
  // собственного фильтра — чип показывает, что будет, если по нему нажать.
  const searched = buildPriceStockRows(products, scope, locationIds).sort(
    (a, b) => a.title.localeCompare(b.title, "ru")
  )
  const inCategory = filterByCategory(searched, params.category)

  return {
    rows: filterByStock(inCategory, params.stock, threshold),
    counts: countStock(inCategory, threshold),
    categoryCounts: countByCategory(searched),
    locationNames,
    scope,
    threshold,
  }
}
