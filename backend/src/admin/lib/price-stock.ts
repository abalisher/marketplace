// DTO ресурса «Цены и остатки» (GET/POST /admin/price-stock, T10.14a) и правила
// клетки экрана. Типы продублированы из бэкенда намеренно: код сервера в
// браузерный бандл не импортируем (см. src/admin/README.md).
//
// Вся арифметика правки живёт здесь, а не в page.tsx: «что считается правкой»,
// «какую клетку править нельзя» и «что уходит в партию» — правила, которые
// обязаны быть под unit-тестами (экран их только рисует).

export type PriceStockIssueCode =
  | "unknown_variant"
  | "empty_change"
  | "price_rules"
  | "stock_not_managed"
  | "location_required"
  | "unknown_location"
  | "duplicate_change"
  | "price_locked"
  | "onec_managed"

// Строка экрана — покупаемый ВАРИАНТ: цена и остаток живут на нём, а не на
// товаре. Числа остатка — в разрезе выбранного склада (`stocked_total` —
// всегда сумма по всем складам).
export type AdminPriceStockRow = {
  variant_id: string
  product_id: string
  title: string
  variant_title: string | null
  sku: string | null
  unit: string | null
  status: string | null
  category_handle: string | null
  category_name: string | null
  price: number | null
  // Себестоимость единицы (учётная цена из 1С); null — неизвестна.
  cost?: number | null
  currency_code: string
  stocked: number
  reserved: number
  available: number
  stocked_total: number
  location_id: string | null
  location_name: string | null
  locations_count: number
  stock_editable: boolean
  price_editable: boolean
  // Товар из 1С компании и что из цены/остатка ведёт 1С (эти клетки только
  // для чтения).
  managed_by?: "onec" | "file" | null
  onec_fields?: ("price" | "stock")[]
}

export type AdminPriceStockLocation = {
  id: string
  name: string
}

// Категория каталога для чипов экрана. Фильтр ресурса ходит по handle —
// стабильному ключу: имя владелец вправе переименовать.
export type AdminPriceStockCategory = {
  handle: string
  name: string
}

export type AdminPriceStockCategoriesResponse = {
  product_categories: AdminPriceStockCategory[]
}

export type AdminPriceStockResponse = {
  price_rows: AdminPriceStockRow[]
  counts: { total: number; zero: number; low: number }
  // Сколько позиций в каждой категории и сколько вне ассортимента (ключ
  // PRICE_STOCK_OTHER_CATEGORY). Считает ресурс — экран только рисует числа.
  category_counts: Record<string, number>
  count: number
  offset: number
  limit: number
  low_threshold: number
  scan_cap: number
  location_id: string | null
  locations: AdminPriceStockLocation[]
}

export type AdminPriceStockChange = {
  variant_id: string
  price?: number
  stock?: number
  location_id?: string
}

export type AdminPriceStockIssue = {
  variant_id: string
  code: PriceStockIssueCode
  title: string | null
}

export type AdminPriceStockApplyResponse = {
  applied: number
  skipped: number
  price_rows: AdminPriceStockRow[]
}

export type AdminPriceStockHistoryRow = {
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
  // Склад правки остатка: цена в магазине одна, а остаток у каждого склада
  // свой — «остаток 373 → 370» без склада не отвечает «где».
  location_id: string | null
  location_name: string | null
  changed_by_name: string | null
  source: string
  created_at: string
}

export type AdminPriceStockHistoryResponse = {
  price_changes: AdminPriceStockHistoryRow[]
  count: number
  offset: number
  limit: number
}

// Сколько позиций принимает одна партия правок (потолок ресурса, T10.14a).
// Страница экрана ровно такая же: «выделить всё на странице» проходит целиком.
export const PRICE_STOCK_MAX_CHANGES = 50

// Чип-мешок «вне ассортимента»: позиции, чья категория не входит в четвёрку
// каталога (снятый с продажи товар, категория ещё не назначена). Ключ тот же,
// что у ресурса, — им же фильтруется срез.
export const PRICE_STOCK_OTHER_CATEGORY = "other"

// Фильтр остатка (чипы «нет в наличии» / «на исходе»).
export const PRICE_STOCK_FILTERS = ["zero", "low"] as const
export type PriceStockFilter = (typeof PRICE_STOCK_FILTERS)[number]

export const PRICE_STOCK_FILTER_LABELS: Record<PriceStockFilter, string> = {
  zero: "priceStock.filter.zero",
  low: "priceStock.filter.low",
}

