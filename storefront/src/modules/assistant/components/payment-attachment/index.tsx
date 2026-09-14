"use client"

import { AssistantPayment } from "@lib/data/assistant"
import { getKaspiPaymentStatus } from "@lib/data/payment"
import { useMessages } from "@lib/i18n/i18n-context"
import { convertToLocale } from "@lib/util/money"
import KaspiPayPanel from "@modules/common/components/kaspi-pay-panel"
import { clx } from "@medusajs/ui"
import { useEffect, useState } from "react"

const POLL_INTERVAL_MS = 4000

// Оплаченные/провалившиеся состояния оплаты Kaspi (те же, что в mobile):
// поллинг останавливается, как только статус стал терминальным.
const PAID_STATES = ["authorized", "captured"]
const FAILED_STATES = ["canceled", "error"]

// Вставка «оплата Kaspi» (1c): сумма, QR, честный статус. Кнопок оформления в
// ленте нет — покупатель платит в приложении Kaspi, ассистент видит оплату сам.
// Статус подтягивается поллингом гостевого GET /store/carts/:id/payment/kaspi
// (тот же роут, что у mobile), пока не станет терминальным.
const PaymentAttachment = ({
  payment,
  cartId,
  onPaid,
}: {
  payment: AssistantPayment
  cartId?: string
  // Поллинг увидел оплату: диалог продолжается сам, покупателю не нужно
  // отдельно сообщать «я оплатил» (замечание владельца на приёмке 2026-08-11:
  // «статус оплачено, почему сессия автоматом не продолжила?»).
  onPaid?: () => void
}) => {
  const m = useMessages()
  const [status, setStatus] = useState(payment.status)
  const [paid, setPaid] = useState(payment.paid)
  const [hasError, setHasError] = useState(false)

  const isFailed = FAILED_STATES.includes(status)
  const isFinal = paid || isFailed

  // Поллинг живёт, пока статус не терминальный: cart_id обязателен (гостевой
  // доступ к оплате — по нему), иначе вставка остаётся статичной.
  useEffect(() => {
    if (!cartId || isFinal) {
      return
    }

    let cancelled = false

    const poll = async () => {
      try {
        const next = await getKaspiPaymentStatus(cartId)
        if (cancelled) {
          return
        }
        setHasError(false)
        setStatus(next.status)
        const isPaid = PAID_STATES.includes(next.status)
        setPaid(isPaid)
        if (isPaid) {
          // Ход продолжает ЛЕНТА, а не вставка: она знает историю и токены.
          onPaid?.()
        }
      } catch {
        if (!cancelled) {
          setHasError(true)
        }
      }
    }

    const timer = setInterval(poll, POLL_INTERVAL_MS)

    // Возврат во вкладку — самый вероятный момент «уже оплатил»: на телефоне
    // покупатель уходит по ссылке в приложение Kaspi и возвращается сюда же.
    // Спрашиваем статус сразу, иначе лента ещё несколько секунд врёт «ожидаем».
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        poll()
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange)

    return () => {
      cancelled = true
      clearInterval(timer)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
    // onPaid в зависимостях не нужен: ссылка меняется на каждом рендере ленты и
    // перезапускала бы поллинг (у вызова есть свой однократный guard в ленте).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartId, isFinal, status])

  const retry = async () => {
    if (!cartId) {
      return
    }
    try {
      const next = await getKaspiPaymentStatus(cartId)
      setHasError(false)
      setStatus(next.status)
      setPaid(PAID_STATES.includes(next.status))
    } catch {
      setHasError(true)
    }
  }

  const statusLabel = paid
    ? m.assistant.payment.paid
    : isFailed
    ? m.assistant.payment.failed
    : m.assistant.payment.waiting

  return (
    <div
      className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4"
      data-testid="assistant-payment"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-title-medium text-ink">
          {m.assistant.payment.title}
        </span>
        <span
          className={clx(
            "rounded-chip px-2 py-1 text-body-medium font-semibold",
            paid && "bg-success/10 text-success",
            isFailed && "bg-error/10 text-error",
            !isFinal && "bg-warning/10 text-warning"
          )}
          data-testid="assistant-payment-status"
        >
          {statusLabel}
        </span>
      </div>

      {payment.amount !== null && (
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

      {!isFinal && (
        <KaspiPayPanel
          qrPayload={payment.qr_payload}
          paymentUrl={payment.payment_url}
        />
      )}

      {hasError && (
        <div className="flex items-center justify-between gap-2 rounded-chip bg-error/10 px-3 py-2">
          <span className="text-body-medium text-error">
            {m.assistant.payment.statusError}
          </span>
          <button
            type="button"
            onClick={retry}
            className="text-body-medium font-semibold text-accent hover:text-accent-pressed"
            data-testid="assistant-payment-retry"
          >
            {m.assistant.payment.refresh}
          </button>
        </div>
      )}
    </div>
  )
}

export default PaymentAttachment
