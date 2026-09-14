import { CATALOG_CATEGORY_HANDLES } from "../../lib/catalog/categories"

// Распад заказа на задания сборки — чистая функция (без БД и без контейнера),
// поэтому тестируется юнитом и переиспользуется шагом workflow
// split-order-assembly. Правило владельца (п. 4): одно задание на КАЖДУЮ
// присутствующую в заказе категорию, позиции заказа делятся между заданиями
// без остатка.

// Категории у позиции может не оказаться (товар заведён мимо четвёрки или
// снят с публикации после оформления). Такая позиция НЕ исчезает — иначе
// сумма позиций заданий разойдётся с заказом и он никогда не соберётся
// целиком: она уходит в отдельную группу без сборщика, которую видит
// отвечающий за отгрузку.
export const UNCATEGORIZED_HANDLE = "uncategorized"
export const UNCATEGORIZED_NAME = "Без категории"

export type OrderLineForSplit = {
  order_item_id: string
  variant_id?: string | null
  title: string
  sku?: string | null
  quantity: number
  // Категория товара позиции (handle/имя ядровой product_category).
  category_handle?: string | null
  category_name?: string | null
}

export type AssemblyTaskDraft = {
  category_handle: string
  category_name: string
  items: {
    order_item_id: string
    variant_id: string | null
    title: string
    sku: string | null
    quantity: number
  }[]
}

// Порядок заданий — канонический порядок четырёх категорий каталога, чтобы
// плитки на экране отгрузки и список у сборщика шли всегда одинаково;
// незнакомые категории и «без категории» — в конце.
const groupRank = (handle: string): number => {
  const known = CATALOG_CATEGORY_HANDLES.indexOf(
    handle as (typeof CATALOG_CATEGORY_HANDLES)[number]
  )
  if (known >= 0) {
    return known
  }
  return handle === UNCATEGORIZED_HANDLE
    ? CATALOG_CATEGORY_HANDLES.length + 1
    : CATALOG_CATEGORY_HANDLES.length
}

export function splitOrderLinesByCategory(
  lines: OrderLineForSplit[]
): AssemblyTaskDraft[] {
  const groups = new Map<string, AssemblyTaskDraft>()

  for (const line of lines) {
    if (line.quantity <= 0) {
      continue
    }
    const handle = line.category_handle?.trim() || UNCATEGORIZED_HANDLE
    const name =
      handle === UNCATEGORIZED_HANDLE
        ? UNCATEGORIZED_NAME
        : line.category_name?.trim() || handle

    let group = groups.get(handle)
    if (!group) {
      group = { category_handle: handle, category_name: name, items: [] }
      groups.set(handle, group)
    }
    group.items.push({
      order_item_id: line.order_item_id,
      variant_id: line.variant_id ?? null,
      title: line.title,
      sku: line.sku ?? null,
      quantity: line.quantity,
    })
  }

  return [...groups.values()].sort(
    (a, b) => groupRank(a.category_handle) - groupRank(b.category_handle)
  )
}
