import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { transferCartCustomerWorkflow } from "@medusajs/medusa/core-flows"

// Перенос гостевой корзины на вошедшего покупателя (T10.8). Покупатель собирает
// корзину гостем, а на шаге оформления входит по номеру — позиции при этом
// теряться не должны. Корзину чат ведёт сам (клиент держит `cart_id`, как
// `messages`), поэтому ядровый роут `POST /store/carts/:id/customer` тут не
// поможет: клиент про эту корзину знает, а cookie-корзины витрины у него нет.
// Делаем то же ядровым workflow'ом на первом же ходе после входа.
//
// Логику переноса НЕ дублируем: transferCartCustomerWorkflow сам проверяет, что
// корзина не завершена и не принадлежит ДРУГОМУ зарегистрированному покупателю.

type CartOwnerRow = {
  id: string
  customer_id?: string | null
  completed_at?: string | null
}

export const attachCartToCustomer = async (
  container: MedusaContainer,
  cartId: string,
  customerId: string
): Promise<void> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "cart",
    fields: ["id", "customer_id", "completed_at"],
    filters: { id: cartId },
  })

  const cart = (data as CartOwnerRow[])[0]
  // Корзины нет, она уже оформлена или уже принадлежит этому покупателю —
  // переносить нечего.
  if (!cart || cart.completed_at || cart.customer_id === customerId) {
    return
  }

  try {
    await transferCartCustomerWorkflow(container).run({
      input: { id: cartId, customer_id: customerId },
    })
  } catch (e) {
    // Чужая корзина зарегистрированного покупателя — ядро откажет. Диалог из-за
    // этого падать не должен: инструменты оформления упрутся в свои guard'ы и
    // ассистент объяснит покупателю, что делать.
    container
      .resolve(ContainerRegistrationKeys.LOGGER)
      .warn(
        `assistant: не удалось перенести корзину ${cartId} на покупателя ${customerId}: ${
          (e as Error).message
        }`
      )
  }
}

// Корзина собрана на витрине ДРУГОГО продавца. Клиент держит `cart_id` между
// ходами, и с витрины одной компании он может прийти на витрину другой (или
// площадки). Такую корзину ход не продолжает и не «перевозит» в свой канал:
// позиции в ней заведены с ценами и резервом чужого канала. Вызывающий код
// просто начинает новую корзину — старая остаётся там, где её собрали.
// Несуществующая корзина — не «чужая»: её разбирают обычные проверки (404).
export const cartInOtherChannel = async (
  container: MedusaContainer,
  cartId: string,
  salesChannelId: string
): Promise<boolean> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "cart",
    fields: ["id", "sales_channel_id"],
    filters: { id: cartId },
  })
  const cart = data[0] as { sales_channel_id?: string | null } | undefined
  return !!cart && cart.sales_channel_id !== salesChannelId
}
