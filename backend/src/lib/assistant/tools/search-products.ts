import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  CATALOG_CATEGORIES,
  CatalogCategoryHandle,
} from "../../catalog/categories"
import { loadChannelAssortment } from "../../tenants/scope"
import { AssistantContext, AssistantTool } from "../types"

// Инструмент ассистента «поиск товаров» (срез 1). Поиск published-товаров по всем
// словам запроса (AND по токенам); на каждый товар — ВСЕ варианты с ценой в валюте
// (цвет/размер/фасовка) + наличие (сумма доступного по location_levels > 0), чтобы
// ассистент мог предложить выбор и не заявлял ложно «другого нет» (баг 2026-07-24).
// Идиома чтения цены/остатка — как в store/estimates/:id/suggestions. Валюта —
// тенге (единственный рынок): читаем сырые prices варианта по kzt.

const CURRENCY = "kzt"
const DEFAULT_LIMIT = 5
const MAX_LIMIT = 10
const SCAN_CAP = 30

// Служебные слова запроса: в названиях товаров их нет, а в AND-фильтре каждое
// такое слово гарантированно обнуляет выдачу («доска ДЛЯ опалубки» → 0).
const STOP_WORDS = new Set([
  "для",
  "под",
  "из",
  "на",
  "в",
  "и",
  "с",
  "по",
  "от",
  "до",
  "мм",
  "см",
  "шт",
])

// Разговорные названия → слова, которые реально есть в названиях каталога.
// Причина: поиск идёт подстрокой по названию, поэтому «провод» НЕ находит
// «Кабель ВВГнг-LS 3×2.5», и ассистент честно отвечал «у нас нет» на товар,
// который лежит на складе (баг QA 2026-08-03). Ложный отказ — самый дорогой
// дефект консультанта: покупатель уходит за тем, что у нас есть.
// Таблица — доменные данные, её нормально расширять по мере находок; после
// смены ассортимента на четыре категории (2026-09-01) переписана под него.
const SYNONYMS: Record<string, string[]> = {
  // Отделка.
  гкл: ["гипсокартон"],
  профили: ["профиль"],
  профиля: ["профиль"],
  цпс: ["пескобетон"],
  стяжка: ["пескобетон"],
  стяжки: ["пескобетон"],
  ровнитель: ["пескобетон"],
  ротбанд: ["штукатурка"],
  штукатурки: ["штукатурка"],
  грунт: ["грунтовка"],
  грунтовки: ["грунтовка"],
  краски: ["краска"],
  покраска: ["краска"],
  кафель: ["плитка"],
  керамогранит: ["плитка"],
  // Электрика.
  провод: ["кабель"],
  провода: ["кабель"],
  ввг: ["кабель"],
  ввгнг: ["кабель"],
  автомат: ["автоматический"],
  автоматы: ["автоматический"],
  розетки: ["розетка"],
  подрозетники: ["подрозетник"],
  // Сантехника.
  трубы: ["труба"],
  фитинги: ["фитинг"],
  муфта: ["фитинг"],
  тройник: ["фитинг"],
  уголок: ["фитинг"],
  отвод: ["фитинг"],
  краны: ["кран"],
  вентиль: ["кран"],
  смесители: ["смеситель"],
  сифоны: ["сифон"],
  // Метизы.
  саморезы: ["саморез"],
  шуруп: ["саморез"],
  шурупы: ["саморез"],
  дюбели: ["дюбель"],
  дюбеля: ["дюбель"],
  анкеры: ["анкер"],
  анкера: ["анкер"],
  гвоздь: ["гвозди"],
}

type PriceRow = { amount?: number; currency_code?: string }
type LevelRow = {
  location_id?: string | null
  stocked_quantity?: number
  reserved_quantity?: number
}
type VariantRow = {
  id: string
  title?: string | null
  prices?: PriceRow[]
  inventory_items?: { inventory?: { location_levels?: LevelRow[] } }[]
}
type CategoryRow = { handle?: string | null; name?: string | null }
type ProductRow = {
  id: string
  title: string
  status: string
  thumbnail?: string | null
  product_card?: { unit?: string | null } | null
  categories?: CategoryRow[]
  variants?: VariantRow[]
}

// Один покупаемый вариант товара в валюте (цвет/размер/фасовка).
type FoundVariant = {
  variant_id: string
  variant_title: string | null
  price: number
  in_stock: boolean
}

