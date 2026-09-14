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
  return data as RawProduct[]
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
export const loadPriceStockSlice = async (
  query: Query,
  params: {
    q?: string
    category?: string
    status?: string
    stock?: PriceStockFilter
    location_id?: string
  }
): Promise<{
  rows: PriceStockRow[]
  counts: { total: number; zero: number; low: number }
  categoryCounts: Record<string, number>
  locationNames: Map<string, string>
  scope: string | null
  threshold: number
}> => {
  const locationNames = await loadLocationNames(query)
  if (params.location_id && !locationNames.has(params.location_id)) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Склад не найден")
  }
  // Склад один — смотрим его молча: спрашивать «какой склад» там, где он
  // единственный, значит усложнять на пустом месте.
  const scope =
    params.location_id ??
    (locationNames.size === 1 ? [...locationNames.keys()][0] : null)

  const products = await loadPriceStockProducts(query, {
    q: params.q,
    status: params.status,
  })

  const threshold = lowStockThreshold()
  // Порядок фильтров = порядок чипов на экране: сначала поиск (выборка), затем
  // категория, затем остаток. Счётчики каждого чипа считаются по срезу ДО его
  // собственного фильтра — чип показывает, что будет, если по нему нажать.
  const searched = buildPriceStockRows(products, scope).sort((a, b) =>
    a.title.localeCompare(b.title, "ru")
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
