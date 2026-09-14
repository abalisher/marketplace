import { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { OwnCartPaymentView } from "./helpers"

// Доступ к платёжному состоянию корзины для ГОСТЕВОГО чекаута (T2.4):
// у гостевой корзины владение подтверждается самим cart_id — он случаен и
// неугадываем, клиент держит его между ходами (капабилити-токен, та же логика,
// что у ассистента и cookie-корзины витрины; DECISIONS 2026-07-23). Гостевая
// корзина — это корзина БЕЗ customer_id ЛИБО с «гостевым» customer
// (has_account=false: ядро создаёт его, как только у корзины появляется email —
// например после set_delivery ассистента). Корзина зарегистрированного
// покупателя (has_account=true) доступна ТОЛЬКО ему (чужая/несуществующая →
// 404, существование чужих корзин не раскрываем). Использует GET-поллинг
// статуса Kaspi; строгий requireOwnCart (bonus, POST оплаты) не меняется.

type CartAccessRow = OwnCartPaymentView & {
  customer_id: string | null
  customer?: { has_account?: boolean | null } | null
}

export async function requireCartPaymentAccess(
  scope: MedusaContainer,
  cartId: string,
  customerId: string | undefined
): Promise<OwnCartPaymentView> {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: carts } = await query.graph({
    entity: "cart",
    fields: [
      "id",
      "customer_id",
      "customer.has_account",
      "payment_collection.id",
      "payment_collection.payment_sessions.id",
      "payment_collection.payment_sessions.provider_id",
      "payment_collection.payment_sessions.status",
      "payment_collection.payment_sessions.data",
    ],
    filters: { id: cartId },
  })

  const cart = carts[0] as unknown as CartAccessRow | undefined
  // Fail-closed: гостевая корзина — либо совсем без customer_id, либо с явно
  // гостевым customer (has_account === false). Если связь customer не
  // гидратировалась (undefined), корзину с customer_id НЕ считаем гостевой —
  // иначе корзина покупателя утекла бы по одному лишь cart_id (ревью T2.4).
  const isGuestCart =
    !!cart && (!cart.customer_id || cart.customer?.has_account === false)
  const isOwner = !!cart && !!customerId && cart.customer_id === customerId
  if (!cart || (!isGuestCart && !isOwner)) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Cart ${cartId} not found`
    )
  }
  return cart
}
