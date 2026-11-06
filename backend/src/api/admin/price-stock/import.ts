// Разбор загруженного файла против каталога (T10.14c): что именно поменяется,
// если продавец нажмёт «Применить». Здесь только сверка и предпросмотр — файл
// НИЧЕГО не пишет сам: партию отдаёт экран тем же `POST /admin/price-stock`,
// что и правка в клетке, с пометкой `source: "import"`. Путь записи один.
//
// Ключ строки файла — АРТИКУЛ, а не id варианта: файл — то же рабочее место
// продавца, что и экран, и технических id на нём нет (DoD T10.14).

import {
  ImportColumns,
  matchColumns,
  parseAmountCell,
  parseTable,
} from "./csv"
import {
  PriceStockChange,
  PriceStockRow,
  RawProduct,
  RawVariant,
  buildPriceStockRow,
} from "./rows"

// Потолки одной загрузки. Строк в файле — с запасом на весь каталог магазина;
// правок — столько же, сколько принимает партия (файл применяется целиком).
export const PRICE_STOCK_IMPORT_MAX_ROWS = 2000
// Потолки чисел — те же, что у валидатора ресурса: отказ обязан приходить в
// предпросмотре с номером строки, а не 400-й из ядра при записи.
export const PRICE_STOCK_IMPORT_MAX_PRICE = 1_000_000_000
export const PRICE_STOCK_IMPORT_MAX_STOCK = 10_000_000
// Сколько строк показываем в предпросмотре. Больше двухсот продавец глазами
// всё равно не сверяет — остальные считаем сводкой.
export const PRICE_STOCK_IMPORT_MAX_PREVIEW = 200
// Потолок тела запроса: base64 файла. 700 тысяч знаков — это ~500 КБ CSV,
// вчетверо больше выгрузки всего каталога магазина.
export const PRICE_STOCK_IMPORT_MAX_BASE64 = 700_000

// Почему файл не принят целиком: ни одна строка не записана и предпросмотра нет.
export const PRICE_STOCK_FILE_ERRORS = [
  // Пустой файл или одна строка заголовка.
  "empty_file",
  // Не нашли колонок «Артикул» и «Цена»/«Остаток».
  "no_columns",
  // Строк больше потолка.
  "too_many_rows",
  // В колонке «Склад» несколько разных складов: непонятно, куда писать остаток.
  "mixed_locations",
  // Склад из файла не заведён у магазина.
  "unknown_location",
  // Файл выгружен по одному складу, а экран смотрит другой: остатки уехали бы
  // не туда, и продавец этого не увидел бы.
  "location_mismatch",
  // Правок в файле больше, чем принимает партия: файл пишется целиком, и
  // разбивать его на части — значит потерять «либо всё, либо ничего».
  "too_many_changes",
] as const
export type PriceStockFileErrorCode = (typeof PRICE_STOCK_FILE_ERRORS)[number]

// Почему не принята отдельная строка. Коды каталога («цена по правилам»,
// «остаток не ведётся») повторяют коды правки с экрана — причина одна и та же.
export const PRICE_STOCK_IMPORT_ISSUES = [
  "missing_sku",
  "unknown_sku",
  "duplicate_sku",
  "bad_price",
  "fraction_price",
  "bad_stock",
  "fraction_stock",
  "price_rules",
  "stock_not_managed",
  "location_required",
  "onec_managed",
] as const
export type PriceStockImportIssueCode =
  (typeof PRICE_STOCK_IMPORT_ISSUES)[number]

// Строка предпросмотра: номер строки файла (продавец правит её в Excel и
// должен найти её там же), артикул, найденная позиция и пара «было → станет».
export type PriceStockImportRow = {
  line: number
  sku: string
  title: string | null
  variant_id: string | null
  unit: string | null
  old_price: number | null
  new_price: number | null
  old_stock: number | null
  new_stock: number | null
  issue: PriceStockImportIssueCode | null
}

export type PriceStockImportPreview = {
  rows: PriceStockImportRow[]
  changes: PriceStockChange[]
  summary: {
    rows: number
    changes: number
    unchanged: number
    issues: number
  }
  rows_truncated: boolean
}

// Сырая строка файла до сверки с каталогом.
export type ImportFileRow = {
  line: number
  sku: string
  price: string
  stock: string
  location: string
}

export type ReadImportFileResult = {
  rows?: ImportFileRow[]
  // Названия складов, встреченные в файле (в порядке появления, без пустых).
  locations?: string[]
  error?: PriceStockFileErrorCode
}

const cell = (row: string[], index: number | null): string =>
  index === null ? "" : (row[index] ?? "").trim()

// Чтение файла в строки. Первая строка — заголовок: по нему находим колонки,
// остальные читаем по их номерам. Пустые строки пропускаем молча (Excel
// оставляет их после удаления позиций).
export const readImportFile = (text: string): ReadImportFileResult => {
  const table = parseTable(text)
  if (!table.length) {
    return { error: "empty_file" }
  }
  // Заголовок проверяем раньше пустоты: файл из одних чисел без шапки — это
  // «не нашли колонок», а не «пустой файл», и чинится он по-другому.
  const columns: ImportColumns | null = matchColumns(table[0])
  if (!columns) {
    return { error: "no_columns" }
  }
  if (table.length < 2) {
    return { error: "empty_file" }
  }
  if (table.length - 1 > PRICE_STOCK_IMPORT_MAX_ROWS) {
    return { error: "too_many_rows" }
  }

  const rows: ImportFileRow[] = []
  const locations: string[] = []
  for (let index = 1; index < table.length; index += 1) {
    const raw = table[index]
    if (raw.every((value) => !value.trim())) {
      continue
    }
    const location = cell(raw, columns.location)
    if (location && !locations.includes(location)) {
      locations.push(location)
    }
    rows.push({
      // Номер строки — как в Excel: заголовок первый, данные со второй.
      line: index + 1,
      sku: cell(raw, columns.sku),
      price: cell(raw, columns.price),
      stock: cell(raw, columns.stock),
      location,
    })
  }
  return { rows, locations }
}

