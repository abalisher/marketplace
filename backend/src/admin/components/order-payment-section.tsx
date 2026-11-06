import { orderLabel } from "../lib/order-label"
import { Badge, Button, StatusBadge, Text } from "@medusajs/ui"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useOrderPayment } from "../hooks/use-order-payment"
import { formatDate, formatDateTime } from "../lib/date"
import { formatTengeExact } from "../lib/money"
import { ORDER_PAYMENT_METHOD_LABEL } from "../lib/order"
import {
  AdminOrderPayment,
  ORDER_PAYMENT_STATUS_META,
  PAYMENT_CHANNEL_LABEL,
} from "../lib/payments"
import PaymentReceiptCard from "./payment-receipt-card"
import RecordPaymentPrompt from "./record-payment-prompt"

type OrderPaymentSectionProps = {
  orderId: string
  displayId: number | null
  // Номер для людей (ORG-26-0007); у заказов до 2026-11-02 — null.
  orderNumber?: string | null
  payment: AdminOrderPayment
  // Сборщик видит оплату, но денег не отмечает.
  readOnly?: boolean
}

// Оплата заказа в карточке (drawer очереди и виджет страницы заказа): способ,
// состояние, суммы, срок долга, куда переводить и журнал движений. Кнопки —
// «Отметить поступление», пока покупатель должен, и «Отметить возврат», пока
// по отменённому заказу надо вернуть деньги.
const OrderPaymentSection = ({
  orderId,
  displayId,
  orderNumber,
  payment,
  readOnly,
}: OrderPaymentSectionProps) => {
  const { t } = useTranslation()
  const { recordMutation } = useOrderPayment()
  const [prompt, setPrompt] = useState<"receive" | "refund" | null>(null)
  const meta = ORDER_PAYMENT_STATUS_META[payment.status]

  const canReceive =
    !readOnly &&
    payment.outstanding > 0 &&
    ["awaiting", "debt_requested", "debt"].includes(payment.status)
  const canRefund = !readOnly && payment.refund_due > 0

  return (
    <div className="flex flex-col gap-y-3" data-sm-section="payment">
      <div className="flex items-center justify-between gap-x-2">
        <Text size="small" weight="plus">
          {t("payments.section.title")}
        </Text>
        <div className="flex items-center gap-x-2">
          <Badge size="2xsmall">{t(ORDER_PAYMENT_METHOD_LABEL[payment.method])}</Badge>
          <StatusBadge color={payment.overdue ? "red" : meta.color}>
            {payment.overdue ? t("payments.status.overdue") : t(meta.label)}
          </StatusBadge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Amount label={t("payments.section.amount")} value={payment.amount} />
        <Amount label={t("payments.section.paid")} value={payment.paid_amount} />
        {payment.outstanding > 0 && (
          <Amount label={t("payments.section.outstanding")} value={payment.outstanding} strong />
        )}
        {payment.refund_due > 0 && (
          <Amount label={t("payments.section.refundDue")} value={payment.refund_due} strong />
        )}
        {payment.refunded_amount > 0 && (
          <Amount label={t("payments.section.refunded")} value={payment.refunded_amount} />
        )}
        {payment.due_date && (
          <div className="flex flex-col gap-y-1">
            <Text size="xsmall" className="text-ui-fg-subtle">
              {t("payments.section.dueDate")}
            </Text>
            <Text
              size="small"
              weight="plus"
              className={payment.overdue ? "text-ui-fg-error" : undefined}
            >
              {formatDate(payment.due_date)}
            </Text>
          </div>
        )}
      </div>

      {payment.status === "awaiting" && payment.method === "kaspi_transfer" && (
        <Text size="xsmall" className="text-ui-fg-subtle">
          {payment.transfer
            ? t("payments.section.transferHint", {
                phone: payment.transfer.phone,
                id: orderLabel(orderNumber, displayId),
              })
            : t("payments.section.transferHintNoPhone")}
        </Text>
      )}
      {payment.status === "debt_requested" && (
        <Text size="xsmall" className="text-ui-fg-subtle">
          {t("payments.section.debtRequestedHint")}
        </Text>
      )}
      {payment.method_history.map((change, index) => (
        <Text key={index} size="xsmall" className="text-ui-fg-subtle">
          {t("payments.section.methodChanged", {
            from: t(ORDER_PAYMENT_METHOD_LABEL[change.from]),
            to: t(ORDER_PAYMENT_METHOD_LABEL[change.to]),
            date: formatDateTime(change.at),
          })}
        </Text>
      ))}
      {payment.approved_at && (
        <Text size="xsmall" className="text-ui-fg-subtle">
          {t("payments.section.approved", {
            date: formatDate(payment.approved_at),
            name: payment.approved_by_name ?? "—",
          })}
        </Text>
      )}

      {payment.receipts.length > 0 && (
        <div className="flex flex-col gap-y-2">
          <Text size="xsmall" weight="plus" className="text-ui-fg-subtle">
            {t("payments.receipts.title")}
          </Text>
          {payment.receipts.map((receipt) => (
            <PaymentReceiptCard
              key={receipt.id}
              orderId={orderId}
              receipt={receipt}
              outstanding={payment.outstanding}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}

      {payment.entries.length > 0 && (
        <ul className="flex flex-col gap-y-1">
          {payment.entries.map((entry) => (
            <li key={entry.id} className="flex items-baseline justify-between gap-x-3">
              <Text size="xsmall" className="text-ui-fg-subtle">
                {formatDateTime(entry.occurred_at)} ·{" "}
                {t(entry.kind === "refund" ? "payments.kind.refund" : "payments.kind.payment")} ·{" "}
                {t(PAYMENT_CHANNEL_LABEL[entry.channel])}
                {entry.actor_type === "system"
                  ? ` · ${t("payments.actor.system")}`
                  : entry.actor_name
                  ? ` · ${entry.actor_name}`
                  : ""}
                {entry.note ? ` · ${entry.note}` : ""}
              </Text>
              <Text
                size="small"
                weight="plus"
                className={entry.kind === "refund" ? "text-ui-fg-error" : undefined}
              >
                {entry.kind === "refund" ? "−" : "+"}
                {formatTengeExact(entry.amount)}
              </Text>
            </li>
          ))}
        </ul>
      )}

      {(canReceive || canRefund) && (
        <div className="flex flex-wrap gap-2">
          {canReceive && (
            <Button size="small" variant="secondary" onClick={() => setPrompt("receive")}>
              {payment.method === "debt"
                ? t("payments.section.recordRepayment")
                : t("payments.section.recordTransfer")}
            </Button>
          )}
          {canRefund && (
            <Button size="small" variant="secondary" onClick={() => setPrompt("refund")}>
              {t("payments.section.recordRefund")}
            </Button>
          )}
        </div>
      )}

      <RecordPaymentPrompt
        target={
          prompt
            ? {
                kind: prompt,
                display_id: displayId,
                order_number: orderNumber,
                max_amount: prompt === "refund" ? payment.refund_due : payment.outstanding,
                default_channel:
                  payment.method === "kaspi_qr" ? "kaspi_qr" : "kaspi_transfer",
              }
            : null
        }
        onClose={() => setPrompt(null)}
        isPending={recordMutation.isPending}
        onSubmit={(values) =>
          prompt &&
          recordMutation.mutate(
            { orderId, kind: prompt, ...values },
            { onSuccess: () => setPrompt(null) }
          )
        }
      />
    </div>
  )
}

const Amount = ({
  label,
  value,
  strong,
}: {
  label: string
  value: number
  strong?: boolean
}) => (
  <div className="flex flex-col gap-y-1">
    <Text size="xsmall" className="text-ui-fg-subtle">
      {label}
    </Text>
    <Text size="small" weight={strong ? "plus" : "regular"}>
      {formatTengeExact(value)}
    </Text>
  </div>
)

export default OrderPaymentSection