// Почему партию не записали — по строке. label — i18n-ключ.
export const PRICE_STOCK_ISSUE_LABELS: Record<PriceStockIssueCode, string> = {
  unknown_variant: "priceStock.issue.unknownVariant",
  empty_change: "priceStock.issue.emptyChange",
  price_rules: "priceStock.issue.priceRules",
  stock_not_managed: "priceStock.issue.stockNotManaged",
  location_required: "priceStock.issue.locationRequired",
  unknown_location: "priceStock.issue.unknownLocation",
  duplicate_change: "priceStock.issue.duplicateChange",
  price_locked: "priceStock.issue.priceLocked",
  onec_managed: "priceStock.issue.onecManaged",
}

// --- Черновик правок ---

// Что продавец набрал в клетках. Ключ — вариант, значения — строки полей: до
// нажатия «Применить» ничего никуда не уходит, поэтому храним ровно то, что
// набрано (пустая клетка — «не трогал», а не «ноль»).
//
// location_id — склад, для которого набран остаток: экран показывает срез
// одного склада, и набранное число обязано уехать именно на него, даже если
// разрез к моменту записи сменят.
export type PriceStockDraft = {
  price?: string
  stock?: string
  location_id?: string
}
export type PriceStockDrafts = Record<string, PriceStockDraft>
export type PriceStockField = "price" | "stock"

// Клетка принимает только целое неотрицательное число: дробных цен в каталоге
// нет, дробных остатков — тем более (единица измерения у товара своя).
// Потолок разрядов — как у валидатора ресурса, чтобы отказ приходил не из ядра.
//
// Разделитель дробной части НЕ выбрасываем, а сохраняем в тексте клетки. Раньше
// он снимался вместе с пробелами, и «2 750,00» из прайса поставщика склеивалось
// в 275000 — цена уезжала в сто раз вверх молча (блокер Ф-прогона Данияра,
// 2026-09-02). Пробелы-разделители тысяч по-прежнему снимаем: «6 000» — это
// шесть тысяч, а не ошибка.
export const sanitizeAmountInput = (value: string): string => {
  let seenSeparator = false
  let out = ""
  for (const char of value) {
    if (char >= "0" && char <= "9") {
      out += char
      continue
    }
    // Только первый разделитель: «1,2,3» — набор, а не число.
    if ((char === "," || char === ".") && out !== "" && !seenSeparator) {
      seenSeparator = true
      out += ","
    }
  }
  const [whole, fraction] = out.split(",")
  const head = whole.replace(/^0+(?=\d)/, "").slice(0, 10)
  return seenSeparator ? `${head},${fraction ?? ""}` : head
}

// Дробная часть набрана (хотя бы разделитель): такое число в каталог не идёт —
// то же правило, что у импорта файла («дробная цена — отказ строки»).
export const isAmountFractional = (value: string): boolean =>
  value.includes(",") || value.includes(".")

export const parseAmountInput = (value: string): number | null => {
  const digits = sanitizeAmountInput(value)
  if (digits === "" || isAmountFractional(digits)) {
    return null
  }
  return Number(digits)
}

// Клетка, набранная с дробной частью: в партию не идёт и обязана быть видна
// продавцу — иначе «Правок: 0» без объяснения выглядит как отказ экрана.
export const isFieldFractional = (
  row: AdminPriceStockRow,
  drafts: PriceStockDrafts,
  field: PriceStockField
): boolean => {
  const raw = drafts[row.variant_id]?.[field]
  return raw !== undefined && isAmountFractional(raw)
}

// Сколько клеток набрано с дробной частью — по всем строкам, которые экран
// видел: пока хоть одна такая есть, партия не пишется (иначе продавец записал
// бы девятнадцать правок из двадцати и не заметил пропажу двадцатой).
export const countFractionalDrafts = (
  rows: AdminPriceStockRow[],
  drafts: PriceStockDrafts
): number => {
  let count = 0
  for (const row of rows) {
    if (isFieldFractional(row, drafts, "price")) {
      count += 1
    }
    if (isFieldFractional(row, drafts, "stock")) {
      count += 1
    }
  }
  return count
}

// Текущее число строки по полю: цена может быть не назначена вовсе (пустая
// клетка — продавец за этим и пришёл), остаток всегда число.
export const currentAmount = (
  row: AdminPriceStockRow,
  field: PriceStockField
): number | null => (field === "price" ? row.price : row.stocked)

export const currentAmountText = (
  row: AdminPriceStockRow,
  field: PriceStockField
): string => {
  const amount = currentAmount(row, field)
  return amount == null ? "" : String(amount)
}

// Что показывает клетка: набранное или текущее число каталога.
export const fieldText = (
  row: AdminPriceStockRow,
  drafts: PriceStockDrafts,
  field: PriceStockField
): string => drafts[row.variant_id]?.[field] ?? currentAmountText(row, field)

