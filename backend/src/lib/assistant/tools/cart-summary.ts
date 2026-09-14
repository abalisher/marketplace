import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// Сводка корзины для ответа модели: только то, что нужно диалогу (позиции с
// названием/количеством/ценой, итог), без служебного шума ядра (принцип #8 —
// метаданные/id платёжных коллекций/адреса наружу не тянем). Разделяемый хелпер
// инструментов add_to_cart и view_cart: оба показывают текущий состав корзины.

type CartItemRow = {
  variant_id?: string
  product_title?: string
  title?: string
  quantity?: number
  unit_price?: number
}
type CartRow = {
  id: string
  currency_code?: string
  items?: CartItemRow[]
}

export type CartLine = {
  variant_id: string
  title: string
  quantity: number
  unit_price: number
  total: number
}

export type CartSummary = {
  cart_id: string
  currency: string
  items: CartLine[]
  item_count: number
  total: number
}

// Сводка «корзины ещё нет»: единая форма поля cart для путей без корзины
// (view_cart/clear_cart до первого добавления) — модели всегда приходит одна
// схема (ревью T2.3a).
export const emptyCartSummary = (): CartSummary => ({
  cart_id: "",
  currency: "kzt",
  items: [],
  item_count: 0,
  total: 0,
})

// Прочитать корзину по id и собрать сводку. Возвращает null, если корзины нет
// (удалена/чужой id) — вызывающий решает, что сказать модели.
export const summarizeCart = async (
  container: MedusaContainer,
  cartId: string
): Promise<CartSummary | null> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "cart",
    fields: [
      "id",
      "currency_code",
      "items.variant_id",
      "items.product_title",
      "items.title",
      "items.quantity",
      "items.unit_price",
    ],
    filters: { id: cartId },
  })

  const cart = (data as CartRow[])[0]
  if (!cart) {
    return null
  }

  const items: CartLine[] = (cart.items ?? []).map((it) => {
    const quantity = Number(it.quantity ?? 0)
    const unitPrice = Number(it.unit_price ?? 0)
    return {
      variant_id: it.variant_id ?? "",
      title: it.product_title || it.title || "",
      quantity,
      unit_price: unitPrice,
      total: quantity * unitPrice,
    }
  })

  return {
    cart_id: cart.id,
    currency: cart.currency_code ?? "kzt",
    items,
    item_count: items.reduce((sum, it) => sum + it.quantity, 0),
    total: items.reduce((sum, it) => sum + it.total, 0),
  }
}
