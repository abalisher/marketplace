import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  CART_SLOT_DATE_KEY,
  CART_SLOT_WINDOW_KEY,
} from "../../lib/logistics/cart-delivery-slot"
import {
  isDeliveryWindow,
  isSlotDate,
} from "../../lib/logistics/delivery-slots"
import { DeliveryWindow } from "../../modules/order-lifecycle/models/statuses"

export type ResolveCartDeliverySlotInput = { cart_id: string }

export type ResolvedDeliverySlot = {
  delivery_date: string | null
  delivery_window: DeliveryWindow | null
}

// Слот доставки, выбранный покупателем при оформлении, лежит в метаданных
// корзины (их пишет инструмент ассистента set_delivery). Заказ создаётся
// ядровым completeCart, который наших полей не знает, поэтому слот снимаем с
// корзины ДО завершения и отдаём в createOrderLifecycleStep.
//
// Читаем здесь, а не в вызывающем коде, чтобы слот доезжал до заказа одинаково
// с обоих входов в оформление — из чата (assistant) и из POST /store/orders.
//
// Доступность окна здесь НЕ перепроверяем: покупатель уже заплатил, и отказ
// оформить оплаченный заказ из-за того, что окно «сегодня 17:00» наступило,
// пока он платил, оставил бы деньги без заказа. Валидность значений проверяем —
// в метаданные могло попасть что угодно.
export const resolveCartDeliverySlotStep = createStep(
  "resolve-cart-delivery-slot",
  async (input: ResolveCartDeliverySlotInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data } = await query.graph({
      entity: "cart",
      fields: ["id", "metadata"],
      filters: { id: input.cart_id },
    })

    const metadata =
      ((data as { metadata?: Record<string, unknown> | null }[])[0]?.metadata ??
        {}) as Record<string, unknown>

    const date = metadata[CART_SLOT_DATE_KEY]
    const window = metadata[CART_SLOT_WINDOW_KEY]

    return new StepResponse<ResolvedDeliverySlot>({
      delivery_date: isSlotDate(date) ? date : null,
      delivery_window: isDeliveryWindow(window) ? window : null,
    })
  }
)
