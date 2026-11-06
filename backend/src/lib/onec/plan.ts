import { createHash } from "crypto"
import { CatalogCategoryHandle } from "../catalog/categories"
import { classifyProductCategory } from "../catalog/classify-product-category"
import { ProductSegment } from "../../modules/catalog/models/product-card"
import { OnecItem } from "./parse-items"

// План синхронизации: что сделать с каталогом компании, чтобы он совпал с 1С.
// Чистые функции без обращений к базе (покрыты unit-тестами); применяет план
// lib/onec/sync.ts.
//
// Правила «как в 1С»:
//  - позиция 1С = товар компании с одним вариантом; название, описание и
//    единица — из 1С;
//  - цену и остаток 1С ведёт, только если присылает их (OnecManagedField): у
//    ORGSTROY выгрузка номенклатуры их не содержит, и тогда цену и остаток
//    задаёт продавец на «Ценах и остатках» (руками или файлом по артикулу), а
//    синхронизация их не трогает. Появятся поля в выгрузке — 1С забирает их себе;
//  - продаётся (published) только позиция с ценой больше нуля (из 1С или от
//    продавца): без цены товар заводится черновиком — в корзину его не положить;
//  - позиция пропала из 1С — товар снимается с витрины (draft), не удаляется:
//    на него ссылаются заказы и документы, и он вернётся, если позиция
//    появится снова;
//  - остаток из 1С — физический остаток склада: им перезаписывается
//    stocked_quantity, резервы заказов площадки остаются поверх него.

// Категория по умолчанию, если ни название, ни группа 1С ни о чём не сказали:
// у товара обязана быть категория (по ней заказ делится на задания сборки), а
// «отделка» — самый широкий из четырёх разделов ассортимента.
export const ONEC_DEFAULT_CATEGORY: CatalogCategoryHandle = "finishing"
// Сегмента в 1С нет; середина шкалы — нейтральный выбор для подбора аналогов.
export const ONEC_DEFAULT_SEGMENT: ProductSegment = "comfort"
export const ONEC_DEFAULT_UNIT = "шт"
// Метка товаров, которые ведёт 1С (product.metadata.source): по ней подписчик
// повторной модерации не возвращает такой товар на модерацию после правки.
export const ONEC_PRODUCT_SOURCE = "1c"

// Поля, которые 1С может вести за продавца. Какие именно ведёт — решает
// выгрузка: есть поле в ответе 1С — ведёт (product.metadata.onec_fields).
export const ONEC_MANAGED_FIELDS = ["price", "stock"] as const
export type OnecManagedField = (typeof ONEC_MANAGED_FIELDS)[number]

// Какие из полей присылает выгрузка — по найденным разбором ключам ответа.
export const managedFieldsOf = (fields: {
  price?: string
  stock?: string
}): OnecManagedField[] =>
  ONEC_MANAGED_FIELDS.filter((field) => !!fields[field])

// Откуда пришёл каталог: HTTP-сервис 1С или Excel-файл компании. Товары из
// файла помечаются onec_feed = "file" — экран «Цены и остатки» подписывает
// закрытые клетки «из Excel», а не «из 1С». У товаров 1С метки нет (как и
// раньше), чтобы не переписывать их метаданные.
export type OnecFeedKind = "http" | "file"

// Метаданные товара из 1С: метка источника, ключ позиции, поля, которые ведёт
// 1С (по ним «Цены и остатки» закрывают клетки), и бренд — его отдают поиск
// ассистента и витрина (бренд — публичное свойство товара, не учётное).
export const onecMetadata = (
  key: string,
  code: string | null,
  fields: OnecManagedField[],
  feed: OnecFeedKind = "http",
  brand: string | null = null
) => ({
  source: ONEC_PRODUCT_SOURCE,
  onec_key: key,
  onec_code: code,
  onec_fields: fields,
  ...(feed === "file" ? { onec_feed: "file" } : {}),
  brand,
})

// Бренд товара из его метаданных; null — не задан.
export const brandOf = (
  metadata: Record<string, unknown> | null | undefined
): string | null =>
  typeof metadata?.brand === "string" && metadata.brand.trim()
    ? metadata.brand.trim()
    : null

// Какие поля товара ведёт 1С — из его метаданных.
export const onecFieldsOf = (
  metadata: Record<string, unknown> | null | undefined
): OnecManagedField[] => {
  if (metadata?.source !== ONEC_PRODUCT_SOURCE) {
    return []
  }
  const fields = metadata.onec_fields
  // Товары первой версии интеграции меток не имели — тогда 1С вела всё.
  if (!Array.isArray(fields)) {
    return [...ONEC_MANAGED_FIELDS]
  }
  return ONEC_MANAGED_FIELDS.filter((field) => fields.includes(field))
}

