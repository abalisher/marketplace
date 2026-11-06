"use client"

import { AssistantPayment } from "@lib/data/assistant"
import { getKaspiPaymentStatus, mockPayKaspi } from "@lib/data/payment"
import { FEATURE_KASPI_MOCK } from "@lib/feature-flags"
import { useMessages } from "@lib/i18n/i18n-context"
import { convertToLocale } from "@lib/util/money"
import ChangeMethodButton from "./change-method-button"
import KaspiPayPanel from "@modules/common/components/kaspi-pay-panel"
import KaspiLogo from "@modules/landing/components/kaspi-logo"
import { clx } from "@medusajs/ui"
import { useEffect, useState } from "react"

const POLL_INTERVAL_MS = 4000

// Оплаченные/провалившиеся состояния оплаты Kaspi (те же, что в mobile):
// поллинг останавливается, как только статус стал терминальным.
const PAID_STATES = ["authorized", "captured"]
const FAILED_STATES = ["canceled", "error"]

// Вставка «оплата Kaspi QR» (1c, provider: "kaspi"): сумма, QR, честный статус. Кнопок оформления в
// ленте нет — покупатель платит в приложении Kaspi, ассистент видит оплату сам.
// Статус подтягивается поллингом гостевого GET /store/carts/:id/payment/kaspi
// (тот же роут, что у mobile), пока не станет терминальным.
const KaspiPaymentAttachment = ({
  payment,
  cartId,
  onPaid,
  onReply,
}: {
  payment: AssistantPayment
  cartId?: string
  // Поллинг увидел оплату: диалог продолжается сам, покупателю не нужно
  // отдельно сообщать «я оплатил» (замечание владельца на приёмке 2026-08-11:
  // «статус оплачено, почему сессия автоматом не продолжила?»).
  onPaid?: () => void
  onReply?: (message: string) => void
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

  // Тестовая оплата (стенд, NEXT_PUBLIC_KASPI_MOCK=true): без cart_id оплату
  // не адресовать, поэтому кнопки нет и в этом случае.
  const [mockPaying, setMockPaying] = useState(false)
  const [mockError, setMockError] = useState(false)
  const showMockPay = FEATURE_KASPI_MOCK && Boolean(cartId) && !isFinal

  const handleMockPay = async () => {
    if (!cartId) {
      return
    }
    setMockPaying(true)
    setMockError(false)
    try {
      const next = await mockPayKaspi(cartId)
      setHasError(false)
      setStatus(next.status)
      const isPaid = PAID_STATES.includes(next.status)
      setPaid(isPaid)
      if (isPaid) {
        onPaid?.()
      }
    } catch {
      setMockError(true)
    } finally {
      setMockPaying(false)
    }
  }

  const statusLabel = paid
    ? m.assistant.payment.paid
    : isFailed
    ? m.assistant.payment.failed
    : m.assistant.payment.waiting

  return (
    <div
      className="flex flex-col overflow-hidden rounded-card border border-line bg-surface"
      data-testid="assistant-payment"
    >
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <KaspiLogo size={32} />
          <div className="flex min-w-0 flex-col">
            <span className="text-title-medium text-ink">
              {m.assistant.payment.title}
            </span>
            <span className="truncate text-body-medium text-ink-secondary">
              {m.payment.methods.kaspi_qr.title}
            </span>
          </div>
        </div>
        <span
          className={clx(
            "shrink-0 rounded-chip px-2.5 py-1 text-body-medium font-semibold",
            paid && "bg-success/10 text-success",
            isFailed && "bg-error/10 text-error",
            !isFinal && "bg-kaspi/10 text-kaspi"
          )}
          data-testid="assistant-payment-status"
        >
          {statusLabel}
        </span>
      </div>

      {/* Полоса с суммой — как в квитанции Kaspi: «К оплате» на тёплой
          подложке бренда, оплачено — зелёная «Оплата получена». */}
      {payment.amount !== null && (
        <div
          className={clx(
            "flex flex-col gap-0.5 px-4 py-4",
            paid ? "bg-success/10" : "bg-kaspi/10"
          )}
          data-testid="assistant-payment-band"
        >
          <span
            className={clx(
              "text-body-large font-semibold",
              paid ? "text-success" : "text-ink"
            )}
          >
            {paid ? m.payment.order.paidBand : m.payment.order.toPay}
          </span>
          <span
            className={clx(
              "text-[32px] font-bold leading-[38px] tabular-nums",
              paid ? "text-success" : "text-ink"
            )}
          >
            {convertToLocale({
              amount: payment.amount,
              currency_code: payment.currency,
            })}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-4 p-4 empty:hidden">
        {!isFinal && (
          <KaspiPayPanel
            qrPayload={payment.qr_payload}
            paymentUrl={payment.payment_url}
          />
        )}

        {showMockPay && (
          <button
            type="button"
            onClick={handleMockPay}
            disabled={mockPaying}
            className="w-full rounded-chip border border-line bg-surface px-4 py-2.5 text-body-medium font-semibold text-ink transition-colors hover:bg-surface-dim disabled:opacity-50"
            data-testid="assistant-mock-pay-button"
          >
            {mockPaying ? m.kaspiPay.mockPaying : m.kaspiPay.mockPay}
          </button>
        )}

        {mockError && (
          <span className="text-body-medium text-error" role="alert">
            {m.kaspiPay.mockPayError}
          </span>
        )}

        {/* Пока счёт не оплачен — можно уйти на другой способ (оплаченный Kaspi
            сменить нельзя: бэкенд откажет). */}
        {!paid && onReply && <ChangeMethodButton onReply={onReply} />}

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
    </div>
  )
}

export default KaspiPaymentAttachment
