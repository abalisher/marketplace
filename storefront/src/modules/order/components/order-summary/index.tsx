import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { getServerMessages } from "@lib/i18n/server"

type OrderSummaryProps = {
  order: HttpTypes.StoreOrder
}

// Итоги заказа. Строки складываются в «Итого» — это главное требование
// снабженца (прогон 2026-08-13: «Промежуточный итог 662 000 ₸» + «Доставка
// 2 000 ₸» = «Итого 662 000 ₸», а позиции давали 660 000 ₸).
// Причина: `order.subtotal` ядра — это позиции ВМЕСТЕ с доставкой (проверено на
// заказе №43: subtotal 266 000 = item_total 264 000 + shipping_total 2 000).
// Поэтому первая строка — `item_total` («Товары»), а не `subtotal`.
// Нулевые строки (скидка, бонусы, налоги) не показываем вовсе: пустое значение
// рядом с подписью «Налоги» читалось как потерянная цифра.
const OrderSummary = async ({ order }: OrderSummaryProps) => {
  const m = await getServerMessages()
  const amount = (value: number) =>
    convertToLocale({ amount: value, currency_code: order.currency_code })

  const itemsTotal = order.item_total ?? 0
  const shippingTotal = order.shipping_total ?? 0
  const taxTotal = order.tax_total ?? 0
  const discountTotal = order.discount_total ?? 0
  const giftCardTotal = order.gift_card_total ?? 0

  return (
    <div data-testid="order-summary">
      <h2 className="text-body-large font-semibold">{m.order.orderSummary}</h2>
      <div className="text-body-medium text-ink my-2">
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center justify-between">
            <span>{m.order.itemsTotal}</span>
            <span className="tabular-nums">{amount(itemsTotal)}</span>
          </div>
          {discountTotal > 0 && (
            <div className="flex items-center justify-between">
              <span>{m.cart.totals.discount}</span>
              <span className="tabular-nums">- {amount(discountTotal)}</span>
            </div>
          )}
          {giftCardTotal > 0 && (
            <div className="flex items-center justify-between">
              <span>{m.cart.totals.bonuses}</span>
              <span className="tabular-nums">- {amount(giftCardTotal)}</span>
            </div>
          )}
          {shippingTotal > 0 && (
            <div className="flex items-center justify-between">
              <span>{m.cart.totals.shipping}</span>
              <span className="tabular-nums">{amount(shippingTotal)}</span>
            </div>
          )}
          {taxTotal > 0 && (
            <div className="flex items-center justify-between">
              <span>{m.cart.totals.taxes}</span>
              <span className="tabular-nums">{amount(taxTotal)}</span>
            </div>
          )}
        </div>
        <div className="h-px w-full border-b border-line border-dashed my-4" />
        <div className="flex items-center justify-between text-body-large font-semibold text-ink mb-2">
          <span>{m.cart.totals.total}</span>
          <span className="tabular-nums">{amount(order.total)}</span>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary
