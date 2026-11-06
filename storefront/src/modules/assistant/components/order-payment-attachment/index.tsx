"use client"

import { orderLabel } from "@lib/util/order-label"
import { AssistantOrderPayment } from "@lib/data/assistant"
import { BuyerOrderPayment, getOrderPayment } from "@lib/data/payment"
import { useMessages } from "@lib/i18n/i18n-context"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import OrderPayment from "@modules/order/components/order-payment"
import { useEffect, useState } from "react"

// Оплата оформленного заказа в ленте чата (перевод, долг). Карточка
// постоянная — остаётся в истории под своим ответом, а состояние читает живым
// при каждом открытии: номер для перевода, «Прикрепить чек», смена способа,
// статус чека. Снимок устарел бы: «ждём перевод» висел бы и после оплаты.
// Блок — тот же, что на странице заказа (`OrderPayment`).
const OrderPaymentAttachment = ({
  attachment,
}: {
  attachment: AssistantOrderPayment
}) => {
  const m = useMessages()
  const [payment, setPayment] = useState<BuyerOrderPayment | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    getOrderPayment(attachment.order_id).then((next) => {
      if (!cancelled) {
        setPayment(next)
      }
    })
    return () => {
      cancelled = true
    }
  }, [attachment.order_id])

  if (payment === null) {
    return null
  }

  return (
    <div className="flex flex-col gap-2" data-testid="assistant-order-payment">
      {payment ? (
        <OrderPayment payment={payment} orderId={attachment.order_id} />
      ) : (
        <div className="h-24 animate-pulse rounded-card border border-line bg-surface" />
      )}
      <LocalizedClientLink
        href={`/cabinet/orders/${attachment.order_id}`}
        className="w-fit text-body-medium font-semibold text-accent hover:text-accent-pressed"
        data-testid="assistant-order-payment-open"
      >
        {m.payment.order.openOrder.replace(
          "{id}",
          orderLabel(attachment.order_number, attachment.display_id)
        )}
      </LocalizedClientLink>
    </div>
  )
}

export default OrderPaymentAttachment
