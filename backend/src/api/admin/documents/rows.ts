import { findOrderIdsByNumber } from "../../../lib/orders/order-number"
import { RemoteQueryFunction } from "@medusajs/framework/types"
import { DOCUMENT_TYPES } from "../../../modules/documents/models/constants"
import DocumentsModuleService from "../../../modules/documents/service"

// Сборка строк реестра документов: сам роут остаётся тонким, а «кто плательщик
// и по какому заказу» собирается здесь (идиома order-lifecycles/rows.ts).
// Документ хранит order_id опазной колонкой (link'а нет — см.
// docs/modules/documents.md), поэтому номер заказа и покупателя дочитываем
// вторым запросом по собранным id.

export type DocumentRegistryOrder = {
  id: string
  display_id: number | null
  order_number: string | null
  // Плательщик человекочитаемо: название компании для юрлица, иначе имя из
  // адреса, иначе email — на экране не должно быть технических id (принцип #8).
  buyer: string | null
  is_company: boolean
}

type OrderRow = {
  id: string
  display_id?: number | null
  order_lifecycle?: { number?: string | null } | null
  email?: string | null
  billing_address?: { first_name?: string | null; last_name?: string | null } | null
  shipping_address?: { first_name?: string | null; last_name?: string | null } | null
  company?: { id?: string | null; name?: string | null } | null
}

const buyerLabel = (order: OrderRow): string | null => {
  if (order.company?.name) {
    return order.company.name
  }
  const address = order.billing_address ?? order.shipping_address ?? null
  const personName = [address?.first_name, address?.last_name]
    .filter((part) => !!part && `${part}`.trim() !== "")
    .join(" ")
  return personName !== "" ? personName : (order.email ?? null)
}

// Заказы по id → карта строк реестра. Пустой список id — пустая карта без
// запроса.
export const loadRegistryOrders = async (
  query: Omit<RemoteQueryFunction, symbol>,
  orderIds: string[]
): Promise<Map<string, DocumentRegistryOrder>> => {
  const unique = [...new Set(orderIds)]
  if (!unique.length) {
    return new Map()
  }

  const { data } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "order_lifecycle.number",
      "email",
      "billing_address.first_name",
      "billing_address.last_name",
      "shipping_address.first_name",
      "shipping_address.last_name",
      "company.id",
      "company.name",
    ],
    filters: { id: unique },
  })

  return new Map(
    (data as OrderRow[]).map((order) => [
      order.id,
      {
        id: order.id,
        display_id: order.display_id ?? null,
        order_number: order.order_lifecycle?.number ?? null,
        buyer: buyerLabel(order),
        is_company: !!order.company?.id,
      },
    ])
  )
}

// Поиск заказов по номеру («24», «#24») и почте — возвращает их id для фильтра
// по order_id. Кросс-модульного фильтра у query.graph нет: документ и заказ
// живут в разных модулях и не связаны link'ом.
const SEARCH_MATCH_CAP = 100

export const findOrderIdsBySearch = async (
  query: Omit<RemoteQueryFunction, symbol>,
  q: string
): Promise<string[]> => {
  const filters: Record<string, unknown>[] = [{ email: { $ilike: `%${q}%` } }]
  const displayId = Number(q.replace(/^#/, ""))
  if (Number.isSafeInteger(displayId) && displayId > 0) {
    filters.push({ display_id: displayId })
  }
  // Номер нового вида — «ORG-26-0007» или его хвост «7» (lib/orders/order-number).
  const byNumber = await findOrderIdsByNumber(query, q)
  if (byNumber.length) {
    filters.push({ id: byNumber })
  }

  const ids = new Set<string>()
  for (const filter of filters) {
    const { data } = await query.graph({
      entity: "order",
      fields: ["id"],
      filters: filter,
      pagination: { skip: 0, take: SEARCH_MATCH_CAP },
    })
    for (const order of data as { id: string }[]) {
      ids.add(order.id)
    }
  }
  return [...ids]
}

export type DocumentTypeCounts = Record<string, number> & { all: number }

export const emptyTypeCounts = (): DocumentTypeCounts => {
  const counts = { all: 0 } as DocumentTypeCounts
  for (const type of DOCUMENT_TYPES) {
    counts[type] = 0
  }
  return counts
}

// Счётчики чипов по типам документа при текущих фильтрах (кроме самого типа) —
// экран ничего не пересчитывает сам (идиома T4.2a).
export const countByType = async (
  service: DocumentsModuleService,
  baseFilters: Record<string, unknown>
): Promise<DocumentTypeCounts> => {
  const counts = emptyTypeCounts()
  const results = await Promise.all(
    DOCUMENT_TYPES.map((type) =>
      service.listAndCountDocuments(
        { ...baseFilters, type },
        { take: 0 }
      ) as Promise<[unknown[], number]>
    )
  )
  DOCUMENT_TYPES.forEach((type, index) => {
    counts[type] = results[index][1]
    counts.all += results[index][1]
  })
  return counts
}
