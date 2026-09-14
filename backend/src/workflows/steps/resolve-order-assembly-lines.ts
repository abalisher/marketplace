import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { CATALOG_CATEGORY_HANDLES } from "../../lib/catalog/categories"
import { OrderLineForSplit } from "../../modules/assembly/split"

export type ResolveOrderAssemblyLinesStepInput = {
  order_id: string
}

// Позиции заказа с их категорией каталога — вход для распада на задания сборки.
// Читаем в два приёма:
// 1) количество позиции (BigNumber) query.graph не отдаёт — берём сервисом
//    модуля order (та же грабля, что в determine-assembly-status);
// 2) категорию — query.graph по товарам (у товара ровно одна категория, T10.10).
export const resolveOrderAssemblyLinesStep = createStep(
  "resolve-order-assembly-lines",
  async (input: ResolveOrderAssemblyLinesStepInput, { container }) => {
    const orderService = container.resolve(Modules.ORDER)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const order = await orderService.retrieveOrder(input.order_id, {
      relations: ["items"],
    })
    const items = order.items ?? []

    const productIds = [
      ...new Set(
        items
          .map((item) => (item as { product_id?: string | null }).product_id)
          .filter((id): id is string => !!id)
      ),
    ]

    const categoryByProduct = new Map<
      string,
      { handle: string; name: string }
    >()
    if (productIds.length) {
      const { data: products } = await query.graph({
        entity: "product",
        fields: ["id", "categories.handle", "categories.name"],
        filters: { id: productIds },
      })
      for (const product of products as {
        id: string
        categories?: { handle: string; name: string }[]
      }[]) {
        const categories = product.categories ?? []
        // У товара должна быть ровно одна категория (T10.10), но на стенде
        // остались привязки к старым категориям, а порядок массива случайный:
        // из четырёх рабочих выбираем её, иначе берём первую попавшуюся —
        // задание «чужой» категории увидит отгрузка, позиция не потеряется.
        const category =
          categories.find((c) =>
            CATALOG_CATEGORY_HANDLES.includes(
              c.handle as (typeof CATALOG_CATEGORY_HANDLES)[number]
            )
          ) ?? categories[0]
        if (category?.handle) {
          categoryByProduct.set(product.id, {
            handle: category.handle,
            name: category.name,
          })
        }
      }
    }

    const lines: OrderLineForSplit[] = items.map((item) => {
      const productId = (item as { product_id?: string | null }).product_id
      const category = productId ? categoryByProduct.get(productId) : undefined
      return {
        order_item_id: item.id,
        variant_id: item.variant_id ?? null,
        title: item.title,
        sku: (item as { variant_sku?: string | null }).variant_sku ?? null,
        quantity: Number(item.quantity),
        category_handle: category?.handle ?? null,
        category_name: category?.name ?? null,
      }
    })

    return new StepResponse({ lines })
  }
)
