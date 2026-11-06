// Разбор ответа HTTP-сервиса 1С «номенклатура с остатками» в позиции каталога.
//
// Формат ответа задаёт тот, кто писал сервис в конкретной базе, и у разных
// компаний он разный: ключи по-русски («Наименование», «Остаток») или
// по-английски, список в корне или под ключом, единица строкой или объектом,
// остаток числом или по складам. Поэтому разбор терпимый: поле ищется по
// списку синонимов, вложенный объект сводится к его наименованию, остатки по
// складам складываются. Что именно нашлось, разбор сообщает (fields) — экран
// проверки подключения показывает это, и по нему видно, если 1С назвала
// поле так, что синонимы его не знают.
//
// Чистая функция без обращений к базе: покрыта unit-тестами.

import { MedusaError } from "@medusajs/framework/utils"

export type OnecItem = {
  // Устойчивый ключ позиции: GUID ссылки, иначе код, иначе артикул.
  key: string
  code: string | null
  article: string | null
  name: string
  description: string | null
  unit: string | null
  // Цена продажи в тенге; null — 1С цену не передала.
  price: number | null
  // Остаток (сумма по складам, если 1С отдала их списком); null — не передала.
  stock: number | null
  // Себестоимость единицы (учётная цена 1С); null — не передала.
  cost: number | null
  barcode: string | null
  group: string | null
}

export type OnecParseIssue = {
  index: number
  key: string | null
  name: string | null
  message: string
}

export type OnecField =
  | "key"
  | "code"
  | "article"
  | "name"
  | "description"
  | "unit"
  | "price"
  | "stock"
  | "barcode"
  | "group"
  // Учётная цена (себестоимость) — не цена продажи; из неё цена продажи
  // не получается: её ставит продавец («Себестоимость» — только справка).
  | "cost"

export type OnecParseResult = {
  items: OnecItem[]
  issues: OnecParseIssue[]
  // Сколько записей было в ответе (вместе с пропущенными группами и браком).
  total: number
  // Под каким ключом ответа нашлось каждое поле (по первым записям).
  fields: Partial<Record<OnecField, string>>
}

// Ключи сравниваются без регистра, пробелов, подчёркиваний и дефисов, «ё» = «е».
const normalizeKey = (key: string): string =>
  key.toLowerCase().replace(/ё/g, "е").replace(/[\s_\-.]+/g, "")

// Синонимы полей в порядке предпочтения.
const ALIASES: Record<OnecField, string[]> = {
  key: [
    "guid",
    "uuid",
    "ref",
    "refkey",
    "ссылка",
    "уид",
    "уникальныйидентификатор",
    "идентификатор",
    "guidноменклатуры",
    "id",
  ],
  code: ["код", "code", "kod", "кодноменклатуры", "itemcode", "кодтовара"],
  article: ["артикул", "article", "artikul", "sku", "vendorcode", "partnumber"],
  name: [
    "наименование",
    "name",
    "title",
    "item",
    "itemname",
    "номенклатура",
    "товар",
    "наименованиеполное",
    "полноенаименование",
    "fullname",
    "наименованиетовара",
    "наименованиеноменклатуры",
  ],
  description: ["описание", "description", "комментарий", "comment"],
  unit: [
    "единицаизмерения",
    "единица",
    "едизм",
    "ед",
    "базоваяединицаизмерения",
    "unit",
    "unitname",
    "measure",
    "uom",
  ],
  price: [
    "цена",
    "ценапродажи",
    "розничнаяцена",
    "ценарозничная",
    "ценарозница",
    "price",
    "retailprice",
    "цены",
    "prices",
  ],
  stock: [
    "остаток",
    "остатки",
    "свободныйостаток",
    "вналичии",
    "количество",
    "stock",
    "quantity",
    "qty",
    "balance",
    "склады",
    "warehouses",
    "колво",
    "остатокнаскладе",
    "конечныйостаток",
  ],
  barcode: ["штрихкод", "barcode", "ean", "ean13"],
  group: [
    "группа",
    "родитель",
    "категория",
    "видноменклатуры",
    "group",
    "parent",
    "category",
  ],
  cost: [
    "rate",
    "valuationrate",
    "учетнаяцена",
    "себестоимость",
    "costprice",
    "cost",
    "закупочнаяцена",
    "ценазакупа",
    "ценазакупки",
    "закуп",
    "закупка",
    "закупочная",
    "ценазакупочная",
    "входящаяцена",
  ],
}

// Какое поле позиции означает заголовок колонки (Excel-файл компании): те же
// синонимы, что у ключей ответа 1С. null — колонка не узнана.
//
// Заголовки в файлах пишут вольно («Цена, тг», «Остаток (шт)», «Кол-во»):
// скобки, знаки и хвост с единицей («тг», «₸», «шт») не учитываются.
export const normalizeHeader = (header: string): string =>
  header
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/\([^)]*\)/g, "")
    .replace(/[^a-zа-я0-9]/g, "")
    .replace(/(тенге|тг|kzt|шт)$/, "")

