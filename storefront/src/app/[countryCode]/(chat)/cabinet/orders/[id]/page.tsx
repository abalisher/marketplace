import { orderLabel } from "@lib/util/order-label"
import { formatDate } from "@lib/i18n/format-date"
import { resolveLocale } from "@lib/i18n/resolve-locale"
import { getServerMessages } from "@lib/i18n/server"
import { retrieveOrderLifecycle } from "@lib/data/order-lifecycle"
import { retrieveOrder } from "@lib/data/orders"
import { getOrderPayment } from "@lib/data/payment"
import { listOrderReviews } from "@lib/data/reviews"
import { formatDeliverySlot } from "@lib/util/delivery-slot"
import CancelOrder from "@modules/cabinet/components/cancel-order"
import DeliveryCode from "@modules/cabinet/components/delivery-code"
import OrderReview from "@modules/cabinet/components/order-review"
import OrderProgress from "@modules/cabinet/components/order-progress"
import OrderStageBadge from "@modules/cabinet/components/order-stage-badge"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Items from "@modules/order/components/items"
import OrderDocuments from "@modules/order/components/order-documents"
import OrderPayment from "@modules/order/components/order-payment"
import OrderSummary from "@modules/order/components/order-summary"
import ShippingDetails from "@modules/order/components/shipping-details"
import { Metadata } from "next"
import { notFound } from "next/navigation"

// Стадии, после которых заказ у покупателя: код получения уже назван, можно
// оценить заказ (то же правило проверяет бэкенд отзывов).
const RECEIVED_STATUSES = ["delivered", "closed"]
// Код получения нужен, пока заказ не вручён (и не отменён).
const CODE_STATUSES = ["assembled", "partially_assembled", "in_delivery"]

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id } = await props.params
  const [order, lifecycle] = await Promise.all([
    retrieveOrder(id).catch(() => null),
    retrieveOrderLifecycle(id),
  ])

  return {
    title: order
      ? `Order ${orderLabel(lifecycle?.number, order.display_id)}`
      : "Order",
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

  const [lifecycle, m, locale, payment] = await Promise.all([
    retrieveOrderLifecycle(id),
    getServerMessages(),
    resolveLocale(),
    // Оплата по способам продавца (перевод, долг); null — старый заказ,
    // оплаченный Kaspi QR: блок оплаты не рисуем, как и раньше.
    getOrderPayment(id),
  ])
  const received = RECEIVED_STATUSES.includes(lifecycle?.status ?? "")
  const reviews = received ? await listOrderReviews(id) : []

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
            orderLabel(lifecycle?.number, order.display_id)
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

      {/* Оплата — сразу под стадией: пока ждём перевод, номер Kaspi и
          комментарий «Заказ №N» — главное, зачем покупатель открыл заказ. */}
      {payment && <OrderPayment payment={payment} orderId={order.id} />}

      {/* Код получения — выше документов: на точке выдачи его спрашивают
          первым, и искать его под накладными неудобно. */}
      {lifecycle?.delivery_code && CODE_STATUSES.includes(lifecycle.status) && (
        <DeliveryCode code={lifecycle.delivery_code} />
      )}

      {/* Заказ получен — оценка товара и доставки, а проблема уходит в чат:
          претензию оформляет ассистент (open_dispute). */}
      {received && (
        <>
          <OrderReview orderId={order.id} initialReviews={reviews} />
          <p className="text-body-medium text-ink-secondary">
            {m.cabinet.order.problem}{" "}
            <LocalizedClientLink
              href={`/chat?prompt=${encodeURIComponent(
                m.cabinet.order.problemPrompt.replace(
                  "{id}",
                  orderLabel(lifecycle?.number, order.display_id)
                )
              )}`}
              className="text-accent underline-offset-2 hover:underline"
              data-testid="cabinet-order-problem"
            >
              {m.cabinet.order.problemLink}
            </LocalizedClientLink>
          </p>
        </>
      )}

      {/* Доставка с ходом заказа — выше состава: «где заказ и у кого» —
          второй после оплаты вопрос покупателя. */}
      <ShippingDetails order={order} slotLabel={slotLabel}>
        {lifecycle?.status && (
          <OrderProgress
            status={lifecycle.status}
            previousStatus={lifecycle.previous_status}
            deliveryMethod={lifecycle.delivery_method}
            history={lifecycle.history}
            placedAt={order.created_at as string | Date}
          />
        )}
      </ShippingDetails>
      <Items order={order} />
      <OrderSummary order={order} />
      <OrderDocuments orderId={order.id} />

      {/* Отменить сам покупатель может, пока продавец не подтвердил заказ;
          перевод мог уже уйти — тогда предупреждаем о возврате через продавца. */}
      {lifecycle?.status === "new" && (
        <CancelOrder
          orderId={order.id}
          displayId={orderLabel(lifecycle?.number, order.display_id)}
          mayHavePaid={
            !!payment &&
            payment.method !== "kaspi_qr" &&
            (payment.method === "kaspi_transfer" || payment.paid_amount > 0)
          }
        />
      )}
    </section>
  )
}
