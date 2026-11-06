import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ONEC_MODULE } from "../../modules/onec"
import OnecModuleService from "../../modules/onec/service"
import { updateOnecProductsWorkflow } from "../../workflows/onec/update-onec-products"
import { ONEC_PRODUCT_SOURCE } from "./plan"

const CURRENCY = "kzt"

// Товар из 1С продаётся, когда у него есть цена (lib/onec/plan.ts). Если цену
// ведёт не 1С, а продавец, она появляется правкой на «Ценах и остатках» — и
// товар должен выйти на витрину сразу, а не через полчаса со следующей
// синхронизацией. И наоборот: цену обнулили — товар уходит с витрины.
//
// Позиция, пропавшая из 1С (onec_item.present = false), на витрину не
// возвращается: её сняла синхронизация, и цена этого не отменяет.
export const syncOnecPublication = async (
  container: MedusaContainer,
  productIds: string[]
): Promise<number> => {
  const ids = [...new Set(productIds)]
  if (!ids.length) {
    return 0
  }
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "status",
      "metadata",
      "variants.prices.amount",
      "variants.prices.currency_code",
    ],
    filters: { id: ids },
  })
  const products = (
    data as {
      id: string
      status: string
      metadata?: Record<string, unknown> | null
      variants?: { prices?: { amount?: number; currency_code?: string }[] }[]
    }[]
  ).filter((product) => product.metadata?.source === ONEC_PRODUCT_SOURCE)
  if (!products.length) {
    return 0
  }

  const items = await container
    .resolve<OnecModuleService>(ONEC_MODULE)
    .listOnecItems({ product_id: products.map((p) => p.id) }, { take: null })
  const present = new Set(
    items.filter((item) => item.present).map((item) => item.product_id)
  )

  const changes = products.flatMap((product) => {
    const price = Number(
      product.variants?.[0]?.prices?.find((p) => p.currency_code === CURRENCY)
        ?.amount ?? 0
    )
    const status =
      present.has(product.id) && price > 0 ? "published" : "draft"
    return product.status === status
      ? []
      : [{ id: product.id, status: status as "published" | "draft" }]
  })
  if (!changes.length) {
    return 0
  }
  await updateOnecProductsWorkflow(container).run({
    input: { products: changes, cards: [], items: [] },
    throwOnError: true,
  })
  return changes.length
}
