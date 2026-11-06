import { RemoteQueryFunction } from "@medusajs/framework/types"

type Query = Omit<RemoteQueryFunction, symbol>

export type ProductCategoryRef = { handle: string | null; name: string | null }

// Категории товаров — запросом от категорий к их товарам, а не полем
// `categories.*` в выборке товаров. Замер на стенде 2026-11-06 (1161 товар
// компании): `product.categories` в query.graph — 2,9 с (модуль товаров
// поднимает дерево категорий на каждый товар), `product_category.products.id` —
// 0,16 с. Категорий у магазина единицы, так что выборка всех связей дешёвая.
export const loadProductCategories = async (
  query: Query,
  productIds: string[]
): Promise<Map<string, ProductCategoryRef[]>> => {
  const out = new Map<string, ProductCategoryRef[]>()
  if (!productIds.length) {
    return out
  }
  const wanted = new Set(productIds)
  const { data } = await query.graph({
    entity: "product_category",
    fields: ["handle", "name", "products.id"],
  })
  for (const category of data as {
    handle?: string | null
    name?: string | null
    products?: ({ id: string } | null)[] | null
  }[]) {
    for (const product of category.products ?? []) {
      if (!product || !wanted.has(product.id)) {
        continue
      }
      const list = out.get(product.id) ?? []
      list.push({ handle: category.handle ?? null, name: category.name ?? null })
      out.set(product.id, list)
    }
  }
  return out
}
