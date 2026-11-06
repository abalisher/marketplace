"use client"

import { useMessages } from "@lib/i18n/i18n-context"
import { useState } from "react"

// «Выбрать другой способ оплаты» на карточке оплаты, пока заказ не оформлен и
// Kaspi не оплачен. Нажатие — реплика покупателя в чат, ассистент снова
// покажет кнопки способов. После нажатия кнопка гаснет: вторая реплика лишняя.
const ChangeMethodButton = ({ onReply }: { onReply: (message: string) => void }) => {
  const m = useMessages()
  const [sent, setSent] = useState(false)

  return (
    <button
      type="button"
      disabled={sent}
      onClick={() => {
        setSent(true)
        onReply(m.payment.chatPick.changeReply)
      }}
      className="self-start text-body-medium font-semibold text-ink-secondary transition-colors hover:text-ink disabled:opacity-50"
      data-testid="assistant-payment-change-method"
    >
      {m.payment.chatPick.change}
    </button>
  )
}

export default ChangeMethodButton
