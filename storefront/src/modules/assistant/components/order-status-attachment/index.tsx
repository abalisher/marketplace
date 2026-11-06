"use client"

import { orderLabel } from "@lib/util/order-label"
import { AssistantOrderStatus } from "@lib/data/assistant"
import OrderStageBadge from "@modules/cabinet/components/order-stage-badge"
import { useMessages } from "@lib/i18n/i18n-context"
import { formatDeliverySlot } from "@lib/util/delivery-slot"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@medusajs/ui"

// Порядок этапов заказа (enum ORDER_STATUSES модуля order-lifecycle) —
// по нему рисуется горизонтальный степпер, как в mobile 1g.
const STAGES = [
  "new",
  "confirmed",
  "assembling",
  "partially_assembled",
  "assembled",
  "in_delivery",
  "delivered",
] as const

// Вставка «статус заказа» (1c): номер, человеческий статус, этап и код
// получения. READ-ONLY. Неизвестный этап (например, canceled или новый статус
// бэкенда) не ломает вставку: степпер прячется, показываем подпись как есть.
// `delivery_stage` — код статуса жизненного цикла с бэкенда, поэтому степпер
// виден с самого оформления, а не только после назначения курьера (T3.11).
//
// `orderId` — токен диалога (тот же, что клиент шлёт обратно ходом): вставка
// всегда описывает ИМЕННО его, поэтому по нему даём ссылку на карточку заказа
// (блокер Б3 прогона 2026-08-13 — из ленты до документов было не добраться).
// Ссылка ведёт в кабинет (T10.6), поэтому показываем её только залогиненному:
// гостю кабинет предложит войти, а его заказ живёт в диалоге.
const OrderStatusAttachment = ({
  order,
  orderId,
  isAuthenticated,
}: {
  order: AssistantOrderStatus
  orderId?: string
  isAuthenticated?: boolean
}) => {
  const m = useMessages()

  const stageIndex = order.delivery_stage
    ? STAGES.indexOf(order.delivery_stage as (typeof STAGES)[number])
    : -1

  // Слот доставки — главный ответ на «когда привезут» (T5.6a): до этого он жил
  // только в тексте ассистента, и карточка статуса оставалась без срока.
  // null — заказ оформлен до появления слотов, строку не рисуем.
  const slotLabel = formatDeliverySlot(
    order.delivery_date,
    order.delivery_window,
    m.common.deliverySlot.months
  )

  const stageLabel = order.delivery_stage
    ? (m.assistant.order.stage as Record<string, string>)[
        order.delivery_stage
      ] ?? order.delivery_stage
    : null

  return (
    <div
      className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4"
      data-testid="assistant-order-status"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-title-medium text-ink">
          {order.display_id !== null || order.order_number
            ? m.assistant.order.number.replace(
                "{id}",
                orderLabel(order.order_number, order.display_id)
              )
            : m.assistant.attachment.orderStatus}
        </span>
        {/* Тот же бейдж стадии, что в кабинете: цвет — по смыслу стадии. */}
        {stageLabel && order.delivery_stage && (
          <OrderStageBadge status={order.delivery_stage} />
        )}
      </div>

      {order.status_text && (
        <span className="text-body-large text-ink">{order.status_text}</span>
      )}

      {slotLabel && (
        <div
          className="flex flex-wrap items-baseline gap-2"
          data-testid="assistant-order-slot"
        >
          <span className="text-body-medium text-ink-secondary">
            {m.common.deliverySlot.title}
          </span>
          <span className="text-body-large text-ink">{slotLabel}</span>
        </div>
      )}

      {/* Прогресс курьера — отдельной строкой: он появляется только после
          назначения рейса и не должен подменять стадию заказа (T3.11). */}
      {order.courier_note && (
        <span className="text-body-medium text-ink-secondary">
          {order.courier_note}
        </span>
      )}

      {stageIndex >= 0 && (
        <div className="flex items-center gap-1" aria-hidden>
          {STAGES.map((stage, index) => (
            <span
              key={stage}
              className={clx(
                "h-1 flex-1 rounded-circle",
                index <= stageIndex ? "bg-accent" : "bg-line"
              )}
            />
          ))}
        </div>
      )}

      {/* Код нужен до вручения: у полученного заказа он ничего не открывает. */}
      {order.delivery_code &&
        !["delivered", "closed", "canceled", "returned"].includes(
          order.delivery_stage ?? ""
        ) && (
        <div className="flex items-baseline gap-2">
          <span className="text-body-medium text-ink-secondary">
            {m.assistant.order.code}
          </span>
          <span className="text-price tabular-nums tracking-widest text-ink">
            {order.delivery_code}
          </span>
        </div>
      )}

      {orderId && isAuthenticated && (
        <LocalizedClientLink
          href={`/cabinet/orders/${orderId}`}
          className="flex min-h-[48px] items-center text-body-large font-semibold text-accent hover:text-accent-pressed"
          data-testid="assistant-order-link"
        >
          {m.assistant.order.open}
        </LocalizedClientLink>
      )}
    </div>
  )
}

export default OrderStatusAttachment