export const onecFieldOfHeader = (header: string): OnecField | null => {
  const normalized = normalizeHeader(header)
  if (!normalized) {
    return null
  }
  for (const field of Object.keys(ALIASES) as OnecField[]) {
    if (ALIASES[field].includes(normalized)) {
      return field
    }
  }
  return null
}

// Признак записи-группы (папки справочника) и пометки удаления: такие записи —
// не товары.
const FOLDER_KEYS = ["этогруппа", "isfolder", "folder"]
const DELETED_KEYS = ["пометкаудаления", "deletionmark", "deleted"]
// Услуга (комиссия банка, питание, обучение) — не товар витрины. В 1С её видно
// по признаку «услуга» или по единице «Одна услуга».
const SERVICE_KEYS = ["услуга", "этоуслуга", "isservice", "service"]
const SERVICE_UNIT = /услуг/i
// Ключ «id» в выгрузке номенклатуры 1С — обычно код позиции («00000000282»).
const ID_KEYS = ["id"]

// Под какими ключами 1С обычно кладёт сам список позиций.
const LIST_KEYS = [
  "items",
  "товары",
  "номенклатура",
  "data",
  "result",
  "результат",
  "данные",
  "value",
  "rows",
  "goods",
  "products",
]

type Row = Record<string, unknown>

const isRow = (value: unknown): value is Row =>
  !!value && typeof value === "object" && !Array.isArray(value)

const findKey = (row: Row, aliases: string[]): string | null => {
  const byNormalized = new Map<string, string>()
  for (const key of Object.keys(row)) {
    const normalized = normalizeKey(key)
    if (!byNormalized.has(normalized)) {
      byNormalized.set(normalized, key)
    }
  }
  for (const alias of aliases) {
    const key = byNormalized.get(alias)
    if (key !== undefined) {
      return key
    }
  }
  return null
}

// Вложенный объект 1С (ссылка на справочник) сводится к его наименованию.
const PRESENTATION_KEYS = [
  "наименование",
  "name",
  "представление",
  "presentation",
  "title",
  "код",
  "code",
]

const toText = (value: unknown): string | null => {
  if (value == null) {
    return null
  }
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed ? trimmed : null
  }
  if (typeof value === "number" || typeof value === "bigint") {
    return String(value)
  }
  if (isRow(value)) {
    const key = findKey(value, PRESENTATION_KEYS)
    return key ? toText(value[key]) : null
  }
  return null
}

// «1 234,50» (пробелы и неразрывные пробелы как разделитель тысяч, запятая как
// десятичная) → 1234.5. Не число — null.
export const parseOnecNumber = (value: unknown): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null
  }
  if (typeof value !== "string") {
    return null
  }
  const clean = value
    .replace(/[\s  ]/g, "")
    .replace(/₸|тг\.?|kzt/gi, "")
    .replace(",", ".")
  if (!clean || !/^-?\d+(\.\d+)?$/.test(clean)) {
    return null
  }
  const parsed = Number(clean)
  return Number.isFinite(parsed) ? parsed : null
}

const NUMBER_KEYS_FOR_STOCK = [
  "остаток",
  "свободныйостаток",
  "количество",
  "quantity",
  "qty",
  "stock",
  "balance",
]
const NUMBER_KEYS_FOR_PRICE = ["цена", "price", "сумма", "amount", "value"]
const PRICE_KIND_KEYS = ["видцены", "типцены", "pricetype", "type", "kind", "name"]

// Остаток: число, строка-число, объект { Остаток } или список складов —
// тогда сумма по складам.
const toStock = (value: unknown): number | null => {
  const direct = parseOnecNumber(value)
  if (direct != null) {
    return direct
  }
  if (Array.isArray(value)) {
    let sum: number | null = null
    for (const entry of value) {
      const part = toStock(entry)
      if (part != null) {
        sum = (sum ?? 0) + part
      }
    }
    return sum
  }
  if (isRow(value)) {
    const key = findKey(value, NUMBER_KEYS_FOR_STOCK)
    return key ? toStock(value[key]) : null
  }
  return null
}

// Цена: число, строка-число или список видов цен — тогда розничная, иначе первая.
const toPrice = (value: unknown): number | null => {
  const direct = parseOnecNumber(value)
  if (direct != null) {
    return direct
  }
  if (Array.isArray(value)) {
    const entries = value.filter(isRow)
    const retail = entries.find((entry) => {
      const kindKey = findKey(entry, PRICE_KIND_KEYS)
      const kind = kindKey ? toText(entry[kindKey]) : null
      return !!kind && /розн|retail/i.test(kind)
    })
    for (const entry of retail ? [retail] : entries) {
      const price = toPrice(entry)
      if (price != null) {
        return price
      }
    }
    return null
  }
  if (isRow(value)) {
    const key = findKey(value, NUMBER_KEYS_FOR_PRICE)
    return key ? toPrice(value[key]) : null
  }
  return null
}

