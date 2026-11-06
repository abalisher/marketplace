import repeat from "@lib/util/repeat"
import { getServerMessages } from "@lib/i18n/server"
import { HttpTypes } from "@medusajs/types"

import Item from "@modules/order/components/item"

type ItemsProps = {
  order: HttpTypes.StoreOrder
}

// Состав заказа карточкой: заголовок с числом позиций и строки через тонкий
// разделитель. Общий для подтверждения заказа и карточки в кабинете.
const Items = async ({ order }: ItemsProps) => {
  const m = await getServerMessages()
  const items = [...(order.items ?? [])].sort((a, b) =>
    (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
  )

  return (
    <div
      className="flex flex-col rounded-card border border-line bg-surface px-4 pt-4 pb-1"
      data-testid="order-items"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-title-medium text-ink">{m.order.itemsTitle}</h2>
        {items.length > 0 && (
          <span className="text-body-medium text-ink-secondary">
            {m.order.positions.replace("{count}", String(items.length))}
          </span>
        )}
      </div>
      <ul
        className="mt-1 flex flex-col divide-y divide-line"
        data-testid="products-table"
      >
        {items.length
          ? items.map((item) => (
              <Item
                key={item.id}
                item={item}
                currencyCode={order.currency_code}
              />
            ))
          : repeat(3).map((i) => (
              <li key={i} className="flex items-center gap-3 py-3">
                <div className="h-14 w-14 shrink-0 animate-pulse rounded-chip bg-line" />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="h-4 w-40 animate-pulse rounded bg-line" />
                  <div className="h-3 w-24 animate-pulse rounded bg-line" />
                </div>
              </li>
            ))}
      </ul>
    </div>
  )
}

export default Items
