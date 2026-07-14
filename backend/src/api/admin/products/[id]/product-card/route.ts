import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createProductCardWorkflow } from "../../../../../workflows/create-product-card"
import { updateProductCardWorkflow } from "../../../../../workflows/update-product-card"
import { AdminUpsertProductCardType } from "../../validators"

// POST /admin/products/:id/product-card — создать или обновить карточку
// каталога товара (upsert: link 1:1, у товара максимум одна карточка).
// Роут только выбирает workflow по наличию карточки; инварианты (товар
// существует, дубль запрещён, ре-модерация published-товара) — в workflows.
export async function POST(
  req: AuthenticatedMedusaRequest<AdminUpsertProductCardType>,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "product_card.id"],
    filters: { id: req.params.id },
  })

  const input = { product_id: req.params.id, ...req.validatedBody }

  if (products[0]?.product_card) {
    const { result: card } = await updateProductCardWorkflow(req.scope).run({
      input,
      throwOnError: true,
    })
    res.json({ product_card: card })
    return
  }

  // Товара нет вовсе → create-workflow бросит NOT_FOUND (404).
  const { result: card } = await createProductCardWorkflow(req.scope).run({
    input,
    throwOnError: true,
  })
  res.json({ product_card: card })
}
