"use client"

import { cancelMyOrder } from "@lib/data/order-lifecycle"
import { useMessages } from "@lib/i18n/i18n-context"
import { useRouter } from "next/navigation"
import { useState } from "react"

// «Отменить заказ» в кабинете — пока продавец заказ не подтвердил (дальше
// отменяет только продавец, бэкенд откажет). Отмена необратима, поэтому сначала
// подтверждение с необязательной причиной; если покупатель мог уже перевести
// деньги — предупреждаем, что их вернёт продавец.
const CancelOrder = ({
  orderId,
  displayId,
  mayHavePaid,
}: {
  orderId: string
  // Подпись заказа: «ORG-26-0007» или «№5».
  displayId: string | number | null
  mayHavePaid: boolean
}) => {
  const m = useMessages()
  const t = m.cabinet.order.cancel
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-[48px] w-fit items-center text-body-large text-error transition-colors hover:opacity-80"
        data-testid="cabinet-order-cancel"
      >
        {t.button}
      </button>
    )
  }

  const submit = async () => {
    setIsSending(true)
    setError(null)
    const result = await cancelMyOrder(orderId, reason.trim() || null)
    setIsSending(false)
    if (!result.ok) {
      setError(/подтвержд|confirmed/i.test(result.message) ? t.later : t.failed)
      return
    }
    setOpen(false)
    router.refresh()
  }

  return (
    <div
      className="flex flex-col gap-3 rounded-card border border-error/40 bg-surface p-4"
      data-testid="cabinet-order-cancel-confirm"
    >
      <span className="text-title-medium text-ink">
        {t.title.replace("{id}", String(displayId ?? ""))}
      </span>
      <span className="text-body-medium text-ink-secondary">{t.hint}</span>
      {mayHavePaid && (
        <span className="text-body-medium text-ink">{t.paidWarning}</span>
      )}
      <label className="flex flex-col gap-1">
        <span className="text-body-medium text-ink-secondary">{t.reasonLabel}</span>
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder={t.reasonPlaceholder}
          rows={2}
          className="rounded-chip border border-line bg-surface-dim px-3 py-2 text-body-medium text-ink placeholder:text-ink-secondary focus:border-accent focus:outline-none"
        />
      </label>
      {error && (
        <p className="text-body-medium text-error" role="alert">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={isSending}
          className="inline-flex min-h-[48px] items-center justify-center rounded-chip bg-error px-4 py-2 text-body-large text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          data-testid="cabinet-order-cancel-submit"
        >
          {t.confirm}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={isSending}
          className="inline-flex min-h-[48px] items-center justify-center rounded-chip border border-line bg-surface px-4 py-2 text-body-large text-ink transition-colors hover:bg-surface-dim"
        >
          {t.keep}
        </button>
      </div>
    </div>
  )
}

export default CancelOrder
