"use client"

import { BuyerOrderPayment } from "@lib/data/payment"
import { formatShortDate } from "@lib/i18n/format-date"
import { useMessages } from "@lib/i18n/i18n-context"
import { convertToLocale } from "@lib/util/money"
import { clx } from "@medusajs/ui"
import { useRef, useState } from "react"

const MAX_BYTES = 8 * 1024 * 1024
const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,application/pdf"
const MIME_TYPES = ACCEPT.split(",")

// Значок статуса чека — кружок, как отметка операции в Kaspi.
const ReceiptStatusIcon = ({ status }: { status: string }) => (
  <span
    aria-hidden="true"
    className={clx(
      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
      status === "accepted"
        ? "bg-success/15 text-success"
        : status === "pending"
        ? "bg-warning/15 text-warning"
        : "bg-error/15 text-error"
    )}
  >
    <svg viewBox="0 0 20 20" className="h-5 w-5">
      {status === "accepted" ? (
        <path
          d="M4.5 10.5l3.5 3.5 7.5-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : status === "pending" ? (
        <>
          <circle
            cx="10"
            cy="10"
            r="6.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M10 6.5V10l2.5 1.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </>
      ) : (
        <path
          d="M6 6l8 8M14 6l-8 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
    </svg>
  </span>
)

// Файл → base64 без префикса data:…;base64, (так его ждёт бэкенд).
const readBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "")
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

// Чек Kaspi по переводу или погашению долга: покупатель прикладывает снимок
// экрана или PDF, бэкенд сразу проверяет его (сумма, получатель, дата, номер
// квитанции, повторы) и отдаёт обновлённую оплату заказа. Тело — через свой
// route handler (`app/api/orders/[id]/receipt`): у server action предел 1 МБ.
// Подтверждает оплату продавец — здесь только статус чека и почему его не
// примут.
const PaymentReceipts = ({
  orderId,
  payment,
  onUpdated,
}: {
  orderId: string
  payment: BuyerOrderPayment
  onUpdated: (payment: BuyerOrderPayment) => void
}) => {
  const m = useMessages()
  const t = m.payment.order.receipt
  const input = useRef<HTMLInputElement>(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const send = async (file: File) => {
    setError(null)
    if (!MIME_TYPES.includes(file.type)) {
      setError(t.wrongType)
      return
    }
    if (file.size > MAX_BYTES) {
      setError(t.tooBig)
      return
    }
    setSending(true)
    try {
      const response = await fetch(`/api/orders/${orderId}/receipt`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          file: {
            name: file.name,
            mime_type: file.type,
            data: await readBase64(file),
          },
        }),
      })
      const body = (await response.json().catch(() => null)) as {
        payment?: BuyerOrderPayment | null
        message?: string
      } | null
      if (!response.ok || !body?.payment) {
        setError(body?.message || t.failed)
        return
      }
      onUpdated(body.payment)
    } catch {
      setError(t.failed)
    } finally {
      setSending(false)
      if (input.current) {
        input.current.value = ""
      }
    }
  }

  if (!payment.can_send_receipt && !payment.receipts.length) {
    return null
  }

  return (
    <div className="flex flex-col gap-2" data-testid="order-payment-receipts">
      <span className="text-body-large font-semibold text-ink">{t.title}</span>

      {payment.receipts.map((receipt) => (
        <div
          key={receipt.id}
          className="flex items-start gap-3 rounded-card border border-line bg-surface px-3 py-3"
          data-testid="order-payment-receipt"
        >
          <ReceiptStatusIcon status={receipt.status} />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="flex items-baseline justify-between gap-2">
              <span
                className={clx(
                  "text-body-large font-semibold",
                  receipt.status === "accepted"
                    ? "text-success"
                    : receipt.status === "pending"
                    ? "text-ink"
                    : "text-error"
                )}
              >
                {t.status[receipt.status]}
              </span>
              <span className="text-body-large font-semibold tabular-nums text-ink">
                {receipt.amount != null
                  ? convertToLocale({
                      amount: receipt.amount,
                      currency_code: payment.currency_code,
                    })
                  : null}
              </span>
            </div>
            <span className="text-body-medium text-ink-secondary">
              {formatShortDate(receipt.created_at)}
            </span>
            {receipt.problems.map((problem) => (
              <span key={problem} className="text-body-medium text-error">
                {problem}
              </span>
            ))}
            {receipt.review_note && (
              <span className="text-body-medium text-ink-secondary">
                {t.reason.replace("{note}", receipt.review_note)}
              </span>
            )}
          </div>
        </div>
      ))}

      {payment.can_send_receipt && (
        <>
          <p className="text-body-medium text-ink-secondary">{t.hint}</p>
          <input
            ref={input}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) {
                send(file)
              }
            }}
            data-testid="order-payment-receipt-input"
          />
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={sending}
            className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-card bg-kaspi px-4 text-[19px] font-bold text-on-kaspi shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
            data-testid="order-payment-receipt-send"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
              <path
                d="M13.5 7.5l-5 5a1.8 1.8 0 01-2.5-2.5l5.5-5.5a3 3 0 014.2 4.2L10 14.4a4.2 4.2 0 01-6-6l5-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {sending ? t.sending : t.send}
          </button>
        </>
      )}

      {error && (
        <p className="text-body-medium text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default PaymentReceipts
