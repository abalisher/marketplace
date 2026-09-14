import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateCartWorkflow } from "@medusajs/medusa/core-flows"
import { DeliverySlot } from "./delivery-slots"

// Слот доставки на корзине (T5.6). Заказа во время оформления ещё нет, а слот
// покупатель выбирает вместе с адресом — до оплаты. Держим его в метаданных
// корзины: своей колонки у ядрового cart нет, а заводить ради двух полей
// таблицу-спутник дороже, чем прочитать метаданные один раз в place-order.
//
// Ключи и запись — в одном файле с чтением, чтобы имя ключа не разъехалось
// между инструментом ассистента и шагом workflow.

export const CART_SLOT_DATE_KEY = "delivery_slot_date"
export const CART_SLOT_WINDOW_KEY = "delivery_slot_window"

// Метаданные корзины ядро ЗАМЕЩАЕТ целиком, а не сливает: пишем поверх
// прочитанных, иначе слот стёр бы всё, что положили туда до него.
export async function saveCartDeliverySlot(
  container: MedusaContainer,
  cartId: string,
  slot: DeliverySlot
): Promise<void> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "cart",
    fields: ["id", "metadata"],
    filters: { id: cartId },
  })
  const current =
    ((data as { metadata?: Record<string, unknown> | null }[])[0]?.metadata ??
      {}) as Record<string, unknown>

  await updateCartWorkflow(container).run({
    input: {
      id: cartId,
      metadata: {
        ...current,
        [CART_SLOT_DATE_KEY]: slot.date,
        [CART_SLOT_WINDOW_KEY]: slot.window,
      },
    },
  })
}

// Слот, уже выбранный на этой корзине (для повторного вызова оформления —
// переспрашивать окно не нужно).
export async function readCartDeliverySlot(
  container: MedusaContainer,
  cartId: string
): Promise<{ date: unknown; window: unknown }> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "cart",
    fields: ["id", "metadata"],
    filters: { id: cartId },
  })
  const metadata =
    ((data as { metadata?: Record<string, unknown> | null }[])[0]?.metadata ??
      {}) as Record<string, unknown>
  return {
    date: metadata[CART_SLOT_DATE_KEY],
    window: metadata[CART_SLOT_WINDOW_KEY],
  }
}
