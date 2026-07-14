import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { remoderateProductWorkflow } from "../workflows/remoderate-product"

// Повторная модерация одобренных карточек: изменение published-товара с
// карточкой каталога возвращает его в proposed. `product.updated` эмитят
// только ядровые workflows (правки продавца/админа через API); переходы
// статусов наших workflows модерации идут через сервис модуля product и
// событий не эмитят — зацикливания нет (см. steps/update-product-status.ts).
// Цены и остатки меняются своими событиями, product.updated не трогают.
export default async function remoderateUpdatedProduct({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "status", "product_card.id"],
    filters: { id: data.id },
  })

  const product = products[0]
  // Фильтр событий: на модерацию возвращаем только опубликованные товары
  // с карточкой каталога; товары вне нашего флоу модерации не трогаем.
  if (!product || product.status !== "published" || !product.product_card) {
    return
  }

  await remoderateProductWorkflow(container).run({
    input: { product_id: data.id },
    throwOnError: true,
  })
}

export const config: SubscriberConfig = {
  event: "product.updated",
}
