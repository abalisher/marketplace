"use client"

import { useMessages } from "@lib/i18n/i18n-context"

// Код получения заказа: покупатель называет его водителю при вручении. Отдаём
// его крупно и моноширинно — код диктуют вслух, а не читают глазами.
const DeliveryCode = ({ code }: { code: string }) => {
  const m = useMessages()

  return (
    <div
      className="flex flex-col gap-1 rounded-card border border-accent bg-accent-container p-4"
      data-testid="cabinet-delivery-code"
    >
      <span className="text-body-medium text-ink-secondary">
        {m.cabinet.order.code}
      </span>
      <span className="text-price tabular-nums tracking-widest text-ink">
        {code}
      </span>
      <span className="text-body-medium text-ink-secondary">
        {m.cabinet.order.codeHint}
      </span>
    </div>
  )
}

export default DeliveryCode
