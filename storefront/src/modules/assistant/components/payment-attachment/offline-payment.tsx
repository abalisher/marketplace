"use client"

import { AssistantPayment } from "@lib/data/assistant"
import { formatShortDate } from "@lib/i18n/format-date"
import { useMessages } from "@lib/i18n/i18n-context"
import { convertToLocale } from "@lib/util/money"
import PaymentStatusChip from "@modules/common/components/payment-status-chip"
import TransferDetails from "@modules/common/components/transfer-details"
import ChangeMethodButton from "./change-method-button"

// Вставка «оплата» для перевода на номер Kaspi и «в долг». Статичная: банк
// в этих способах не участвует, поллить нечего — статус меняет продавец, и
// свежий покупатель увидит на странице заказа или в следующем ответе.
// Два состояния: способ выбран, заказ ещё не оформлен (order_display_id нет) —
// только сумма и что будет дальше; заказ оформлен — полная инструкция:
// куда переводить, точный комментарий «Заказ №N», срок долга.
const OfflinePaymentAttachment = ({
  payment,
  onReply,
}: {
  payment: AssistantPayment
  onReply?: (message: string) => void
}) => {
  const m = useMessages()
  const method = payment.provider === "debt" ? "debt" : "kaspi_transfer"
  const placed = Boolean(payment.order_display_id || payment.order_number)
  // До оформления статус — это статус сессии корзины (pending): бейдж
  // «Способ выбран». После — статус оплаты заказа бэкенда.
  const status = payment.paid ? "paid" : placed ? payment.status : "chosen"
  const dueDate = formatShortDate(payment.due_date)
  const owes = !payment.paid && status !== "canceled"

  return (
    <div
      className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4"
      data-testid="assistant-payment"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-title-medium text-ink">
          {m.payment.chatTitle[method]}
        </span>
        <span data-testid="assistant-payment-status">
          <PaymentStatusChip status={status} method={method} />
        </span>
      </div>

      {payment.amount !== null &&
        !(
          method === "kaspi_transfer" &&
          placed &&
          payment.transfer &&
          owes
        ) && (
          <div className="flex items-baseline gap-2">
            <span className="text-body-medium text-ink-secondary">
              {m.assistant.payment.amount}
            </span>
            <span className="text-price tabular-nums text-ink">
              {convertToLocale({
                amount: payment.amount,
                currency_code: payment.currency,
              })}
            </span>
          </div>
        )}

      {method === "kaspi_transfer" && !placed && (
        <p className="text-body-medium text-ink-secondary">
          {m.payment.transfer.afterOrder}
        </p>
      )}

      {method === "debt" && !placed && (
        <p className="text-body-medium text-ink">
          {m.payment.debt.requestWillGo}
        </p>
      )}

      {method === "debt" && status === "debt_requested" && (
        <p className="text-body-medium text-ink">
          {m.payment.debt.requestSent}
        </p>
      )}

      {method === "debt" && status === "debt" && (
        <p className="text-body-medium text-ink">{m.payment.debt.approved}</p>
      )}

      {method === "debt" && dueDate && (
        <p
          className="text-body-large font-semibold text-ink"
          data-testid="assistant-payment-due"
        >
          {m.payment.debt.dueBy.replace("{date}", dueDate)}
        </p>
      )}

      {placed && payment.transfer && owes && (
        <div className="flex flex-col gap-2">
          {method === "debt" && (
            <p className="text-body-medium text-ink-secondary">
              {m.payment.transfer.repay}
            </p>
          )}
          <TransferDetails
            transfer={payment.transfer}
            displayId={payment.order_display_id}
            orderNumber={payment.order_number}
            amount={method === "kaspi_transfer" ? payment.amount : null}
            currencyCode={payment.currency}
          />
          {method === "kaspi_transfer" && (
            <p className="text-body-medium text-ink-secondary">
              {m.payment.transfer.inWork}
            </p>
          )}
          <p className="text-body-medium text-ink-secondary">
            {m.payment.order.receipt.chatHint}
          </p>
        </div>
      )}

      {/* До оформления заказа способ можно сменить. */}
      {!placed && onReply && <ChangeMethodButton onReply={onReply} />}
    </div>
  )
}

export default OfflinePaymentAttachment
