import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// Поиск строки корзины по variant_id — общий хелпер инструментов правки корзины
// (update_cart_item / remove_from_cart / clear_cart). Модель оперирует
// variant_id из search_products; внутренний id строки корзины наружу не отдаём
// (принцип #8) — он нужен только ядровым workflow'ам правки.

type CartLineRow = {
  id: string
  variant_id?: string
  product_title?: string
  title?: string
}

export type CartLineRef = {
  item_id: string
  variant_id: string
  title: string
}

// Прочитать строки корзины (id + variant + название). Пустой массив — корзины
// нет или она пуста; вызывающий решает, что ответить модели.
export const listCartLines = async (
  container: MedusaContainer,
  cartId: string
): Promise<CartLineRef[]> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "cart",
    fields: [
      "id",
      "items.id",
      "items.variant_id",
      "items.product_title",
      "items.title",
    ],
    filters: { id: cartId },
  })

  const cart = (data as { items?: CartLineRow[] }[])[0]
  return (cart?.items ?? []).map((it) => ({
    item_id: it.id,
    variant_id: it.variant_id ?? "",
    title: it.product_title || it.title || "",
  }))
}

