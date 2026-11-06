// Каталог компании из Excel-файла: у компании нет 1С, номенклатуру, цены и
// остатки она присылает таблицей (.xlsx, .xls или .csv). Файл сводится к тем же
// позициям, что и ответ HTTP-сервиса 1С (parseOnecItems), и дальше идёт тем же
// путём — план, создание товаров, цены, остатки, снятие пропавших
// (lib/onec/sync.ts).
//
// Таблицы присылают как есть, из 1С или руками: над заголовками бывает шапка
// («Остатки товаров на 22.10.2026»), снизу — «Итого», колонки называются
// по-разному. Поэтому строка заголовков ищется среди первых строк листа по
// узнанным колонкам (onecFieldOfHeader), а лист — первый, где она нашлась.
//
// Чистая функция без обращений к базе: покрыта unit-тестами.

import { MedusaError } from "@medusajs/framework/utils"
import * as XLSX from "xlsx"
import { decodeUploadedText, parseTable } from "../../api/admin/price-stock/csv"
import {
  OnecField,
  OnecItem,
  normalizeHeader,
  onecFieldOfHeader,
  parseOnecItems,
} from "./parse-items"

export const ONEC_FILE_MAX_BYTES = 10 * 1024 * 1024
export const ONEC_FILE_MAX_ROWS = 20000
export const ONEC_FILE_EXTENSIONS = [".xlsx", ".xls", ".csv"] as const

// Сколько первых строк листа просматривать в поисках заголовков.
const HEADER_SCAN_ROWS = 30

// Под каким ключом поле кладётся в запись для parseOnecItems — первый синоним
// поля, который разбор заведомо узнаёт.
const CANONICAL_KEY: Record<OnecField, string> = {
  key: "guid",
  code: "код",
  article: "артикул",
  name: "наименование",
  description: "описание",
  unit: "единицаизмерения",
  price: "цена",
  stock: "остаток",
  barcode: "штрихкод",
  group: "группа",
  cost: "себестоимость",
  brand: "бренд",
}

// Колонки, которые дополняют наименование. В прайсах одно «Бур по бетону» —
// десятки строк, различает их «Характеристика» (6*110, 8*160) и бренд
// отдельной колонкой (поле brand, синонимы — в parse-items). Без них позиции
// слились бы в одну: товар на витрине — «Бур по бетону DUHENG MAX 6*110».
const VARIANT_HEADERS = [
  "характеристика",
  "характеристики",
  "характеристиканоменклатуры",
  "размер",
  "модификация",
  "вариант",
  "параметры",
  "типоразмер",
]

// Строки-итоги внизу таблицы — не товары.
// \b в JS без флага u кириллицу буквой не считает — граница слова задана явно.
const TOTAL_ROW = /^(итого|всего|total)(?![\p{L}\p{N}])/iu

export type OnecFileFeed = {
  items: OnecItem[]
  total: number
  // Поле позиции ← заголовок колонки в файле, как он написан.
  fields: Partial<Record<OnecField, string>>
  issues: { key: string | null; name: string | null; message: string }[]
  stock: null
  duration_ms: number
  bytes: number
  sheet: string
  header_row: number
  // Колонки, дописанные к наименованию («Бренд», «Характеристика»), как они
  // названы в файле.
  name_parts: string[]
}

type Cell = string | number | boolean | Date | null

const cellText = (cell: Cell): string =>
  cell == null ? "" : String(cell).trim()

// Поле колонки по заголовку. «ID» в выгрузках номенклатуры — код позиции
// (как ключ «id» в ответе 1С).
const fieldOfHeader = (header: string): OnecField | null => {
  if (/^id$/i.test(header.trim())) {
    return "code"
  }
  return onecFieldOfHeader(header)
}

type HeaderMatch = {
  row: number
  columns: Map<number, OnecField>
  brand: number | null
  variant: number | null
}

// Строка заголовков: в ней есть «Наименование» и ещё хотя бы одно узнанное
// поле. Первое вхождение поля выигрывает — вторая «цена» (оптовая рядом с
// розничной) остаётся неузнанной колонкой.
const findHeader = (rows: Cell[][]): HeaderMatch | null => {
  const limit = Math.min(rows.length, HEADER_SCAN_ROWS)
  for (let row = 0; row < limit; row++) {
    const columns = new Map<number, OnecField>()
    const taken = new Set<OnecField>()
    rows[row].forEach((cell, column) => {
      const field = fieldOfHeader(cellText(cell))
      if (field && !taken.has(field)) {
        taken.add(field)
        columns.set(column, field)
      }
    })
    if (taken.has("name") && taken.size >= 2) {
      const extra = (headers: string[]) => {
        const column = rows[row].findIndex(
          (cell, index) =>
            !columns.has(index) && headers.includes(normalizeHeader(cellText(cell)))
        )
        return column < 0 ? null : column
      }
      const brand = [...columns].find(([, field]) => field === "brand")?.[0] ?? null
      return { row, columns, brand, variant: extra(VARIANT_HEADERS) }
    }
  }
  return null
}

type Sheet = { name: string; rows: Cell[][]; firstRow: number }