// Желаемое состояние товара по позиции 1С.
export type OnecDesiredProduct = {
  feed: OnecFeedKind
  key: string
  code: string | null
  brand: string | null
  title: string
  description: string | null
  unit: string
  category: CatalogCategoryHandle
  category_guessed: boolean
  price: number | null
  stock: number
  // Опубликовать при создании: 1С ведёт цену и она больше нуля.
  published: boolean
  // Поля, которые ведёт 1С (см. OnecManagedField).
  onec_fields: OnecManagedField[]
  // Себестоимость из 1С (учётная цена); cost_known — 1С её вообще присылает
  // (иначе сохранённую не трогаем).
  cost: number | null
  cost_known: boolean
  sku: string
  handle: string
}

// Текущее состояние товара, заведённого из 1С (из ядра + onec_item).
export type OnecExistingProduct = {
  onec_item_id: string
  key: string
  // Код позиции, сохранённый при прошлой синхронизации (onec_item.external_code).
  code: string | null
  // Артикул варианта (SKU) — строится из кода.
  sku: string | null
  brand: string | null
  present: boolean
  product_id: string
  variant_id: string
  title: string
  description: string | null
  status: string
  unit: string | null
  product_card_id: string | null
  category: string | null
  price: number | null
  stock: number | null
  onec_fields: OnecManagedField[]
  cost: number | null
}

export type OnecProductUpdate = {
  existing: OnecExistingProduct
  desired: OnecDesiredProduct
  // Поля товара ядра, которые надо поменять (только отличающиеся).
  product: {
    title?: string
    description?: string | null
    status?: "published" | "draft"
    category?: CatalogCategoryHandle
    onec_fields?: OnecManagedField[]
    brand?: string | null
  }
  // Код позиции сменился (Excel: присвоен порядковый номер) — новый код и
  // артикул варианта.
  code?: { code: string | null; sku: string }
  unit?: string
  price?: { old: number | null; new: number }
  stock?: { old: number | null; new: number }
  cost?: { old: number | null; new: number | null }
}

export type OnecPlan = {
  creates: OnecDesiredProduct[]
  updates: OnecProductUpdate[]
  // Товар уже совпадает с 1С — не трогаем, только отмечаем «видели».
  unchanged: OnecExistingProduct[]
  hides: OnecExistingProduct[]
  // Скрытие отменено предохранителем (см. ONEC_MAX_HIDE_SHARE).
  hide_suppressed: number
}

// Если из 1С разом пропала бо́льшая часть позиций, это почти наверняка сбой
// выгрузки (не тот отбор, обрезанный ответ), а не распродажа: снимать
// полкаталога с витрины по такому ответу нельзя. Скрытие пропускается, прогон
// помечается замечанием, и продавец разбирается сам.
export const ONEC_MAX_HIDE_SHARE = 0.5
const ONEC_HIDE_GUARD_MIN = 10

// --- Нормализация полей ---

const UNIT_ALIASES: Record<string, string> = {
  шт: "шт",
  штука: "шт",
  штук: "шт",
  штуки: "шт",
  pcs: "шт",
  pc: "шт",
  кг: "кг",
  килограмм: "кг",
  т: "т",
  тн: "т",
  тонна: "т",
  м: "м",
  метр: "м",
  "пог.м": "м",
  "п.м": "м",
  пм: "м",
  м2: "м²",
  "кв.м": "м²",
  "м²": "м²",
  м3: "м³",
  "куб.м": "м³",
  "м³": "м³",
  л: "л",
  литр: "л",
  упак: "упак",
  уп: "упак",
  упаковка: "упак",
  компл: "компл",
  комплект: "компл",
  мешок: "мешок",
  меш: "мешок",
  рулон: "рулон",
  рул: "рулон",
  лист: "лист",
  пачка: "пачка",
  пач: "пачка",
}

// Количество до тысячных: 1С отдаёт остатки с тремя знаками (9,645 м³), а
// сумма float-ов даёт хвосты вроде 34,949999.
export const roundQuantity = (value: number): number =>
  Math.round(value * 1000) / 1000

export const normalizeUnit = (unit: string | null): string => {
  if (!unit) {
    return ONEC_DEFAULT_UNIT
  }
  // «пог,м» и «пог.м» — одно и то же: запятую 1С ставит вместо точки.
  const clean = unit.trim().toLowerCase().replace(/,/g, ".").replace(/\.$/, "")
  return UNIT_ALIASES[clean] ?? unit.trim()
}

