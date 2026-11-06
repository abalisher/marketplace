import { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

import { kaspiStaticQrUrl } from "../../../lib/payments/methods"
import { loadPaymentSettings } from "../../../lib/payments/settings"

// Хелперы авторизации store-роутов оплаты корзины: корзина принадлежит
// текущему покупателю. Читают через query.graph, бизнес-логики не содержат.

export type OwnCartPaymentView = {
  id: string
  payment_collection: {
    id: string
    payment_sessions?: {
      id: string
      provider_id: string
      status: string
      data: Record<string, unknown>
    }[]
  } | null
}

// Корзина по id строго текущего покупателя; чужая/несуществующая — 404
// (не раскрываем существование чужих корзин). Возвращает корзину с платёжной
// коллекцией и её сессиями.
export async function requireOwnCart(
  scope: MedusaContainer,
  cartId: string,
  customerId: string
): Promise<OwnCartPaymentView> {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: carts } = await query.graph({
    entity: "cart",
    fields: [
      "id",
      "customer_id",
      "payment_collection.id",
      "payment_collection.payment_sessions.id",
      "payment_collection.payment_sessions.provider_id",
      "payment_collection.payment_sessions.status",
      "payment_collection.payment_sessions.data",
    ],
    filters: { id: cartId, customer_id: customerId },
  })

  if (!carts.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Cart ${cartId} not found`
    )
  }
  return carts[0] as unknown as OwnCartPaymentView
}

// Продавец корзины принимает Kaspi QR по постоянному QR магазина (без API):
// тогда Kaspi QR оплачивается после оформления заказа.
export async function sellerUsesStaticKaspiQr(
  scope: MedusaContainer,
  cartId: string
): Promise<boolean> {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "cart",
    fields: ["id", "sales_channel_id"],
    filters: { id: cartId },
  })
  const channel = (data[0] as { sales_channel_id?: string | null } | undefined)?.sales_channel_id
  return !!kaspiStaticQrUrl(await loadPaymentSettings(scope, channel))
}
