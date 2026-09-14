"use client"

import { useMessages } from "@lib/i18n/i18n-context"

// След от нажатия счётчика в ленте (T10.15). Покупатель нажал «+» — корзина
// изменилась молча, и без отметки непонятно, сработало ли. Это ИМЕННО отметка
// события, а не реплика: пузыря нет, аватара нет, мелкий вторичный текст —
// иначе получилась бы та самая «фраза, которую я не писал» (замечание
// владельца 2026-08-31 к прежнему тапу по карточке).
const CartEventLine = ({
  title,
  quantity,
}: {
  title: string
  // 0 — позицию убрали.
  quantity: number
}) => {
  const m = useMessages()

  const text =
    quantity > 0
      ? m.assistant.cart.added
          .replace("{title}", title)
          .replace("{quantity}", String(quantity))
      : m.assistant.cart.removed.replace("{title}", title)

  return (
    <p
      className="text-body-medium text-ink-secondary"
      data-testid="assistant-cart-event"
    >
      {text}
    </p>
  )
}

export default CartEventLine
