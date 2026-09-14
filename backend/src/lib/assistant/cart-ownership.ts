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