// Правка ли это. Пустая клетка — «не трогал» (сбросить цену в никуда с этого
// экрана нельзя), совпавшее число — тоже не правка: иначе продавец, поправивший
// одну строку из двадцати выделенных, отправил бы в журнал двадцать записей
// «2400 → 2400» (ресурс такие вычёркивает, но и присылать их незачем).
export const isFieldChanged = (
  row: AdminPriceStockRow,
  drafts: PriceStockDrafts,
  field: PriceStockField
): boolean => {
  const raw = drafts[row.variant_id]?.[field]
  if (raw === undefined) {
    return false
  }
  const parsed = parseAmountInput(raw)
  return parsed !== null && parsed !== currentAmount(row, field)
}

// --- Что править нельзя (и почему) ---

// Клетка без ввода бывает по трём причинам, и продавцу нужна каждая: иначе
// «почему здесь не печатается» остаётся загадкой (находка Ф-прогона панели).
export type PriceStockLock =
  | "priceRules"
  | "notManaged"
  | "locationRequired"
  | "onec"
  | "file"

// short — приписка под прочерком в клетке, hint — подсказка при наведении.
export const PRICE_STOCK_LOCK_LABELS: Record<
  PriceStockLock,
  { short: string; hint: string }
> = {
  priceRules: {
    short: "priceStock.lock.priceRulesShort",
    hint: "priceStock.lock.priceRules",
  },
  notManaged: {
    short: "priceStock.lock.notManagedShort",
    hint: "priceStock.lock.notManaged",
  },
  locationRequired: {
    short: "priceStock.lock.locationRequiredShort",
    hint: "priceStock.lock.locationRequired",
  },
  onec: {
    short: "priceStock.lock.onecShort",
    hint: "priceStock.lock.onec",
  },
  file: {
    short: "priceStock.lock.fileShort",
    hint: "priceStock.lock.file",
  },
}

// Кто ведёт закрытую клетку собственного каталога компании: 1С или Excel-файл.
const ownCatalogLock = (row: AdminPriceStockRow): PriceStockLock =>
  row.managed_by === "file" ? "file" : "onec"

// Цена, заданная правилами (регион, канал, количество), живёт в карточке
// товара: правка с этого экрана снесла бы правила.
export const priceLock = (row: AdminPriceStockRow): PriceStockLock | null => {
  if (row.onec_fields?.includes("price")) {
    return ownCatalogLock(row)
  }
  return row.price_editable ? null : "priceRules"
}

// Остаток: либо позиция его не ведёт (услуга, комплект из нескольких складских
// позиций), либо она лежит на нескольких складах и склад не выбран — молча
// писать в один из двух нельзя.
export const stockLock = (row: AdminPriceStockRow): PriceStockLock | null => {
  // Остаток ведёт 1С компании: он приходит синхронизацией.
  if (row.onec_fields?.includes("stock")) {
    return ownCatalogLock(row)
  }
  if (!row.stock_editable) {
    return "notManaged"
  }
  if (!row.location_id) {
    return "locationRequired"
  }
  return null
}

export const fieldLock = (
  row: AdminPriceStockRow,
  field: PriceStockField
): PriceStockLock | null => (field === "price" ? priceLock(row) : stockLock(row))

export const isFieldEditable = (
  row: AdminPriceStockRow,
  field: PriceStockField
): boolean => fieldLock(row, field) === null

// --- Партия ---

// Правки страницы одной партией: правка в строке — партия из одной позиции,
// массовая правка выделенных — из нескольких. Порядок строк экрана сохраняем,
// чтобы список отказов читался сверху вниз, как таблица.
export const buildPriceStockChanges = (
  rows: AdminPriceStockRow[],
  drafts: PriceStockDrafts
): AdminPriceStockChange[] => {
  const changes: AdminPriceStockChange[] = []
  for (const row of rows) {
    const change: AdminPriceStockChange = { variant_id: row.variant_id }
    if (isFieldEditable(row, "price") && isFieldChanged(row, drafts, "price")) {
      change.price = parseAmountInput(drafts[row.variant_id].price as string) as number
    }
    if (isFieldEditable(row, "stock") && isFieldChanged(row, drafts, "stock")) {
      change.stock = parseAmountInput(drafts[row.variant_id].stock as string) as number
      // Склад, для которого набрано число: он запомнен вместе с правкой (разрез
      // экрана могли сменить), иначе — склад строки. Без склада ресурс правку
      // остатка не примет.
      const locationId = drafts[row.variant_id].location_id ?? row.location_id
      if (locationId) {
        change.location_id = locationId
      }
    }
    if (change.price !== undefined || change.stock !== undefined) {
      changes.push(change)
    }
  }
  return changes
}

