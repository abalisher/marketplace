"use client"

import { AssistantPayment } from "@lib/data/assistant"
import KaspiPaymentAttachment from "./kaspi-payment"
import OfflinePaymentAttachment from "./offline-payment"

// Вставка «оплата»: по способу оплаты. Kaspi QR — счёт с QR и поллингом
// статуса (`kaspi-payment`); перевод на номер Kaspi и «в долг» — статичная
// карточка с инструкцией (`offline-payment`): денег через банк там нет,
// поллить нечего, оплату продавец отмечает сам.
const PaymentAttachment = ({
  payment,
  cartId,
  onPaid,
  onReply,
}: {
  payment: AssistantPayment
  cartId?: string
  onPaid?: () => void
  // Реплика покупателя в чат («выбрать другой способ оплаты»).
  onReply?: (message: string) => void
}) => {
  if (payment.provider === "kaspi_transfer" || payment.provider === "debt") {
    return <OfflinePaymentAttachment payment={payment} onReply={onReply} />
  }

  return (
    <KaspiPaymentAttachment
      payment={payment}
      cartId={cartId}
      onPaid={onPaid}
      onReply={onReply}
    />
  )
}

export default PaymentAttachment
