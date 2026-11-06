import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

import Thumbnail from "@modules/products/components/thumbnail"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  currencyCode: string
}

// Строка состава заказа: миниатюра, название, вариант (единица — «шт»,
// «Мешок 50 кг») и «количество × цена за единицу», справа — сумма строки
// (со скидкой — над ней зачёркнутая сумма без скидки).
const Item = ({ item, currencyCode }: ItemProps) => {
  const money = (amount: number) =>
    convertToLocale({ amount, currency_code: currencyCode })
  const unitPrice = money(item.unit_price ?? 0)
  const total = item.total ?? 0
  const original = item.original_total ?? total

  return (
    <li className="flex items-center gap-3 py-3" data-testid="product-row">
      <div className="w-14 shrink-0 overflow-hidden rounded-chip">
        <Thumbnail thumbnail={item.thumbnail} size="square" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className="line-clamp-2 text-body-large font-semibold text-ink"
          data-testid="product-name"
        >
          {item.product_title}
        </span>
        <span className="text-body-medium tabular-nums text-ink-secondary">
          {item.variant?.title && (
            <span data-testid="product-variant">{item.variant.title} · </span>
          )}
          <span data-testid="product-quantity">{item.quantity}</span> ×{" "}
          {unitPrice}
        </span>
      </div>

      <div className="flex shrink-0 flex-col items-end">
        {total < original && (
          <span
            className="text-body-medium tabular-nums text-ink-secondary line-through"
            data-testid="product-original-price"
          >
            {money(original)}
          </span>
        )}
        <span
          className="text-body-large font-semibold tabular-nums text-ink"
          data-testid="product-price"
        >
          {money(total)}
        </span>
      </div>
    </li>
  )
}

export default Item
