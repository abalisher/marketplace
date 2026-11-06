"use client"

import { isDebt, isKaspi, isStripeLike, isTransfer } from "@lib/constants"
import { FEATURE_KASPI_MOCK } from "@lib/feature-flags"
import { placeOrder } from "@lib/data/cart"
import {
  getKaspiPaymentStatus,
  initKaspiPayment,
  mockPayKaspi,
  KaspiPayment,
} from "@lib/data/payment"
import { getBonusCreditAmount } from "@lib/util/bonus"
import { convertToLocale } from "@lib/util/money"
import { useMessages } from "@lib/i18n/i18n-context"
import { HttpTypes } from "@medusajs/types"
import { Button, Text } from "@medusajs/ui"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import KaspiPayPanel from "@modules/common/components/kaspi-pay-panel"
import React, { useEffect, useRef, useState } from "react"
import ErrorMessage from "../error-message"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
}) => {
  const m = useMessages()
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]

  // Заказ целиком покрыт бонусами — платёжной сессии нет, оформляем сразу.
  const paidByBonus = getBonusCreditAmount(cart) > 0 && cart.total === 0

  switch (true) {
    case paidByBonus:
      return <BonusPaymentButton notReady={notReady} />
    case isStripeLike(paymentSession?.provider_id):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isKaspi(paymentSession?.provider_id):
      return <KaspiPaymentButton notReady={notReady} cart={cart} />
    case isTransfer(paymentSession?.provider_id):
      return (
        <OfflinePaymentButton
          method="kaspi_transfer"
          notReady={notReady}
          cart={cart}
        />
      )
    case isDebt(paymentSession?.provider_id):
      return (
        <OfflinePaymentButton method="debt" notReady={notReady} cart={cart} />
      )
    default:
      return <Button disabled>{m.checkout.payment.selectMethod}</Button>
  }
}

const StripePaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const stripe = useStripe()
  const elements = useElements()
  const card = elements?.getElement("card")

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const disabled = !stripe || !elements ? true : false

  const handlePayment = async () => {
    setSubmitting(true)

    if (!stripe || !elements || !card || !cart) {
      setSubmitting(false)
      return
    }

    await stripe
      .confirmCardPayment(session?.data.client_secret as string, {
        payment_method: {
          card: card,
          billing_details: {
            name:
              cart.billing_address?.first_name +
              " " +
              cart.billing_address?.last_name,
            address: {
              city: cart.billing_address?.city ?? undefined,
              country: cart.billing_address?.country_code ?? undefined,
              line1: cart.billing_address?.address_1 ?? undefined,
              line2: cart.billing_address?.address_2 ?? undefined,
              postal_code: cart.billing_address?.postal_code ?? undefined,
              state: cart.billing_address?.province ?? undefined,
            },
            email: cart.email,
            phone: cart.billing_address?.phone ?? undefined,
          },
        },
      })
      .then(({ error, paymentIntent }) => {
        if (error) {
          const pi = error.payment_intent

          if (
            (pi && pi.status === "requires_capture") ||
            (pi && pi.status === "succeeded")
          ) {
            onPaymentCompleted()
          }

          setErrorMessage(error.message || null)
          return
        }

        if (
          (paymentIntent && paymentIntent.status === "requires_capture") ||
          paymentIntent.status === "succeeded"
        ) {
          return onPaymentCompleted()
        }

        return
      })
  }

  return (
    <>
      <Button
        disabled={disabled || notReady}
        onClick={handlePayment}
        size="large"
        isLoading={submitting}
        data-testid={dataTestId}
      >
        Place order
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </>
  )
}