const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh",
  щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  ә: "a", ғ: "g", қ: "k", ң: "n", ө: "o", ұ: "u", ү: "u", һ: "h", і: "i",
}

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .split("")
    .map((char) => TRANSLIT[char] ?? char)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

// Артикул товара компании. У ядра SKU уникален на всю площадку, а коды 1С двух
// компаний могут совпасть («00-00000001» есть в каждой базе), поэтому впереди —
// slug компании. Поиск по артикулу на экране «Цены и остатки» идёт по
// вхождению, так что код с коробки находится и с приставкой.
export const onecSku = (tenantSlug: string, item: OnecItem): string => {
  const raw = (item.article ?? item.code ?? item.key).trim()
  const full = raw.replace(/\s+/g, "-")
  // Длинный ключ (Excel без кода — наименование) обрезается, а хвост с хешем
  // ключа держит артикул уникальным.
  const clean =
    full.length > 80
      ? `${full.slice(0, 69)}-${createHash("sha1").update(item.key).digest("hex").slice(0, 10)}`
      : full
  return `${tenantSlug.toUpperCase()}-${clean}`
}

// handle товара (адрес карточки) — тоже уникален на всю площадку: slug
// компании + транслит названия + код позиции. Длинное название обрезается; если
// обрезан и код (у Excel без кода ключ — само наименование), позиции, что
// различаются только хвостом («…затирка, цвет белый» / «…цвет серый»), дали бы
// один handle — тогда вместо кода короткий хеш ключа.
export const onecHandle = (tenantSlug: string, item: OnecItem): string => {
  const title = slugify(item.name).slice(0, 60).replace(/-+$/, "")
  const fullCode = slugify(item.code ?? item.article ?? item.key)
  // Без кода и артикула ключ — наименование, а транслит теряет знаки
  // («6(+)» и «6(-)» — одно «6»): хеш ключа нужен всегда.
  const byName = !item.code && !item.article
  const code =
    byName || fullCode.length > 40
      ? createHash("sha1").update(item.key).digest("hex").slice(0, 10)
      : fullCode
  return [tenantSlug, title, code].filter(Boolean).join("-")
}

export const desiredProduct = (
  tenantSlug: string,
  item: OnecItem,
  managed: OnecManagedField[] = [...ONEC_MANAGED_FIELDS],
  costKnown = false,
  feed: OnecFeedKind = "http"
): OnecDesiredProduct => {
  const byTitle = classifyProductCategory(item.name)
  const byGroup = item.group ? classifyProductCategory(item.group) : null
  const category = byTitle ?? byGroup ?? ONEC_DEFAULT_CATEGORY
  const unit = normalizeUnit(item.unit)
  // Остаток — как в 1С, с дробной частью (34,95 м³): до тысячных, без
  // хвостов плавающей точки.
  const stock = Math.max(0, roundQuantity(item.stock ?? 0))
  const published =
    managed.includes("price") && item.price != null && item.price > 0
  const description = item.description ?? null

  return {
    feed,
    key: item.key,
    code: item.code,
    brand: item.brand,
    title: item.name,
    description,
    unit,
    category,
    category_guessed: !byTitle && !byGroup,
    price: item.price,
    stock,
    published,
    onec_fields: managed,
    cost: costKnown ? item.cost : null,
    cost_known: costKnown,
    sku: onecSku(tenantSlug, item),
    handle: onecHandle(tenantSlug, item),
  }
}

// Коды позиций Excel без кода и артикула: порядковые номера 1, 2, 3… в
// порядке строк файла. Номер закрепляется за позицией (onec_item.external_code)
// и при следующих загрузках не меняется; новая строка получает следующий
// свободный номер. Номера, которые уже заняты кодами файла или позициями
// компании (в том числе снятыми с витрины), не выдаются повторно.
export const assignFileCodes = (
  items: OnecItem[],
  existing: { key: string; code: string | null }[]
): { items: OnecItem[]; assigned: number } => {
  const codeByKey = new Map<string, string>()
  for (const row of existing) {
    if (row.code) {
      codeByKey.set(row.key, row.code)
    }
  }
  const used = new Set<string>()
  for (const code of [
    ...existing.map((row) => row.code),
    ...items.map((item) => item.code),
    ...items.map((item) => item.article),
  ]) {
    if (code) {
      used.add(code)
    }
  }
  let next = 1
  let assigned = 0
  const coded = items.map((item) => {
    if (item.code || item.article) {
      return item
    }
    const own = codeByKey.get(item.key)
    if (own) {
      return { ...item, code: own }
    }
    while (used.has(String(next))) {
      next += 1
    }
    const code = String(next)
    used.add(code)
    assigned += 1
    return { ...item, code }
  })
  return { items: coded, assigned }
}