const toFlag = (value: unknown): boolean => {
  if (typeof value === "boolean") {
    return value
  }
  if (typeof value === "string") {
    return /^(true|да|1|yes)$/i.test(value.trim())
  }
  return value === 1
}

// Список позиций в ответе: массив в корне, массив под известным ключом, любой
// единственный массив объектов среди полей или объект «код → позиция».
export const locateOnecList = (payload: unknown): unknown[] | null => {
  if (Array.isArray(payload)) {
    return payload
  }
  if (!isRow(payload)) {
    return null
  }
  const key = findKey(payload, LIST_KEYS)
  if (key && Array.isArray(payload[key])) {
    return payload[key] as unknown[]
  }
  if (key && isRow(payload[key])) {
    return locateOnecList(payload[key])
  }
  const arrays = Object.values(payload).filter(
    (value): value is unknown[] =>
      Array.isArray(value) && value.some((entry) => isRow(entry))
  )
  if (arrays.length === 1) {
    return arrays[0]
  }
  const values = Object.values(payload)
  if (values.length && values.every(isRow)) {
    return Object.entries(payload).map(([mapKey, value]) => ({
      __map_key: mapKey,
      ...(value as Row),
    }))
  }
  return null
}

// Запись вида { Номенклатура: { Код, Наименование, … }, Остаток, Цена }
// (типичная выборка из регистра) раскрывается: поля позиции поднимаются на
// верхний уровень, а свои поля записи (остаток, цена) их перекрывают.
const NESTED_ITEM_KEYS = ["номенклатура", "товар", "item", "product"]

const flattenNested = (row: Row): Row => {
  const key = findKey(row, NESTED_ITEM_KEYS)
  if (!key || !isRow(row[key])) {
    return row
  }
  const { [key]: nested, ...rest } = row
  return { ...(nested as Row), ...rest }
}

// Деньги до копеек; ноль и минус — «нет значения».
const positiveMoney = (value: number | null): number | null =>
  value != null && value > 0 ? Math.round(value * 100) / 100 : null

const MAX_ISSUES = 100

export const parseOnecItems = (payload: unknown): OnecParseResult => {
  const list = locateOnecList(payload)
  if (!list) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "В ответе 1С не найден список номенклатуры (ожидался массив позиций)"
    )
  }

  const items: OnecItem[] = []
  const issues: OnecParseIssue[] = []
  const fields: Partial<Record<OnecField, string>> = {}
  const seen = new Set<string>()
  const issue = (entry: OnecParseIssue) => {
    if (issues.length < MAX_ISSUES) {
      issues.push(entry)
    }
  }

  list.forEach((entry, index) => {
    if (!isRow(entry)) {
      issue({ index, key: null, name: null, message: "Запись — не объект" })
      return
    }
    const raw = flattenNested(entry)

    const pick = (field: OnecField): unknown => {
      const key = findKey(raw, ALIASES[field])
      if (key == null) {
        return undefined
      }
      if (!fields[field]) {
        fields[field] = key
      }
      return raw[key]
    }

    const folderKey = findKey(raw, FOLDER_KEYS)
    if (folderKey && toFlag(raw[folderKey])) {
      return
    }
    const deletedKey = findKey(raw, DELETED_KEYS)
    if (deletedKey && toFlag(raw[deletedKey])) {
      return
    }

    const serviceKey = findKey(raw, SERVICE_KEYS)
    const unit = toText(pick("unit"))
    if ((serviceKey && toFlag(raw[serviceKey])) || (unit && SERVICE_UNIT.test(unit))) {
      return
    }

    // «Наименование» в 1С ограничено сотней знаков и бывает обрезано («…36 па»),
    // а полное наименование лежит в описании. Описание, которое лишь повторяет
    // название (или продолжает его), описанием не считаем — берём его как
    // название.
    let name = toText(pick("name"))
    let description = toText(pick("description"))
    if (name && description) {
      if (description === name) {
        description = null
      } else if (description.startsWith(name)) {
        name = description
        description = null
      }
    }
    const idKey = findKey(raw, ID_KEYS)
    const code =
      toText(pick("code")) ?? (idKey ? toText(raw[idKey]) : null)
    const article = toText(pick("article"))
    const guid = toText(pick("key")) ?? toText(raw.__map_key)
    const key = guid ?? code ?? article

    if (!name) {
      issue({ index, key, name: null, message: "Нет наименования — пропущено" })
      return
    }
    if (!key) {
      issue({
        index,
        key: null,
        name,
        message: "Нет ни GUID, ни кода, ни артикула — позицию не с чем связать",
      })
      return
    }
    if (seen.has(key)) {
      issue({ index, key, name, message: "Повтор позиции — взята первая" })
      return
    }
    seen.add(key)

    const price = toPrice(pick("price"))
    const stock = toStock(pick("stock"))

    items.push({
      key,
      code,
      article,
      name,
      description,
      unit,
      price: price != null && price >= 0 ? Math.round(price * 100) / 100 : null,
      stock,
      cost: positiveMoney(parseOnecNumber(pick("cost"))),
      barcode: toText(pick("barcode")),
      group: toText(pick("group")),
    })
  })

  return { items, issues, total: list.length, fields }
}

