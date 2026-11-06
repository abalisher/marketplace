// DTO обмена файлом на экране «Цены и остатки» (T10.14c) и подписи к нему.
// Типы продублированы из бэкенда намеренно: код сервера в браузерный бандл не
// импортируем (см. src/admin/README.md).
//
// Загрузка идёт в два шага: файл → предпросмотр (`POST /admin/price-stock/import`,
// он ничего не пишет) → та же кнопка «Применить», что и у правки в клетке
// (`POST /admin/price-stock` с `source: "import"`). Экран здесь ничего не
// решает: партию собирает ресурс, экран её показывает и отправляет обратно.

import { AdminPriceStockChange } from "./price-stock"

export type PriceStockFileErrorCode =
  | "empty_file"
  | "no_columns"
  | "too_many_rows"
  | "mixed_locations"
  | "unknown_location"
  | "location_mismatch"
  | "too_many_changes"

export type PriceStockImportIssueCode =
  | "missing_sku"
  | "unknown_sku"
  | "duplicate_sku"
  | "bad_price"
  | "fraction_price"
  | "bad_stock"
  | "fraction_stock"
  | "price_rules"
  | "stock_not_managed"
  | "location_required"
  | "onec_managed"

// Строка предпросмотра. line — номер строки В ФАЙЛЕ: проблемную строку продавец
// правит в Excel и должен найти её там же, а не «где-то среди пятидесяти».
export type AdminPriceStockImportRow = {
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

export type AdminPriceStockImportResponse = {
  rows: AdminPriceStockImportRow[]
  // Готовая партия: экран отправляет её как есть, ничего не пересобирая.
  changes: AdminPriceStockChange[]
  summary: {
    rows: number
    changes: number
    unchanged: number
    issues: number
  }
  rows_truncated: boolean
  location_id: string | null
  location_name: string | null
  scan_capped: boolean
}

// Файл не принят целиком — ни предпросмотра, ни записи.
export type PriceStockFileError = {
  message: string
  code: PriceStockFileErrorCode | null
}

// Подписи причин — i18n-ключи (конвенция панели: реестр в lib, перевод в JSON).
export const PRICE_STOCK_FILE_ERROR_LABELS: Record<
  PriceStockFileErrorCode,
  string
> = {
  empty_file: "priceStock.fileError.emptyFile",
  no_columns: "priceStock.fileError.noColumns",
  too_many_rows: "priceStock.fileError.tooManyRows",
  mixed_locations: "priceStock.fileError.mixedLocations",
  unknown_location: "priceStock.fileError.unknownLocation",
  location_mismatch: "priceStock.fileError.locationMismatch",
  too_many_changes: "priceStock.fileError.tooManyChanges",
}

export const PRICE_STOCK_IMPORT_ISSUE_LABELS: Record<
  PriceStockImportIssueCode,
  string
> = {
  missing_sku: "priceStock.importIssue.missingSku",
  unknown_sku: "priceStock.importIssue.unknownSku",
  duplicate_sku: "priceStock.importIssue.duplicateSku",
  bad_price: "priceStock.importIssue.badPrice",
  fraction_price: "priceStock.importIssue.fractionPrice",
  bad_stock: "priceStock.importIssue.badStock",
  fraction_stock: "priceStock.importIssue.fractionStock",
  price_rules: "priceStock.importIssue.priceRules",
  stock_not_managed: "priceStock.importIssue.stockNotManaged",
  location_required: "priceStock.importIssue.locationRequired",
  onec_managed: "priceStock.importIssue.onecManaged",
}

// Что показываем в клетке предпросмотра: «было → станет» либо прочерк, если
// эту величину файл не трогает. Пара нужна и в строке-проблеме (продавец
// видит, какое число не приняли), поэтому считается отдельно от issue.
export const importCellChanged = (
  row: AdminPriceStockImportRow,
  field: "price" | "stock"
): boolean =>
  field === "price" ? row.new_price != null : row.new_stock != null

// Имя выгружаемого файла. Дату ставим на стороне экрана: в «Загрузках» их
// накапливается несколько, и различает продавец их по дате.
export const priceStockExportFileName = (date: Date): string =>
  `price-stock-${date.toISOString().slice(0, 10)}.csv`
