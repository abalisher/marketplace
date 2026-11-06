// Обмен таблицей для экрана «Цены и остатки» (T10.14c): чтение загруженного
// файла и сборка выгрузки. Здесь только формат — что такое «строка файла» и
// «число в клетке»; сверка с каталогом живёт в import.ts, запись — в роуте.
//
// Формат обмена — CSV с разделителем «;» и BOM: русский Excel открывает такой
// файл двойным щелчком и сохраняет обратно без мастера импорта. Своего разбора
// .xlsx не заводим — бинарный формат потянул бы зависимость ради одного экрана,
// а «Сохранить как → CSV» продавец делает одним пунктом меню.

// Разделитель выгрузки. При чтении разделитель определяем по файлу: продавец
// мог сохранить его из Excel другой локали (запятая) или из «Юникод-текста»
// (табуляция).
export const CSV_DELIMITER = ";"

const CANDIDATE_DELIMITERS = [";", "\t", ","]

// Кодировка загруженного файла. Русский Excel по умолчанию сохраняет CSV в
// ANSI (windows-1251), «CSV UTF-8» — с BOM, «Юникод-текст» — UTF-16LE с
// табуляцией. Все три обязаны читаться, иначе продавец получает «Ð¦ÐµÐ¼ÐµÐ½Ñ‚»
// вместо названий и не понимает, что сделал не так.
export const decodeUploadedText = (bytes: Uint8Array): string => {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xef &&
    bytes[1] === 0xbb &&
    bytes[2] === 0xbf
  ) {
    return new TextDecoder("utf-8").decode(bytes.subarray(3))
  }
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder("utf-16le").decode(bytes.subarray(2))
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder("utf-16be").decode(bytes.subarray(2))
  }
  try {
    // Строгий UTF-8: без BOM отличить его от однобайтовой кириллицы можно
    // только попыткой разбора — в windows-1251 те же байты валидными не будут.
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes)
  } catch {
    return new TextDecoder("windows-1251").decode(bytes)
  }
}

// Разделитель — тот, которого больше в первой строке. Считаем вне кавычек:
// название товара с запятой внутри кавычек не должно перевесить «;».
const sniffDelimiter = (line: string): string => {
  let quoted = false
  const counts = new Map<string, number>(
    CANDIDATE_DELIMITERS.map((delimiter) => [delimiter, 0])
  )
  for (const char of line) {
    if (char === '"') {
      quoted = !quoted
      continue
    }
    if (!quoted && counts.has(char)) {
      counts.set(char, (counts.get(char) ?? 0) + 1)
    }
  }
  let best = CSV_DELIMITER
  let bestCount = 0
  for (const delimiter of CANDIDATE_DELIMITERS) {
    const count = counts.get(delimiter) ?? 0
    if (count > bestCount) {
      best = delimiter
      bestCount = count
    }
  }
  return best
}

// Разбор CSV по RFC 4180: кавычки, удвоенные кавычки внутри значения, CRLF и
// LF. Строка «sep=;» первой строкой — метка Excel, а не данные.
export const parseTable = (text: string): string[][] => {
  let body = text
  let delimiter: string | null = null
  const sep = /^sep=(.)\r?\n/i.exec(body)
  if (sep) {
    delimiter = sep[1]
    body = body.slice(sep[0].length)
  }
  if (!body.trim()) {
    return []
  }
  const firstBreak = body.search(/\r?\n/)
  delimiter =
    delimiter ??
    sniffDelimiter(firstBreak === -1 ? body : body.slice(0, firstBreak))

  const rows: string[][] = []
  let row: string[] = []
  let cell = ""
  let quoted = false

  const endCell = () => {
    row.push(cell)
    cell = ""
  }
  const endRow = () => {
    endCell()
    rows.push(row)
    row = []
  }

  for (let i = 0; i < body.length; i += 1) {
    const char = body[i]
    if (quoted) {
      if (char === '"') {
        if (body[i + 1] === '"') {
          cell += '"'
          i += 1
        } else {
          quoted = false
        }
      } else {
        cell += char
      }
      continue
    }
    if (char === '"' && cell === "") {
      quoted = true
      continue
    }
    if (char === delimiter) {
      endCell()
      continue
    }
    if (char === "\n") {
      endRow()
      continue
    }
    if (char === "\r") {
      continue
    }
    cell += char
  }
  if (cell !== "" || row.length) {
    endRow()
  }

  // Хвостовые пустые строки файла (Excel всегда дописывает перевод строки) в
  // нумерацию попадать не должны.
  while (rows.length && rows[rows.length - 1].every((value) => !value.trim())) {
    rows.pop()
  }
  return rows
}

