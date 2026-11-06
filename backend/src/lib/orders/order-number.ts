import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// Номер заказа для людей: «ORG-26-0007» — код компании, год (две цифры) и
// порядковый номер внутри компании за этот год. Компания видит свои заказы
// подряд, без дыр от чужих; по номеру ясно, чей заказ и какого года; с 1 января
// счёт начинается заново. Числовой display_id ядра остаётся техническим.
//
// Заказ площадки (без компании) — код SM. Код компании — tenant.order_prefix.

export const PLATFORM_ORDER_PREFIX = "SM"
export const ORDER_PREFIX_PATTERN = /^[A-Z]{2,4}$/

// Сутки и год — по Астане (UTC+5): заказ в 23:30 31 декабря — ещё прошлый год.
const ASTANA_OFFSET_MS = 5 * 60 * 60 * 1000

export const orderNumberYear = (now: Date): number =>
  new Date(now.getTime() + ASTANA_OFFSET_MS).getUTCFullYear()

export const formatOrderNumber = (prefix: string, year: number, seq: number): string =>
  `${prefix}-${String(year % 100).padStart(2, "0")}-${String(seq).padStart(4, "0")}`

// Подпись заказа: новый номер, а у заказа без него (до 2026-11-02) — «№5».
export const orderLabel = (
  number: string | null | undefined,
  displayId?: number | null
): string => number || (displayId != null ? `№${displayId}` : "")

// Следующий номер компании за год: один атомарный upsert в счётчик — два
// одновременных заказа не получат один номер. Дыра (заказ откатился после
// выдачи номера) допустима: номер не переиспользуется.
export const nextOrderNumber = async (
  container: MedusaContainer,
  prefix: string,
  now: Date = new Date()
): Promise<string> => {
  const year = orderNumberYear(now)
  const db = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const result = await db.raw(
    `insert into order_number_sequence (key, value, updated_at)
     values (?, 1, now())
     on conflict (key) do update
       set value = order_number_sequence.value + 1, updated_at = now()
     returning value`,
    [`${prefix}:${year}`]
  )
  const value = Number((result as { rows: { value: number }[] }).rows[0].value)
  return formatOrderNumber(prefix, year, value)
}

// Номера заказов по их id (жизненный цикл ↔ заказ — link-таблица). Нет номера —
// заказа нет в карте: подпись соберёт orderLabel из display_id.
export const loadOrderNumbers = async (
  container: MedusaContainer,
  orderIds: string[]
): Promise<Map<string, string>> => {
  const ids = [...new Set(orderIds.filter(Boolean))]
  if (!ids.length) {
    return new Map()
  }
  const db = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const rows = (await db
    .select("l.order_id", "lc.number")
    .from({ l: "order_order_order_lifecycle_order_lifecycle" })
    .join({ lc: "order_lifecycle" }, "lc.id", "l.order_lifecycle_id")
    .whereIn("l.order_id", ids)
    .whereNull("l.deleted_at")
    .whereNull("lc.deleted_at")
    .whereNotNull("lc.number")) as { order_id: string; number: string }[]
  return new Map(rows.map((row) => [row.order_id, row.number]))
}

// Номер, названный человеком («ORG-26-0007», «org-26-7», «№ 0007»), для поиска:
// полный номер — как есть (верхний регистр, номер дополнен нулями), только
// цифры — хвост номера; null — в строке номера нет.
export const parseOrderNumberQuery = (
  query: string
): { number: string } | { digits: number } | null => {
  const text = query.trim().toUpperCase().replace(/^№\s*|^#/, "")
  const full = /^([A-Z]{2,4})-(\d{2})-(\d{1,6})$/.exec(text)
  if (full) {
    return { number: `${full[1]}-${full[2]}-${full[3].padStart(4, "0")}` }
  }
  if (/^\d{1,7}$/.test(text)) {
    return { digits: Number(text) }
  }
  return null
}

type GraphQuery = {
  graph: (config: {
    entity: string
    fields: string[]
    filters?: Record<string, unknown>
    pagination?: { skip: number; take: number }
  }) => Promise<{ data: unknown[] }>
}

// Заказы по номеру, названному в поиске панели: «ORG-26-0007» — ровно этот,
// «7» — все, чей номер кончается на -0007 (у разных компаний и лет). Строка
// не похожа на номер — пусто (поиск по почте и тексту идёт своим путём).
export const findOrderIdsByNumber = async (
  query: GraphQuery,
  q: string
): Promise<string[]> => {
  const parsed = parseOrderNumberQuery(q)
  if (!parsed) {
    return []
  }
  const filters =
    "number" in parsed
      ? { number: parsed.number }
      : { number: { $like: `%-${String(parsed.digits).padStart(4, "0")}` } }
  const { data } = await query.graph({
    entity: "order_lifecycle",
    fields: ["id", "order.id"],
    filters,
    pagination: { skip: 0, take: 100 },
  })
  return (data as { order?: { id?: string } | null }[])
    .map((row) => row.order?.id)
    .filter((id): id is string => !!id)
}