// --- Остатки и цены отдельным сервисом ---

// Строка выгрузки остатков: позиция (по ключу, коду или артикулу) и её остаток
// и/или цена. Названия здесь не требуются — позицию уже знает номенклатура.
export type OnecBalance = {
  key: string | null
  code: string | null
  article: string | null
  stock: number | null
  price: number | null
  // Учётная цена за единицу (себестоимость).
  cost: number | null
}

export type OnecBalancesResult = {
  balances: OnecBalance[]
  total: number
  fields: Partial<Record<OnecField, string>>
}

export const parseOnecBalances = (payload: unknown): OnecBalancesResult => {
  const list = locateOnecList(payload)
  if (!list) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "В ответе 1С не найден список остатков (ожидался массив позиций)"
    )
  }
  const fields: Partial<Record<OnecField, string>> = {}
  const balances: OnecBalance[] = []
  for (const entry of list) {
    if (!isRow(entry)) {
      continue
    }
    const raw = flattenNested(entry)
    const pick = (field: OnecField): unknown => {
      const key = findKey(raw, ALIASES[field])
      if (key == null) {
        return undefined
      }
      if (!fields[field]) {
        fields[field] = key
      }
      return raw[key]
    }
    const idKey = findKey(raw, ID_KEYS)
    const code = toText(pick("code")) ?? (idKey ? toText(raw[idKey]) : null)
    const article = toText(pick("article"))
    const key = toText(pick("key")) ?? toText(raw.__map_key)
    if (!key && !code && !article) {
      continue
    }
    const price = toPrice(pick("price"))
    const cost = parseOnecNumber(pick("cost"))
    balances.push({
      key,
      code,
      article,
      stock: toStock(pick("stock")),
      price: price != null && price >= 0 ? Math.round(price * 100) / 100 : null,
      cost: positiveMoney(cost),
    })
  }
  return { balances, total: list.length, fields }
}

// Свести остатки и цены с номенклатурой по ключу, коду или артикулу. Остатки
// по складам одной позиции складываются. Позиции номенклатуры, которой нет в
// выгрузке остатков, получают остаток 0 (на складе её нет); цена у неё
// остаётся из номенклатуры. Возвращает сводные позиции и сколько из них нашлось
// в остатках.
//
// Цена продажи — только явная цена выгрузки; учётная цена (себестоимость) ценой
// продажи не становится — цену ставит продавец. Учётные цены одной позиции на
// разных складах бывают разными; для справки берём наибольшую.
export const mergeOnecBalances = (
  items: OnecItem[],
  balances: OnecBalance[]
): { items: OnecItem[]; matched: number } => {
  const index = new Map<
    string,
    { stock: number | null; price: number | null; cost: number | null }
  >()
  const add = (id: string | null, balance: OnecBalance) => {
    if (!id) {
      return
    }
    const current = index.get(id)
    index.set(id, {
      stock:
        balance.stock == null
          ? current?.stock ?? null
          : (current?.stock ?? 0) + balance.stock,
      price: balance.price ?? current?.price ?? null,
      cost:
        balance.cost == null
          ? current?.cost ?? null
          : Math.max(balance.cost, current?.cost ?? 0),
    })
  }
  for (const balance of balances) {
    // Одна строка остатков — под всеми своими идентификаторами, но не дважды
    // под одним и тем же (GUID и код бывают равны).
    const ids = new Set(
      [balance.key, balance.code, balance.article].filter((id): id is string => !!id)
    )
    ids.forEach((id) => add(id, balance))
  }

  let matched = 0
  const merged = items.map((item) => {
    const found =
      index.get(item.key) ??
      (item.code ? index.get(item.code) : undefined) ??
      (item.article ? index.get(item.article) : undefined)
    if (found) {
      matched += 1
    }
    return {
      ...item,
      stock: found ? found.stock ?? 0 : 0,
      price: found?.price ?? item.price,
      cost: found?.cost ?? item.cost,
    }
  })
  return { items: merged, matched }
}