// --- Массовая правка выделенных ---

// Одно число — во все выделенные строки. Записывает не в каталог, а в черновик:
// продавец видит новые числа в таблице и применяет их той же кнопкой, что и
// правку одной строки (один путь записи, а не два). Строки, где поле править
// нельзя, пропускаем и говорим сколько.
export const fillPriceStockDrafts = (
  rows: AdminPriceStockRow[],
  drafts: PriceStockDrafts,
  selectedIds: string[],
  values: { price?: string; stock?: string }
): { drafts: PriceStockDrafts; filled: number; skipped: number } => {
  const selected = new Set(selectedIds)
  const price = values.price ? sanitizeAmountInput(values.price) : ""
  const stock = values.stock ? sanitizeAmountInput(values.stock) : ""
  const next: PriceStockDrafts = { ...drafts }
  let filled = 0
  let skipped = 0

  for (const row of rows) {
    if (!selected.has(row.variant_id)) {
      continue
    }
    const draft: PriceStockDraft = { ...next[row.variant_id] }
    let touched = false
    if (price !== "" && isFieldEditable(row, "price")) {
      draft.price = price
      touched = true
    }
    if (stock !== "" && isFieldEditable(row, "stock")) {
      draft.stock = stock
      draft.location_id = row.location_id ?? undefined
      touched = true
    }
    if (touched) {
      next[row.variant_id] = draft
      filled += 1
    } else {
      skipped += 1
    }
  }

  return { drafts: next, filled, skipped }
}

// Сколько из позиций сейчас НЕ на экране. Выделение и правки живут по
// позициям и переживают переход на другую страницу — значит панель обязана
// говорить, что часть партии продавец сейчас не видит: иначе он подставляет
// число в строки, которых на экране нет (блокер Ф-прогона Данияра, 2026-09-02).
export const countOffscreen = (
  visibleRows: AdminPriceStockRow[],
  ids: string[]
): number => {
  const visible = new Set(visibleRows.map((row) => row.variant_id))
  return ids.filter((id) => !visible.has(id)).length
}

// Названия позиций вне экрана — их показывает и панель массовой правки, и
// список под таблицей: «две штуки» ничего не говорит, а «Фитинг — Муфта D25»
// говорит.
export const offscreenTitles = (
  visibleRows: AdminPriceStockRow[],
  rows: AdminPriceStockRow[],
  ids: string[]
): string[] => {
  const visible = new Set(visibleRows.map((row) => row.variant_id))
  const byId = new Map(rows.map((row) => [row.variant_id, row]))
  return ids
    .filter((id) => !visible.has(id))
    .map((id) => {
      const row = byId.get(id)
      return row ? priceStockRowTitle(row) : id
    })
}

// Убрать из черновика применённые строки: ответ ресурса приносит их свежие
// числа, и набранное в клетках больше не нужно. Остальные правки продавца
// (строки, которых партия не касалась) остаются набранными.
export const clearPriceStockDrafts = (
  drafts: PriceStockDrafts,
  variantIds: string[]
): PriceStockDrafts => {
  const next: PriceStockDrafts = { ...drafts }
  for (const id of variantIds) {
    delete next[id]
  }
  return next
}

// Правки остатков относятся к выбранному складу: сменили разрез — набранные
// остатки отменяем (число «380» набрано для этого склада и на другой уехать не
// должно). Цены складом не разрезаны и остаются набранными.
export const clearStockDrafts = (
  drafts: PriceStockDrafts
): PriceStockDrafts => {
  const next: PriceStockDrafts = {}
  for (const [id, draft] of Object.entries(drafts)) {
    if (draft.price !== undefined) {
      next[id] = { price: draft.price }
    }
  }
  return next
}

// Подпись строки: у односортного товара вариант не показываем — «Цемент М400 —
// Цемент М400» продавцу ничего не сообщает. Принимает и строку экрана, и
// запись журнала (там название товара лежит в product_title).
export const priceStockRowTitle = (row: {
  title: string
  variant_title: string | null
}): string =>
  row.variant_title && row.variant_title !== row.title
    ? `${row.title} — ${row.variant_title}`
    : row.title

// Наценка цены продажи над себестоимостью, % (целое). Нет одной из цен —
// считать не от чего.
export const markupPercent = (row: AdminPriceStockRow): number | null =>
  row.price != null && row.cost != null && row.cost > 0
    ? Math.round((row.price / row.cost - 1) * 100)
    : null