// Оплата Kaspi QR: инициализация (идемпотентна — сессия с инвойсом уже
// создана на шаге Payment), показ QR/ссылки, поллинг статуса; оплачено →
// заказ оформляется автоматически. Вся механика денег — на бэкенде.
const KaspiPaymentButton = ({
  cart,
  notReady,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
}) => {
  const m = useMessages()
  const [payment, setPayment] = useState<KaspiPayment | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [placingOrder, setPlacingOrder] = useState(false)
  const placedRef = useRef(false)

  const isPaid =
    payment?.status === "authorized" || payment?.status === "captured"
  const isFailed =
    payment?.status === "canceled" || payment?.status === "error"

  // Первичная загрузка — ЧЕРЕЗ СТАТУС (GET без ревалидации кэша): сессия уже
  // создана на шаге Payment. initKaspiPayment здесь только fallback (если
  // сессии нет) — он ревалидирует кэш корзины и ремаунтит компонент, вызов
  // на каждый маунт зациклил бы перерендер.
  useEffect(() => {
    if (notReady) {
      return
    }
    let cancelled = false
    getKaspiPaymentStatus(cart.id)
      .then((p) => {
        if (!cancelled) {
          setPayment(p)
        }
      })
      .catch(() =>
        initKaspiPayment(cart.id)
          .then((p) => {
            if (!cancelled) {
              setPayment(p)
            }
          })
          .catch((err) => setErrorMessage(err.message))
      )
    return () => {
      cancelled = true
    }
  }, [cart.id, notReady])

  // Поллинг статуса, пока ждём оплату.
  useEffect(() => {
    if (!payment || isPaid || isFailed) {
      return
    }
    const poll = async () => {
      try {
        setPayment(await getKaspiPaymentStatus(cart.id))
      } catch {
        // сетевые сбои поллинга молча пробуем снова
      }
    }
    const timer = setInterval(poll, 3000)

    // Возврат во вкладку — самый вероятный момент «уже оплатил»: на телефоне
    // покупатель уходит по ссылке в приложение Kaspi и возвращается сюда же.
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        poll()
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange)

    return () => {
      clearInterval(timer)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [payment, isPaid, isFailed, cart.id])

  // Оформление после оплаты (ровно один раз); кнопка — ручной запасной
  // вариант на случай, если авто-оформление упало.
  const submitOrder = () => {
    if (placedRef.current) {
      return
    }
    placedRef.current = true
    setPlacingOrder(true)
    placeOrder().catch((err) => {
      setErrorMessage(err.message)
      setPlacingOrder(false)
      placedRef.current = false
    })
  }

  // Оплачено → оформляем заказ автоматически.
  useEffect(() => {
    if (isPaid) {
      submitOrder()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaid])

  // Тестовая оплата (стенд, NEXT_PUBLIC_KASPI_MOCK=true): кнопка появляется,
  // только когда корзина готова и сессия оплаты уже получена.
  const [mockPaying, setMockPaying] = useState(false)
  const showMockPay = FEATURE_KASPI_MOCK && !notReady && payment !== null

  const handleMockPay = async () => {
    setMockPaying(true)
    setErrorMessage(null)
    try {
      setPayment(await mockPayKaspi(cart.id))
    } catch (err: any) {
      setErrorMessage(err?.message || m.kaspiPay.mockPayError)
    } finally {
      setMockPaying(false)
    }
  }

  const hasPayPanel = Boolean(payment?.qr_payload || payment?.payment_url)

  return (
    <div className="flex flex-col items-start gap-y-4">
      {!isPaid && !isFailed && (hasPayPanel || showMockPay) && (
        <div
          className="flex flex-col gap-y-3"
          data-testid="kaspi-payment-panel"
        >
          {hasPayPanel && (
            <KaspiPayPanel
              qrPayload={payment?.qr_payload ?? null}
              paymentUrl={payment?.payment_url ?? null}
            />
          )}
          {showMockPay && (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={handleMockPay}
              isLoading={mockPaying}
              data-testid="kaspi-mock-pay-button"
            >
              {m.kaspiPay.mockPay}
            </Button>
          )}
        </div>
      )}

      {isFailed && (
        <Text className="txt-medium text-ui-fg-error">
          {m.checkout.payment.paymentFailed.replace(
            "{status}",
            payment?.status === "canceled"
              ? m.checkout.payment.canceled
              : m.checkout.payment.declined
          )}
        </Text>
      )}

      <Button
        disabled={notReady || !isPaid}
        isLoading={!payment || placingOrder}
        onClick={submitOrder}
        size="large"
        data-testid="submit-order-button"
      >
        {placingOrder
          ? m.checkout.payment.placingOrder
          : isPaid
          ? m.checkout.payment.paymentReceived
          : m.checkout.payment.waitingForPayment}
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="kaspi-payment-error-message"
      />
    </div>
  )
}

// Заказ целиком оплачен бонусами: платёжная сессия не нужна — сразу placeOrder
// (проверку «total=0 при кредитных линиях» делает бэкенд).
const BonusPaymentButton = ({ notReady }: { notReady: boolean }) => {
  const m = useMessages()
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handlePayment = () => {
    setSubmitting(true)
    placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  return (
    <>
      <Button
        disabled={notReady}
        isLoading={submitting}
        onClick={handlePayment}
        size="large"
        data-testid="submit-order-button"
      >
        {m.payment.review.placeOrder}
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="bonus-payment-error-message"
      />
    </>
  )
}

// Перевод на номер Kaspi и «в долг»: денег до оформления нет — заказ
// оформляется сразу (бэкенд принимает выбранную сессию этих провайдеров).
// Куда переводить и с каким комментарием, покажем уже на странице заказа;
// просьбу «в долг» продавец одобрит или отклонит при подтверждении заказа.
const OfflinePaymentButton = ({
  method,
  cart,
  notReady,
}: {
  method: "kaspi_transfer" | "debt"
  cart: HttpTypes.StoreCart
  notReady: boolean
}) => {
  const m = useMessages()
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handlePayment = () => {
    setSubmitting(true)
    setErrorMessage(null)
    placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  return (
    <div className="flex flex-col items-start gap-y-4">
      <div
        className="flex flex-col gap-2 rounded-card border border-line bg-surface p-4"
        data-testid="offline-payment-summary"
      >
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-body-large font-semibold text-ink">
            {m.payment.methods[method].title}
          </span>
          <span className="text-body-medium text-ink-secondary">
            {m.payment.review.toPay}:
          </span>
          <span className="text-body-large tabular-nums text-ink">
            {convertToLocale({
              amount: cart.total ?? 0,
              currency_code: cart.currency_code,
            })}
          </span>
        </div>
        <Text className="text-body-medium text-ink-secondary">
          {method === "debt"
            ? m.payment.review.debtHint
            : m.payment.review.transferHint}
        </Text>
      </div>

      <Button
        disabled={notReady}
        isLoading={submitting}
        onClick={handlePayment}
        size="large"
        data-testid="submit-order-button"
      >
        {method === "debt"
          ? m.payment.review.requestDebt
          : m.payment.review.placeOrder}
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="offline-payment-error-message"
      />
    </div>
  )
}

export default PaymentButton