// Листы файла строками ячеек. CSV читаем своим разбором «Цен и остатков»: он
// узнаёт кодировку (UTF-8, UTF-16, Windows-1251 — так CSV сохраняет русский
// Excel) и разделитель, а SheetJS прочитал бы кириллицу как латиницу.
const readSheets = (buffer: Buffer, extension: string): Sheet[] => {
  if (extension === ".csv") {
    return [{ name: "CSV", rows: parseTable(decodeUploadedText(buffer)), firstRow: 0 }]
  }
  let workbook: XLSX.WorkBook
  try {
    workbook = XLSX.read(buffer, { type: "buffer", cellDates: true, dense: true })
  } catch {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Файл не читается как таблица Excel — сохраните его заново как .xlsx"
    )
  }
  return workbook.SheetNames.map((name) => {
    const sheet = workbook.Sheets[name]
    // Пустые строки оставляем: номер строки заголовков должен совпасть с тем,
    // что видно в Excel.
    const rows = XLSX.utils.sheet_to_json<Cell[]>(sheet, {
      header: 1,
      raw: true,
      defval: null,
      blankrows: true,
    })
    const firstRow = sheet["!ref"] ? XLSX.utils.decode_range(sheet["!ref"]).s.r : 0
    return { name, rows, firstRow }
  })
}

// Наименование + бренд (если его ещё нет в наименовании) + характеристика.
const composeName = (name: string, brand: string, variant: string): string => {
  if (!name) {
    return name
  }
  const withBrand =
    brand && !name.toLowerCase().includes(brand.toLowerCase()) ? `${name} ${brand}` : name
  return variant && !withBrand.toLowerCase().endsWith(variant.toLowerCase())
    ? `${withBrand} ${variant}`
    : withBrand
}

const extensionOf = (fileName: string): string =>
  (/\.[^.]+$/.exec(fileName.toLowerCase())?.[0] ?? "")

export const readOnecFile = (
  buffer: Buffer,
  fileName: string
): OnecFileFeed => {
  const started = Date.now()
  const extension = extensionOf(fileName)
  if (!(ONEC_FILE_EXTENSIONS as readonly string[]).includes(extension)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Нужен файл Excel (.xlsx, .xls) или .csv"
    )
  }
  if (buffer.length > ONEC_FILE_MAX_BYTES) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Файл больше 10 МБ — разделите его или уберите лишние листы"
    )
  }

  for (const { name: sheetName, rows, firstRow } of readSheets(buffer, extension)) {
    const header = findHeader(rows)
    if (!header) {
      continue
    }

    const headerRow = rows[header.row]
    const fields: Partial<Record<OnecField, string>> = {}
    header.columns.forEach((field, column) => {
      fields[field] = cellText(headerRow[column])
    })
    const nameParts = [header.brand, header.variant].filter(
      (column): column is number => column !== null
    )
    // Нет ни кода, ни артикула — позиции связываем по наименованию: иначе
    // файл не с чем было бы сверять при следующей загрузке. Код такой позиции
    // синхронизация присваивает сама — порядковым номером (assignFileCodes).
    // То же для отдельной строки с пустой клеткой кода в файле, где колонка
    // кода есть: раньше такая строка отбрасывалась.
    const byName = !fields.code && !fields.article && !fields.key
    const idKeys = [CANONICAL_KEY.key, CANONICAL_KEY.code, CANONICAL_KEY.article]
    let withoutCode = 0

    const body = rows.slice(header.row + 1)
    if (body.length > ONEC_FILE_MAX_ROWS) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `В файле больше ${ONEC_FILE_MAX_ROWS} строк — разделите его`
      )
    }
    const records: Record<string, unknown>[] = []
    for (const row of body) {
      const record: Record<string, unknown> = {}
      header.columns.forEach((field, column) => {
        const cell = row[column]
        record[CANONICAL_KEY[field]] =
          cell instanceof Date ? cell.toISOString().slice(0, 10) : cell
      })
      if (!Object.values(record).some((value) => cellText(value as Cell))) {
        continue
      }
      if (nameParts.length) {
        record[CANONICAL_KEY.name] = composeName(
          cellText(record[CANONICAL_KEY.name] as Cell),
          header.brand === null ? "" : cellText(row[header.brand]),
          header.variant === null ? "" : cellText(row[header.variant])
        )
      }
      const name = cellText(record[CANONICAL_KEY.name] as Cell)
      if (TOTAL_ROW.test(name)) {
        continue
      }
      if (name && !idKeys.some((id) => cellText(record[id] as Cell))) {
        record.__map_key = name
        withoutCode += 1
      }
      records.push(record)
    }

    const parsed = parseOnecItems(records)
    const issues = parsed.issues.map(({ key, name, message }) => ({
      key,
      name,
      message,
    }))
    if (byName) {
      issues.unshift({
        key: null,
        name: null,
        message:
          "В файле нет колонки «Код» или «Артикул» — коды присвоены автоматически (порядковые номера), позиции связаны по наименованию: переименованная в файле позиция станет новым товаром",
      })
    } else if (withoutCode) {
      issues.unshift({
        key: null,
        name: null,
        message: `У ${withoutCode} строк не заполнен код — коды присвоены автоматически (порядковые номера), такие позиции связаны по наименованию`,
      })
    }

    // Себестоимость ценой продажи не становится: цену ставит продавец.
    const items = parsed.items
    if (fields.cost && !fields.price) {
      issues.unshift({
        key: null,
        name: null,
        message:
          "В файле есть себестоимость, но нет цены продажи — цены на витрине задаст продавец",
      })
    }

    return {
      items,
      total: records.length,
      fields,
      name_parts: nameParts.map((column) => cellText(headerRow[column])),
      issues,
      stock: null,
      duration_ms: Date.now() - started,
      bytes: buffer.length,
      sheet: sheetName,
      // Номер строки, как его показывает Excel.
      header_row: firstRow + header.row + 1,
    }
  }

  throw new MedusaError(
    MedusaError.Types.INVALID_DATA,
    "Не нашли строку заголовков: нужна колонка «Наименование» и хотя бы одна из «Код», «Артикул», «Остаток», «Цена»"
  )
}