const csvCell = (value: string | number | null): string => {
  const text = value == null ? "" : String(value)
  return /["\r\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

// Сборка выгрузки. CRLF — чтобы файл открывался и в Excel, и в «Блокноте»;
// BOM дописывает роут (он же выставляет заголовки ответа).
export const serializeTable = (rows: (string | number | null)[][]): string =>
  rows.map((row) => row.map(csvCell).join(CSV_DELIMITER)).join("\r\n") + "\r\n"

// --- Колонки файла ---

export type ImportColumns = {
  sku: number
  price: number | null
  stock: number | null
  location: number | null
}

// Заголовок ищем по смыслу, а не по точному написанию: продавец правит файл
// руками, а Excel дописывает к «Цена, ₸» что угодно. Сравниваем по буквам и
// цифрам — «Цена, ₸», «цена» и «Price» сходятся в одно.
const normalizeHeader = (value: string): string =>
  value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9]/gi, "")

const HEADER_ALIASES: Record<keyof ImportColumns, string[]> = {
  sku: ["артикул", "артикултовара", "код", "кодтовара", "sku", "code"],
  price: ["цена", "ценатенге", "ценапродажи", "ценапродажитенге", "стоимость", "price"],
  stock: ["остаток", "количество", "колво", "stock", "quantity", "qty"],
  location: ["склад", "location", "warehouse"],
}

// Колонки файла по строке заголовка. Артикул обязателен — он ключ строки
// (технических id в файле нет намеренно: файл — то же рабочее место продавца,
// что и экран). Без цены и остатка править нечего.
export const matchColumns = (header: string[]): ImportColumns | null => {
  const normalized = header.map(normalizeHeader)
  const find = (key: keyof ImportColumns): number | null => {
    const index = normalized.findIndex((value) =>
      HEADER_ALIASES[key].includes(value)
    )
    return index === -1 ? null : index
  }
  const sku = find("sku")
  const price = find("price")
  const stock = find("stock")
  if (sku === null || (price === null && stock === null)) {
    return null
  }
  return { sku, price, stock, location: find("location") }
}

// --- Числа ---

export type AmountCellError = "not_number" | "fraction"

export type AmountCell = {
  amount: number | null
  error: AmountCellError | null
}

// Число из клетки файла. Пустая клетка — «не трогаем» (как пустое поле на
// экране), а не ноль. Excel отдаёт числа с разделителем разрядов и запятой:
// «2 600,00» — это 2600. Дробное число отвергаем, а не округляем: цена в тенге
// целая, и молча менять деньги продавца нельзя.
export const parseAmountCell = (raw: string, max: number): AmountCell => {
  // \s покрывает и неразрывный пробел (U+00A0), которым Excel делит разряды.
  const text = raw.replace(/[\s₸]/g, "")
  if (!text) {
    return { amount: null, error: null }
  }
  const match = /^(\d+)(?:[.,](\d+))?$/.exec(text)
  if (!match) {
    return { amount: null, error: "not_number" }
  }
  if (match[2] && /[1-9]/.test(match[2])) {
    return { amount: null, error: "fraction" }
  }
  const amount = Number(match[1])
  if (!Number.isSafeInteger(amount) || amount > max) {
    return { amount: null, error: "not_number" }
  }
  return { amount, error: null }
}
