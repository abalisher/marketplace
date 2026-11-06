"use client"

import { useMessages } from "@lib/i18n/i18n-context"
import { clx } from "@medusajs/ui"

// Цвет стадии — по смыслу для покупателя, чтобы список читался с первого
// взгляда: ждёт продавца — янтарный, в работе и в пути — синий, получен —
// зелёный, отменён или возвращён — красный.
const STAGE_TONE: Record<string, string> = {
  new: "bg-warning/15 text-warning",
  confirmed: "bg-info/15 text-info",
  assembling: "bg-info/15 text-info",
  partially_assembled: "bg-info/15 text-info",
  assembled: "bg-info/15 text-info",
  in_delivery: "bg-info/15 text-info",
  delivered: "bg-success/15 text-success",
  closed: "bg-success/15 text-success",
  canceled: "bg-error/15 text-error",
  returned: "bg-error/15 text-error",
}

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
      className={clx(
        "shrink-0 rounded-chip px-2 py-1 text-body-medium font-semibold",
        STAGE_TONE[status] ?? "bg-accent-container text-accent"
      )}
      data-testid="order-stage-badge"
    >
      {label}
    </span>
  )
}

export default OrderStageBadge
