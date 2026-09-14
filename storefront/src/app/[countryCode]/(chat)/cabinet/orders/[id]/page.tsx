import { formatDate } from "@lib/i18n/format-date"
import { resolveLocale } from "@lib/i18n/resolve-locale"
import { getServerMessages } from "@lib/i18n/server"
import { retrieveOrderLifecycle } from "@lib/data/order-lifecycle"
import { retrieveOrder } from "@lib/data/orders"
import { formatDeliverySlot } from "@lib/util/delivery-slot"
import DeliveryCode from "@modules/cabinet/components/delivery-code"
import OrderStageBadge from "@modules/cabinet/components/order-stage-badge"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Items from "@modules/order/components/items"
import OrderDocuments from "@modules/order/components/order-documents"
import OrderSummary from "@modules/order/components/order-summary"
import ShippingDetails from "@modules/order/components/shipping-details"
import { Metadata } from "next"
import { notFound } from "next/navigation"

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id } = await props.params
  const order = await retrieveOrder(id).catch(() => null)

  return {
    title: order ? `Order #${order.display_id}` : "Order",
    description: "Order items, delivery, pickup code and documents.",
  }
}

// Карточка заказа в кабинете (T10.6): позиции, доставка, итоги, код получения
// и документы с PDF — всё, ради чего покупатель сюда приходит, на одном экране
// и без единого вопроса в чат (это и есть DoD таска). Блоки переиспользуем со
// страницы заказа: вторая верстка тех же данных разъехалась бы с первой.
export default async function CabinetOrderPage(props: Props) {
  const { id } = await props.params
  const order = await retrieveOrder(id).catch(() => null)

  if (!order) {
    notFound()
  }

  const [lifecycle, m, locale] = await Promise.all([
    retrieveOrderLifecycle(id),
    getServerMessages(),
    resolveLocale(),
  ])

  // Слот доставки (T5.6a): когда ждать машину — рядом с датой оформления, до
  // состава и документов. null — заказ оформлен до появления слотов.
  const slotLabel = formatDeliverySlot(
    lifecycle?.delivery_date,
    lifecycle?.delivery_window,
    m.common.deliverySlot.months
  )

  return (
    <section
      className="flex flex-col gap-4"
      data-testid="cabinet-order-details"
    >
      <LocalizedClientLink
        href="/cabinet/orders"
        className="flex min-h-[48px] w-fit items-center text-body-large text-ink-secondary transition-colors hover:text-ink"
        data-testid="cabinet-order-back"
      >
        ← {m.cabinet.order.back}
      </LocalizedClientLink>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-heading-large text-ink">
          {m.assistant.order.number.replace(
            "{id}",
            String(order.display_id ?? "")
          )}
        </h1>
        {lifecycle?.status && <OrderStageBadge status={lifecycle.status} />}
      </div>

      <span className="text-body-medium text-ink-secondary">
        {m.cabinet.order.placed}: {formatDate(order.created_at, locale)}
      </span>

      {slotLabel && (
        <span
          className="text-body-large text-ink"
          data-testid="cabinet-order-slot"
        >
          {m.common.deliverySlot.title}: {slotLabel}
        </span>
      )}

      {/* Код получения — выше документов: на точке выдачи его спрашивают
          первым, и искать его под накладными неудобно. */}
      {lifecycle?.delivery_code && (
        <DeliveryCode code={lifecycle.delivery_code} />
      )}

      <Items order={order} />
      <ShippingDetails order={order} />
      <OrderSummary order={order} />
      <OrderDocuments orderId={order.id} />
    </section>
  )
}
