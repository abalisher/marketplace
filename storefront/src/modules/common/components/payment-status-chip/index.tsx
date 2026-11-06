"use client"

import { useMessages } from "@lib/i18n/i18n-context"
import { clx } from "@medusajs/ui"

// Статус оплаты заказа бейджем: «Ждём перевод», «Ждёт решения продавца»,
// «В долг», «Оплачено»… Статусы — `BuyerOrderPayment.status` бэкенда; всё
// незнакомое (статусы сессии корзины, пока заказ не оформлен) — «Способ
// выбран». Общий для карточки оплаты в чате и страниц заказа.
const PaymentStatusChip = ({
  status,
  method,
  overdue = false,
}: {
  status: string
  method?: string | null
  overdue?: boolean
}) => {
  const m = useMessages()
  const labels = m.payment.status

  let label: string = labels.chosen
  let tone: "success" | "warning" | "error" | "neutral" = "neutral"

  switch (status) {
    case "awaiting":
      label =
        method === "kaspi_transfer" ? labels.awaitingTransfer : labels.awaiting
      tone = "warning"
      break
    case "debt_requested":
      label = labels.debt_requested
      tone = "warning"
      break
    case "debt":
      label = overdue ? labels.overdue : labels.debt
      tone = overdue ? "error" : "warning"
      break
    case "paid":
      label = labels.paid
      tone = "success"
      break
    case "canceled":
      label = labels.canceled
      tone = "error"
      break
    case "refund_due":
      label = labels.refund_due
      tone = "warning"
      break
    case "refunded":
      label = labels.refunded
      break
  }

  return (
    <span
      className={clx(
        "shrink-0 rounded-chip px-2 py-1 text-body-medium font-semibold",
        tone === "success" && "bg-success/10 text-success",
        tone === "warning" && "bg-warning/10 text-warning",
        tone === "error" && "bg-error/10 text-error",
        tone === "neutral" && "bg-surface-dim text-ink-secondary"
      )}
      data-testid="payment-status-chip"
    >
      {label}
    </span>
  )
}

export default PaymentStatusChip
