import {
  createWorkflow,
  transform,
  when,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { ProductStatus } from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import {
  updateOnecItemsStep,
  updateOnecProductCardsStep,
} from "./steps"

export type UpdateOnecProductsWorkflowInput = {
  // Только поля, которые отличаются от 1С.
  products: {
    id: string
    title?: string
    description?: string | null
    status?: "published" | "draft"
    category_ids?: string[]
    metadata?: Record<string, unknown>
  }[]
  cards: { product_card_id: string; unit: string }[]
  // Отметки позиций 1С: есть ли в ответе и себестоимость.
  items: { id: string; present?: boolean; cost?: number | null }[]
}

// Привести товары компании к данным 1С: название, описание, категория, статус
// (снят с витрины / вернулся), единица в карточке и отметка «есть в 1С».
// Цена и остаток идут отдельно — через apply-price-stock с источником «1С»,
// чтобы попасть в общий журнал правок.
//
// Ядровый updateProductsWorkflow эмитит product.updated; подписчик повторной
// модерации товары из 1С пропускает (subscribers/product-updated.ts).
export const updateOnecProductsWorkflow = createWorkflow(
  "update-onec-products",
  (input: WorkflowData<UpdateOnecProductsWorkflowInput>) => {
    const products = transform({ input }, ({ input }) =>
      input.products.map((product) => ({
        id: product.id,
        ...(product.title !== undefined ? { title: product.title } : {}),
        ...(product.description !== undefined
          ? { description: product.description ?? "" }
          : {}),
        ...(product.status !== undefined
          ? {
              status:
                product.status === "published"
                  ? ProductStatus.PUBLISHED
                  : ProductStatus.DRAFT,
            }
          : {}),
        ...(product.category_ids !== undefined
          ? { category_ids: product.category_ids }
          : {}),
        ...(product.metadata !== undefined ? { metadata: product.metadata } : {}),
      }))
    )

    when({ products }, ({ products }) => products.length > 0).then(() => {
      updateProductsWorkflow.runAsStep({ input: { products } })
    })

    updateOnecProductCardsStep(
      transform({ input }, ({ input }) => ({ cards: input.cards }))
    )
    updateOnecItemsStep(
      transform({ input }, ({ input }) => ({ items: input.items }))
    )

    return new WorkflowResponse(undefined)
  }
)
