import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { RemoteQueryFilters } from "@medusajs/framework/types"
import { StoreGetAlternativesParamsType } from "../../validators"

// GET /store/products/:id/alternatives — подбор альтернатив при отсутствии
// товара (ТЗ): опубликованные товары той же категории и того же сегмента.
// Двухшагово, как и фильтр по сегменту: ids карточек сегмента из модуля
// catalog → фильтр товаров ядра.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { limit } = req.validatedQuery as StoreGetAlternativesParamsType
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "status", "categories.id", "product_card.segment"],
    filters: { id: req.params.id },
  })
  const product = products[0]
  if (!product || product.status !== "published") {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Product with id ${req.params.id} not found`
    )
  }

  // Товар без карточки — сегмент неизвестен, альтернатив не подобрать.
  const segment = product.product_card?.segment
  if (!segment) {
    res.json({ alternatives: [] })
    return
  }

  const { data: cards } = await query.graph({
    entity: "product_card",
    fields: ["id", "product.id"],
    filters: { segment },
  })
  const candidateIds = cards
    .map((card: { product?: { id: string } | null }) => card.product?.id)
    .filter(
      (id: string | undefined): id is string => Boolean(id) && id !== product.id
    )

  if (!candidateIds.length) {
    res.json({ alternatives: [] })
    return
  }

  const categoryIds = (product.categories ?? [])
    .filter((category) => Boolean(category))
    .map((category) => category!.id)

  const { data: alternatives } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "handle",
      "thumbnail",
      "product_card.segment",
      "product_card.unit",
    ],
    // Каст: сгенерированный тип фильтров не знает relation-фильтр categories,
    // хотя remote query его поддерживает (ядровый store-роут фильтрует так же).
    filters: {
      id: candidateIds,
      status: "published",
      // Товар вне категорий — альтернативы только по сегменту.
      ...(categoryIds.length ? { categories: { id: categoryIds } } : {}),
    } as RemoteQueryFilters<"product">,
    pagination: { take: limit, skip: 0 },
  })

  res.json({ alternatives })
}