const sameNumber = (a: number | null, b: number | null): boolean =>
  a == null || b == null ? a === b : Math.abs(a - b) < 0.0005

export const diffProduct = (
  existing: OnecExistingProduct,
  desired: OnecDesiredProduct
): OnecProductUpdate | null => {
  const update: OnecProductUpdate = { existing, desired, product: {} }

  if (existing.title !== desired.title) {
    update.product.title = desired.title
  }
  if ((existing.description ?? null) !== desired.description) {
    update.product.description = desired.description
  }
  const managesPrice = desired.onec_fields.includes("price")
  const managesStock = desired.onec_fields.includes("stock")
  // Продаётся, если есть цена: из 1С, когда её ведёт 1С, иначе та, что задал
  // продавец.
  const price = managesPrice ? desired.price : existing.price
  const status = price != null && price > 0 ? "published" : "draft"
  if (existing.status !== status) {
    update.product.status = status
  }
  const sameFields =
    existing.onec_fields.length === desired.onec_fields.length &&
    desired.onec_fields.every((field) => existing.onec_fields.includes(field))
  if (!sameFields) {
    update.product.onec_fields = desired.onec_fields
  }
  if (existing.category !== desired.category) {
    update.product.category = desired.category
  }
  if (existing.brand !== desired.brand) {
    update.product.brand = desired.brand
  }
  // Код меняем только у каталога из Excel: там его присваивает площадка
  // (порядковый номер позиции без кода). Артикулы товаров 1С не трогаем —
  // по ним продавец уже работает.
  if (desired.feed === "file" && desired.code && existing.code !== desired.code) {
    update.code = { code: desired.code, sku: desired.sku }
  }
  if (existing.product_card_id && existing.unit !== desired.unit) {
    update.unit = desired.unit
  }
  if (
    managesPrice &&
    desired.price != null &&
    desired.price > 0 &&
    !sameNumber(existing.price, desired.price)
  ) {
    update.price = { old: existing.price, new: desired.price }
  }
  if (managesStock && !sameNumber(existing.stock, desired.stock)) {
    update.stock = { old: existing.stock, new: desired.stock }
  }
  // Себестоимость 1С отдаёт только по позициям с остатком: распроданная
  // позиция из выгрузки остатков пропадает, но её себестоимость не стирается —
  // показываем последнюю известную.
  if (
    desired.cost_known &&
    desired.cost != null &&
    !sameNumber(existing.cost, desired.cost)
  ) {
    update.cost = { old: existing.cost, new: desired.cost }
  }

  const changed =
    Object.keys(update.product).length > 0 ||
    update.code !== undefined ||
    update.unit !== undefined ||
    update.price !== undefined ||
    update.stock !== undefined ||
    update.cost !== undefined
  return changed ? update : null
}

export const planOnecSync = (
  tenantSlug: string,
  items: OnecItem[],
  existing: OnecExistingProduct[],
  managed: OnecManagedField[] = [...ONEC_MANAGED_FIELDS],
  costKnown = false,
  feed: OnecFeedKind = "http"
): OnecPlan => {
  const byKey = new Map(existing.map((product) => [product.key, product]))
  const plan: OnecPlan = {
    creates: [],
    updates: [],
    unchanged: [],
    hides: [],
    hide_suppressed: 0,
  }

  const seen = new Set<string>()
  for (const item of items) {
    seen.add(item.key)
    const desired = desiredProduct(tenantSlug, item, managed, costKnown, feed)
    const current = byKey.get(item.key)
    if (!current) {
      plan.creates.push(desired)
      continue
    }
    // Сверяем с ТЕКУЩИМ состоянием ядра, а не с прошлым ответом 1С: правку
    // руками мимо 1С (того, что ведёт 1С) синхронизация возвращает к данным 1С.
    // Совпало всё —
    // товар не трогаем вовсе (ни событий, ни записей в журнале цен).
    const update = diffProduct(current, desired)
    if (!update) {
      plan.unchanged.push(current)
      continue
    }
    plan.updates.push(update)
  }

  const missing = existing.filter(
    (product) => !seen.has(product.key) && product.present
  )
  const presentBefore = existing.filter((product) => product.present).length
  const tooMany =
    missing.length >= ONEC_HIDE_GUARD_MIN &&
    missing.length > presentBefore * ONEC_MAX_HIDE_SHARE
  if (tooMany) {
    plan.hide_suppressed = missing.length
  } else {
    plan.hides = missing
  }

  return plan
}
