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

  const hasShipping = (order.shipping_methods?.length ?? 0) > 0
  const rows: { label: string; value: string; testId?: string }[] = [
    { label: m.order.itemsTotal, value: amount(itemsTotal) },
    ...(discountTotal > 0
      ? [{ label: m.cart.totals.discount, value: `− ${amount(discountTotal)}` }]
      : []),
    ...(giftCardTotal > 0
      ? [{ label: m.cart.totals.bonuses, value: `− ${amount(giftCardTotal)}` }]
      : []),
    // Доставку показываем и бесплатной: «Бесплатно» — тоже сведение о заказе.
    ...(shippingTotal > 0 || hasShipping
      ? [
          {
            label: m.cart.totals.shipping,
            value:
              shippingTotal > 0 ? amount(shippingTotal) : m.order.shippingFree,
          },
        ]
      : []),
    ...(taxTotal > 0
      ? [{ label: m.cart.totals.taxes, value: amount(taxTotal) }]
      : []),
  ]

  return (
    <div
      className="flex flex-col gap-2 rounded-card border border-line bg-surface p-4"
      data-testid="order-summary"
    >
      <h2 className="text-title-medium text-ink">{m.order.orderSummary}</h2>
      <dl className="flex flex-col gap-1.5 text-body-large">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-baseline justify-between gap-2"
          >
            <dt className="text-ink-secondary">{row.label}</dt>
            <dd className="tabular-nums text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-1 flex items-baseline justify-between gap-2 border-t border-line pt-3">
        <span className="text-title-medium text-ink">
          {m.cart.totals.total}
        </span>
        <span className="text-[22px] font-bold leading-7 tabular-nums text-ink">
          {amount(order.total)}
        </span>
      </div>
    </div>
  )
}

export default OrderSummary
