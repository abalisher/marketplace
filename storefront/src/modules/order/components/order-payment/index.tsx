"use client"

import {
  BuyerOrderPayment,
  changeOrderPaymentMethod,
  getOrderPayment,
  mockPayOrderKaspi,
  PaymentMethodCode,
} from "@lib/data/payment"
import { FEATURE_KASPI_MOCK } from "@lib/feature-flags"
import { formatShortDate } from "@lib/i18n/format-date"
import { useMessages } from "@lib/i18n/i18n-context"
import { convertToLocale } from "@lib/util/money"
import { clx } from "@medusajs/ui"
import PaymentStatusChip from "@modules/common/components/payment-status-chip"
import KaspiPayPanel from "@modules/common/components/kaspi-pay-panel"
import KaspiLogo from "@modules/landing/components/kaspi-logo"
import PaymentReceipts from "@modules/order/components/payment-receipts"
import TransferDetails from "@modules/common/components/transfer-details"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const POLL_INTERVAL_MS = 4000

// Оплата заказа на страницах заказа (подтверждение, кабинет): способ, сумма,
// статус и — пока деньги ещё должны продавцу — куда и с каким комментарием
// переводить. Данные — GET /store/orders/:id/payment; старые заказы
// (payment: null) этот блок не рисуют, у них остаётся прежний вид оплаты.
// Пока продавец заказ не подтвердил и денег не было, способ можно сменить
// (`change_options`); сменили на Kaspi QR — здесь же счёт с QR, и страница
// опрашивает оплату сама.
const OrderPayment = ({
  payment: initial,
  orderId,
}: {
  payment: BuyerOrderPayment
  orderId?: string
}) => {
  const m = useMessages()
  const router = useRouter()
  const [payment, setPayment] = useState(initial)
  const [choosing, setChoosing] = useState(false)
  const [changing, setChanging] = useState(false)
  const [changeError, setChangeError] = useState<string | null>(null)
  const [mockPaying, setMockPaying] = useState(false)

  useEffect(() => setPayment(initial), [initial])

  const awaitingKaspi =
    payment.method === "kaspi_qr" &&
    payment.status === "awaiting" &&
    !!payment.kaspi

  // Счёт Kaspi заказа: опрашиваем, пока не оплачен (бэкенд при чтении сам
  // сверяет счёт с Kaspi). Оплачен — обновляем страницу целиком: меняется и
  // стадия заказа у продавца, и документы.
  useEffect(() => {
    if (!orderId || !awaitingKaspi) {
      return
    }
    const timer = setInterval(async () => {
      const next = await getOrderPayment(orderId)
      if (next) {
        setPayment(next)
        if (next.status === "paid") {
          router.refresh()
        }
      }
    }, POLL_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [orderId, awaitingKaspi, router])

  const change = async (method: PaymentMethodCode) => {
    if (!orderId) {
      return
    }
    setChanging(true)
    setChangeError(null)
    const result = await changeOrderPaymentMethod(orderId, method)
    setChanging(false)
    if ("error" in result || !result.payment) {
      setChangeError(m.payment.order.changeFailed)
      return
    }
    setPayment(result.payment)
    setChoosing(false)
    router.refresh()
  }

  const mockPay = async () => {
    if (!orderId) {
      return
    }
    setMockPaying(true)
    try {
      const next = await mockPayOrderKaspi(orderId)
      if (next) {
        setPayment(next)
        router.refresh()
      }
    } finally {
      setMockPaying(false)
    }
  }
  const money = (amount: number) =>
    convertToLocale({ amount, currency_code: payment.currency_code })

  const methodTitle =
    payment.method === "bonus"
      ? m.payment.order.bonus
      : m.payment.methods[payment.method].title

  const dueDate = formatShortDate(payment.due_date)
  const owes = payment.outstanding > 0
  const showTransfer =
    Boolean(payment.transfer) &&
    owes &&
    (payment.status === "awaiting" || payment.status === "debt")
  const partlyPaid = payment.paid_amount > 0 && owes

  // Полоса с суммой — как в квитанции Kaspi: пока покупатель должен — «К оплате»
  // на тёплой подложке Kaspi, оплачено — зелёная «Оплата получена».
  const band =
    payment.status === "paid"
      ? {
          tone: "paid" as const,
          label: m.payment.order.paidBand,
          amount: payment.paid_amount || payment.amount,
        }
      : owes && ["awaiting", "debt", "debt_requested"].includes(payment.status)
      ? {
          tone: "due" as const,
          label: partlyPaid
            ? m.payment.order.outstanding
            : m.payment.order.toPay,
          amount: payment.outstanding,
        }
      : null

  return (
    <div
      className="flex flex-col overflow-hidden rounded-card border border-line bg-surface"
      data-testid="order-payment"
    >
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <KaspiLogo size={32} />
          <div className="flex min-w-0 flex-col">
            <h2 className="text-title-medium text-ink">
              {m.payment.order.title}
            </h2>
            <span
              className="truncate text-body-medium text-ink-secondary"
              data-testid="order-payment-method"
            >
              {methodTitle}
            </span>
          </div>
        </div>
        <PaymentStatusChip
          status={payment.status}
          method={payment.method}
          overdue={payment.overdue}
        />
      </div>

      {band && (
        <div
          className={clx(
            "flex flex-col gap-0.5 px-4 py-4",
            band.tone === "paid" ? "bg-success/10" : "bg-kaspi/10"
          )}
          data-testid="order-payment-band"
        >
          <span
            className={clx(
              "text-body-large font-semibold",
              band.tone === "paid" ? "text-success" : "text-ink"
            )}
          >
            {band.label}
          </span>
          <span
            className={clx(
              "text-[32px] font-bold leading-[38px] tabular-nums",
              band.tone === "paid" ? "text-success" : "text-ink"
            )}
          >
            {money(band.amount)}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-3 p-4 empty:hidden">
        {/* Строки сумм — когда добавляют что-то к полосе: частичная оплата или
          полосы нет вовсе (отмена, возврат). */}
        {(!band || partlyPaid) && (
          <dl className="flex flex-col divide-y divide-line text-body-large">
            <div className="flex items-baseline justify-between gap-2 py-2 first:pt-0">
              <dt className="text-ink-secondary">{m.payment.order.amount}</dt>
              <dd className="tabular-nums text-ink">{money(payment.amount)}</dd>
            </div>
            {partlyPaid && (
              <div className="flex items-baseline justify-between gap-2 py-2">
                <dt className="text-ink-secondary">{m.payment.order.paid}</dt>
                <dd className="tabular-nums text-ink">
                  {money(payment.paid_amount)}
                </dd>
              </div>
            )}
          </dl>
        )}

        {payment.status === "canceled" && (
          <p className="text-body-medium text-ink-secondary">
            {m.payment.order.canceled}
          </p>
        )}

        {payment.status === "refund_due" && (
          <p className="text-body-medium text-ink">
            {m.payment.order.refundDue.replace(
              "{amount}",
              money(payment.paid_amount)
            )}
          </p>
        )}

        {payment.status === "refunded" && (
          <p className="text-body-medium text-ink-secondary">
            {m.payment.order.refunded.replace(
              "{amount}",
              money(payment.paid_amount)
            )}
          </p>
        )}

        {payment.status === "debt_requested" && (
          <p className="text-body-medium text-ink">
            {m.payment.debt.requestSent}
          </p>
        )}

        {payment.status === "debt" && (
          <div className="flex flex-col gap-1">
            <p className="text-body-medium text-ink">
              {m.payment.debt.approved}
            </p>
            {dueDate && (
              <p
                className={clx(
                  "text-body-large font-semibold",
                  payment.overdue ? "text-error" : "text-ink"
                )}
                data-testid="order-payment-due"
              >
                {(payment.overdue
                  ? m.payment.debt.overdue
                  : m.payment.debt.dueBy
                ).replace("{date}", dueDate)}
              </p>
            )}
          </div>
        )}

        {showTransfer && payment.transfer && (
          <div className="flex flex-col gap-2">
            {payment.status === "debt" && (
              <p className="text-body-medium text-ink-secondary">
                {m.payment.transfer.repay}
              </p>
            )}
            <TransferDetails
              transfer={payment.transfer}
              displayId={payment.order_display_id}
              orderNumber={payment.order_number}
              steps={payment.status === "awaiting"}
            />
            {payment.status === "awaiting" && (
              <p className="text-body-medium text-ink-secondary">
                {m.payment.transfer.inWork}
              </p>
            )}
          </div>
        )}

        {orderId && (
          <PaymentReceipts
            orderId={orderId}
            payment={payment}
            onUpdated={(next) => {
              setPayment(next)
              router.refresh()
            }}
          />
        )}

        {awaitingKaspi && payment.kaspi && (
          <div
            className="flex flex-col gap-2"
            data-testid="order-payment-kaspi"
          >
            {payment.kaspi.static ? (
              // QR магазина не знает сумму заказа — её покупатель вводит сам,
              // а чек потом прикладывает ниже.
              <div className="flex flex-col gap-1">
                <p className="text-body-medium text-ink">
                  {m.payment.order.kaspiStaticHint}
                </p>
                <p className="text-price tabular-nums text-ink">
                  {m.payment.order.kaspiStaticAmount.replace(
                    "{amount}",
                    money(payment.outstanding)
                  )}
                </p>
              </div>
            ) : (
              <p className="text-body-medium text-ink-secondary">
                {m.payment.order.kaspiHint}
              </p>
            )}
            <KaspiPayPanel
              qrPayload={payment.kaspi.qr_payload}
              paymentUrl={payment.kaspi.payment_url}
            />
            {FEATURE_KASPI_MOCK && orderId && !payment.kaspi.static && (
              <button
                type="button"
                onClick={mockPay}
                disabled={mockPaying}
                className="w-full rounded-chip border border-line bg-surface px-4 py-2.5 text-body-medium font-semibold text-ink transition-colors hover:bg-surface-dim disabled:opacity-50"
                data-testid="order-payment-mock-pay"
              >
                {mockPaying ? m.kaspiPay.mockPaying : m.kaspiPay.mockPay}
              </button>
            )}
          </div>
        )}

        {orderId && payment.change_options.length > 0 && !choosing && (
          <button
            type="button"
            onClick={() => setChoosing(true)}
            className="flex min-h-[48px] w-fit items-center text-body-large font-semibold text-accent transition-colors hover:text-accent-pressed"
            data-testid="order-payment-change"
          >
            {m.payment.order.change}
          </button>
        )}

        {choosing && (
          <div
            className="flex flex-col gap-2"
            data-testid="order-payment-change-options"
          >
            <span className="text-body-large font-semibold text-ink">
              {m.payment.order.changeTitle}
            </span>
            {payment.change_options.map((option) => (
              <button
                key={option.method}
                type="button"
                disabled={!option.available || changing}
                onClick={() => change(option.method)}
                className="flex min-h-[48px] flex-col items-start gap-0.5 rounded-chip border border-line bg-surface px-4 py-2.5 text-left transition-colors hover:border-accent disabled:opacity-50"
                data-testid={`order-payment-option-${option.method}`}
              >
                <span className="text-body-large font-semibold text-ink">
                  {m.payment.methods[option.method].title}
                </span>
                <span className="text-body-medium text-ink-secondary">
                  {!option.available && option.reason
                    ? m.payment.unavailable[option.reason]
                    : m.payment.order.changeHint[option.method]}
                </span>
              </button>
            ))}
            {changeError && (
              <p className="text-body-medium text-error" role="alert">
                {changeError}
              </p>
            )}
            <button
              type="button"
              onClick={() => setChoosing(false)}
              disabled={changing}
              className="flex min-h-[48px] w-fit items-center text-body-large text-ink-secondary transition-colors hover:text-ink"
            >
              {m.payment.order.changeCancel}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderPayment
