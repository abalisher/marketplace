"use client"

import { useMessages } from "@lib/i18n/i18n-context"

// Бейдж стадии заказа. Подписи берём из словаря ассистента (`assistant.order
// .stage`): стадия одна и та же, и расхождение «в чате одно, в кабинете другое»
// было бы хуже дубля ключей. Незнакомая стадия печатается как есть — бейдж не
// исчезает и не ломает строку.
const OrderStageBadge = ({ status }: { status: string }) => {
  const m = useMessages()
  const label =
    (m.assistant.order.stage as Record<string, string>)[status] ?? status

  return (
    <span
      className="shrink-0 rounded-chip bg-accent-container px-2 py-1 text-body-medium font-semibold text-accent"
      data-testid="order-stage-badge"
    >
      {label}
    </span>
  )
}

export default OrderStageBadge