// Товар с ВСЕМИ вариантами в валюте (не только самым дешёвым) — чтобы ассистент
// мог предложить выбор (цвет/размер) и не заявлял ложно «другого нет».
type FoundProduct = {
  product_id: string
  title: string
  unit: string | null
  image_url: string | null
  // Категория каталога (одна из четырёх) — по ней ассистент группирует список
  // в ответе и раскладывает заказ по сборщикам. null — категория не проставлена.
  category: string | null
  currency: string
  variants: FoundVariant[]
}

// Доступный остаток варианта (stocked − reserved) по складам канала витрины —
// резерв при оформлении берётся только с них. Без списка складов — по всем.
// null — вариант на складах канала витрины не заведён вовсе: ядро не даст
// положить его в корзину этого канала, и предлагать его покупателю нельзя.
const variantAvailable = (
  variant: VariantRow,
  locationIds: Set<string> | null
): number | null => {
  const items = variant.inventory_items ?? []
  if (!items.length) {
    // Остаток не ведётся — продаётся без склада.
    return Number.POSITIVE_INFINITY
  }
  let available = 0
  let stocked = false
  for (const ii of items) {
    for (const lvl of ii.inventory?.location_levels ?? []) {
      if (locationIds && !(lvl.location_id && locationIds.has(lvl.location_id))) {
        continue
      }
      stocked = true
      available +=
        Number(lvl.stocked_quantity ?? 0) - Number(lvl.reserved_quantity ?? 0)
    }
  }
  return stocked || !locationIds ? available : null
}

// Все варианты товара с ценой в валюте (по возрастанию цены). Товар без единого
// варианта с ценой в валюте отсеивается (возврат null).
const collectProduct = (
  product: ProductRow,
  locationIds: Set<string> | null
): FoundProduct | null => {
  const variants: FoundVariant[] = []
  for (const variant of product.variants ?? []) {
    const price = (variant.prices ?? []).find(
      (p) => p.currency_code === CURRENCY
    )
    if (!price || price.amount == null) {
      continue
    }
    const available = variantAvailable(variant, locationIds)
    if (available === null) {
      continue
    }
    variants.push({
      variant_id: variant.id,
      variant_title: variant.title ?? null,
      price: Number(price.amount),
      in_stock: available > 0,
    })
  }
  if (variants.length === 0) {
    return null
  }
  variants.sort((a, b) => a.price - b.price)
  return {
    product_id: product.id,
    title: product.title,
    unit: product.product_card?.unit ?? null,
    image_url: product.thumbnail ?? null,
    category: product.categories?.[0]?.name ?? null,
    currency: CURRENCY,
    variants,
  }
}

export const searchProductsTool: AssistantTool = {
  declaration: {
    name: "search_products",
    description:
      "Найти товары по названию (например «грунтовка», «кабель 2.5», «саморез»). " +
      "Возвращает список товаров, у каждого — ВСЕ доступные варианты (цвет, " +
      "размер, фасовка) с ценой в тенге, единицей и наличием. Если у товара " +
      "несколько вариантов — предложи покупателю выбор, не говори, что вариант один. " +
      "Ищи ОДНИМ-ДВУМЯ ключевыми словами материала («утеплитель», а не " +
      "«утеплитель для фасада 100 мм»). Пустой результат — ещё НЕ доказательство, " +
      "что товара нет: перед ответом «у нас такого нет» повтори поиск более общим " +
      "словом (вместо «ввгнг 2.5» — «кабель», вместо «муфта» — «фитинг») или " +
      "запроси всю категорию через category.",
    parameters: {
      type: "OBJECT",
      properties: {
        query: {
          type: "STRING",
          description:
            "Название материала или его часть для поиска. Можно оставить пустым, " +
            "если задана category — тогда вернётся ассортимент категории.",
        },
        category: {
          type: "STRING",
          description:
            "Ограничить поиск одной категорией каталога: " +
            CATALOG_CATEGORIES.map((c) => `${c.handle} — ${c.name}`).join("; ") +
            ".",
          enum: CATALOG_CATEGORIES.map((c) => c.handle),
        },
        limit: {
          type: "NUMBER",
          description: `Сколько товаров вернуть (по умолчанию ${DEFAULT_LIMIT}, максимум ${MAX_LIMIT}).`,
        },
      },
      required: ["query"],
    },
  },
  execute: async (
    container: MedusaContainer,
    args: Record<string, unknown>,
    context: AssistantContext
  ): Promise<Record<string, unknown>> => {
    const rawQuery = typeof args.query === "string" ? args.query.trim() : ""
    const rawCategory =
      typeof args.category === "string" ? args.category.trim() : ""
    const categoryHandle = CATALOG_CATEGORIES.some(
      (c) => c.handle === rawCategory
    )
      ? (rawCategory as CatalogCategoryHandle)
      : null
    // Ни слова, ни категории — искать нечего (ядро не трогаем).
    if (!rawQuery && !categoryHandle) {
      return { products: [] }
    }
    const rawLimit = Number(args.limit)
    const limit =
      Number.isFinite(rawLimit) && rawLimit > 0
        ? Math.min(Math.floor(rawLimit), MAX_LIMIT)
        : DEFAULT_LIMIT

    // Разбор запроса в слова: тире и знаки — разделители («фр. 20-40» → «20»,
    // «40»), служебные слова отброшены, разговорные названия развёрнуты в слова
    // каталога. Токены короче двух символов не ищем: «в», «с» находят почти всё.
    const tokens = [
      ...new Set(
        rawQuery
          .toLowerCase()
          .split(/[^\p{L}\p{N}]+/u)
          .filter((t) => t.length > 1 && !STOP_WORDS.has(t))
          .flatMap((t) => SYNONYMS[t] ?? [t])
      ),
    ]

    const like = (t: string) => ({ title: { $ilike: `%${t}%` } })

    // Совпадение по ВСЕМ словам (AND): «арматура 12» находит «Арматура А500С
    // 12 мм», а не всё подряд. Фраза как одна подстрока давала ложные «нет в
    // наличии» (баг 2026-07-24).
    const andFilter = tokens.length
      ? tokens.length === 1
        ? like(tokens[0])
        : { $and: tokens.map(like) }
      : { title: { $ilike: `%${rawQuery}%` } }

    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const fields = [
      "id",
      "title",
      "status",
      "thumbnail",
      "product_card.unit",
      "categories.handle",
      "categories.name",
      "variants.id",
      "variants.title",
      "variants.prices.amount",
      "variants.prices.currency_code",
      "variants.inventory_items.inventory.location_levels.location_id",
      "variants.inventory_items.inventory.location_levels.stocked_quantity",
      "variants.inventory_items.inventory.location_levels.reserved_quantity",
    ]
    // Категорию фильтруем по её handle прямо в запросе товаров: категории нет
    // в базе — выдача пуста, и ответ «вот электрика» со случайными товарами
    // невозможен по построению.
    const categoryFilter: Record<string, unknown> = categoryHandle
      ? { categories: { handle: categoryHandle } }
      : {}

    // Ассортимент и склады канала витрины: продавец компании продаёт только
    // товары своего канала, и «в наличии» — только то, что лежит на его складах.
    // Фильтр по товарам канала стоит в самом запросе, а не после выборки:
    // иначе товары канала за пределами первых SCAN_CAP строк терялись бы.
    const channel = context.salesChannelId
      ? await loadChannelAssortment(container, context.salesChannelId)
      : null
    if (channel && !channel.productIds.length) {
      return { products: [] }
    }

    const runSearch = async (titleFilter: Record<string, unknown>) => {
      const { data } = await query.graph({
        entity: "product",
        fields,
        filters: {
          status: "published",
          ...(channel ? { id: channel.productIds } : {}),
          ...categoryFilter,
          ...titleFilter,
        },
        pagination: { skip: 0, take: SCAN_CAP },
      })
      return data as ProductRow[]
    }

    // Пустой запрос при заданной категории — обзор ассортимента категории.
    let data = await runSearch(rawQuery ? andFilter : {})

    // AND ничего не дал, а слов было несколько — пробуем ЛЮБОЕ из слов (OR).
    // Иначе одно лишнее слово в запросе («щебень 20-40», где в названии товара
    // фракция другая) превращалось в «у нас такого нет», и покупатель уходил за
    // товаром, который есть на складе.
    if (rawQuery && data.length === 0 && tokens.length > 1) {
      data = await runSearch({ $or: tokens.map(like) })
    }

    const products = data
      .map((product) => collectProduct(product, channel?.locationIds ?? null))
      .filter((p): p is FoundProduct => p !== null)
      .sort((a, b) => a.variants[0].price - b.variants[0].price)
      .slice(0, limit)

    // Карточек подбора в ленту больше НЕ кладём (T10.19, DECISIONS 2026-09-14):
    // на демо покупатели не понимали, зачем под ответом список со счётчиками,
    // а длинный подбор закрывал сам ответ. Выбор идёт текстом, количество
    // правится в полосе корзины.
    return { products }
  },
}