export const normalizeSku = (sku: string): string => sku.trim().toLowerCase()

// Артикул → позиция каталога. Сверяем без учёта регистра: продавец правит файл
// руками, а артикул с коробки набирают как придётся.
export const indexBySku = (
  products: RawProduct[]
): Map<string, { product: RawProduct; variant: RawVariant }> => {
  const index = new Map<string, { product: RawProduct; variant: RawVariant }>()
  for (const product of products) {
    for (const variant of product.variants ?? []) {
      const sku = variant.sku?.trim()
      if (!sku || index.has(normalizeSku(sku))) {
        continue
      }
      index.set(normalizeSku(sku), { product, variant })
    }
  }
  return index
}

const rowTitle = (row: PriceStockRow): string =>
  row.variant_title && row.variant_title !== row.title
    ? `${row.title} — ${row.variant_title}`
    : row.title

// Предпросмотр: каждая строка файла — против текущего состояния каталога.
// В список попадают только строки с правкой и строки с проблемой: «не
// изменилось» продавцу перечислять незачем, довольно счётчика.
//
// scopeLocationId — склад, на который уедут остатки (разрез экрана или склад
// из файла). Без него позиция с несколькими складами остаток не принимает.
export const buildImportPreview = (
  fileRows: ImportFileRow[],
  catalog: Map<string, { product: RawProduct; variant: RawVariant }>,
  scopeLocationId: string | null,
  visibleLocationIds?: string[]
): PriceStockImportPreview => {
  const rows: PriceStockImportRow[] = []
  const changes: PriceStockChange[] = []
  const seen = new Set<string>()
  let unchanged = 0
  let issues = 0
  let truncated = false

  const push = (row: PriceStockImportRow) => {
    if (row.issue) {
      issues += 1
    }
    if (rows.length >= PRICE_STOCK_IMPORT_MAX_PREVIEW) {
      truncated = true
      return
    }
    rows.push(row)
  }

  for (const fileRow of fileRows) {
    const base: PriceStockImportRow = {
      line: fileRow.line,
      sku: fileRow.sku,
      title: null,
      variant_id: null,
      unit: null,
      old_price: null,
      new_price: null,
      old_stock: null,
      new_stock: null,
      issue: null,
    }

    if (!fileRow.sku) {
      push({ ...base, issue: "missing_sku" })
      continue
    }
    const key = normalizeSku(fileRow.sku)
    const found = catalog.get(key)
    if (seen.has(key)) {
      // Артикул дважды: обе правки считались бы от одного снимка, и остаток
      // сложился бы дважды (то же правило, что у партии с экрана). Название
      // показываем и здесь: артикул в файле продавец глазами не читает.
      push({
        ...base,
        title: found
          ? rowTitle(buildPriceStockRow(found.product, found.variant))
          : null,
        issue: "duplicate_sku",
      })
      continue
    }
    seen.add(key)

    if (!found) {
      push({ ...base, issue: "unknown_sku" })
      continue
    }

    const row = buildPriceStockRow(
      found.product,
      found.variant,
      scopeLocationId,
      visibleLocationIds
    )
    const known: PriceStockImportRow = {
      ...base,
      title: rowTitle(row),
      variant_id: row.variant_id,
      unit: row.unit,
      old_price: row.price,
      old_stock: row.stocked,
    }

    const price = parseAmountCell(fileRow.price, PRICE_STOCK_IMPORT_MAX_PRICE)
    if (price.error) {
      push({
        ...known,
        issue: price.error === "fraction" ? "fraction_price" : "bad_price",
      })
      continue
    }
    const stock = parseAmountCell(fileRow.stock, PRICE_STOCK_IMPORT_MAX_STOCK)
    if (stock.error) {
      push({
        ...known,
        issue: stock.error === "fraction" ? "fraction_stock" : "bad_stock",
      })
      continue
    }

    // Клетку, где стоит то же число, что и в каталоге, правкой не считаем:
    // продавец выгрузил весь срез, а поправил в нём десять строк.
    const newPrice = price.amount != null && price.amount !== row.price ? price.amount : null
    const newStock = stock.amount != null && stock.amount !== row.stocked ? stock.amount : null

    if (
      (newPrice != null && row.onec_fields.includes("price")) ||
      (newStock != null && row.onec_fields.includes("stock"))
    ) {
      push({
        ...known,
        new_price: newPrice,
        new_stock: newStock,
        issue: "onec_managed",
      })
      continue
    }
    if (newPrice != null && !row.price_editable) {
      push({ ...known, new_price: newPrice, issue: "price_rules" })
      continue
    }
    if (newStock != null && !row.stock_editable) {
      push({ ...known, new_stock: newStock, issue: "stock_not_managed" })
      continue
    }
    if (newStock != null && !row.location_id) {
      push({ ...known, new_stock: newStock, issue: "location_required" })
      continue
    }

    if (newPrice == null && newStock == null) {
      unchanged += 1
      continue
    }

    const change: PriceStockChange = { variant_id: row.variant_id }
    if (newPrice != null) {
      change.price = newPrice
    }
    if (newStock != null) {
      change.stock = newStock
      change.location_id = row.location_id as string
    }
    changes.push(change)
    push({ ...known, new_price: newPrice, new_stock: newStock })
  }

  return {
    rows,
    changes,
    summary: {
      rows: fileRows.length,
      changes: changes.length,
      unchanged,
      issues,
    },
    rows_truncated: truncated,
  }
}
