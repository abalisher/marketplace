"use client"

import { orderLabel } from "@lib/util/order-label"
import { OrderLifecycle } from "@lib/data/order-lifecycle"
import { formatDate } from "@lib/i18n/format-date"
import { useLocale, useMessages } from "@lib/i18n/i18n-context"
import { formatDeliverySlot } from "@lib/util/delivery-slot"
import { convertToLocale } from "@lib/util/money"
import OrderStageBadge from "@modules/cabinet/components/order-stage-badge"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

// Строка списка заказов: номер, дата, сумма, стадия и слот доставки — ровно то,
// по чему покупатель узнаёт свой заказ (T10.6) и когда его ждать (T5.6a). Вся
// строка — ссылка в карточку: отдельная кнопка «Подробнее» на телефоне
// промахивается мимо пальца.
//
// Стадия и слот приходят одним объектом жизненного цикла: раньше строка брала
// только код стадии, и за слотом пришлось бы тянуть второй проп из той же
// выборки.
const OrderRow = ({
  order,
  lifecycle,
}: {
  order: HttpTypes.StoreOrder
  lifecycle?: OrderLifecycle
}) => {
  const m = useMessages()
  const locale = useLocale()
  const itemsCount = order.items?.length ?? 0
  const stage = lifecycle?.status
  const slotLabel = formatDeliverySlot(
    lifecycle?.delivery_date,
    lifecycle?.delivery_window,
    m.common.deliverySlot.months
  )

  return (
    <li>
      <LocalizedClientLink
        href={`/cabinet/orders/${order.id}`}
        className="flex min-h-[48px] flex-col gap-2 rounded-card border border-line bg-surface p-4 transition-colors hover:border-accent"
        data-testid="cabinet-order-row"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-title-medium text-ink">
            {m.assistant.order.number.replace(
              "{id}",
              orderLabel(lifecycle?.number, order.display_id)
            )}
          </span>
          {stage && <OrderStageBadge status={stage} />}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-body-medium text-ink-secondary">
          <span>{formatDate(order.created_at, locale)}</span>
          <span className="tabular-nums text-ink">
            {convertToLocale({
              amount: order.total,
              currency_code: order.currency_code,
            })}
          </span>
          <span>
            {m.cabinet.orders.items.replace("{count}", String(itemsCount))}
          </span>
        </div>
        {slotLabel && (
          <span
            className="text-body-medium text-ink"
            data-testid="cabinet-order-row-slot"
          >
            {m.common.deliverySlot.title}: {slotLabel}
          </span>
        )}
      </LocalizedClientLink>
    </li>
  )
}

export default OrderRow
