"use client"

import { RadioGroup } from "@headlessui/react"
import {
  paymentInfoMap,
  paymentMethodByProvider,
  paymentMethodUnavailableReason,
  paymentProviderByMethod,
} from "@lib/constants"
import {
  CartPaymentView,
  PaymentMethodCode,
  PaymentMethodUnavailableReason,
  getCartPaymentMethods,
  selectCartPaymentMethod,
} from "@lib/data/payment"
import { getBonusCreditAmount } from "@lib/util/bonus"
import { useMessages } from "@lib/i18n/i18n-context"
import { convertToLocale } from "@lib/util/money"
import { CheckCircleSolid, CreditCard } from "@medusajs/icons"
import { Button, Container, Heading, Text, clx } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import PaymentMethodOption from "@modules/checkout/components/payment-method-option"
import Divider from "@modules/common/components/divider"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

const UNAVAILABLE_REASONS: PaymentMethodUnavailableReason[] = [
  "disabled",
  "kaspi_not_connected",
  "transfer_no_phone",
  "debt_over_limit",
]

// Шаг «Оплата»: способы оплаты ПРОДАВЦА корзины (GET
// /store/carts/:id/payment-method) — Kaspi QR, перевод на номер Kaspi, «в
// долг». Какие из них доступны, решает продавец; выключенные им совсем
// (`disabled`) не показываем, остальные недоступные — неактивными с причиной.
// Выбор уходит в POST /store/carts/:id/payment-method (ядровый
// initiatePaymentSession бэкенд закрыл).
const Payment = ({
  cart,
  paymentView,
}: {
  cart: any
  // null — способы не загрузились (сбой бэкенда): шаг покажет ошибку.
  paymentView: CartPaymentView | null
}) => {
  const m = useMessages()
  const sessions = cart.payment_collection?.payment_sessions ?? []
  const activeSession =
    sessions.find((session: any) => session.status === "pending") ?? sessions[0]

  // Вид способов держим в состоянии: после неудачного выбора перечитываем его
  // (продавец мог поменять настройки), а новый проп после ревалидации корзины
  // снова его заменяет.
  const [view, setView] = useState<CartPaymentView | null>(paymentView)
  useEffect(() => {
    setView(paymentView)
  }, [paymentView])

  // Уже выбранный способ — по ответу бэкенда, запасной путь — по провайдеру
  // сессии корзины.
  const savedMethod: PaymentMethodCode | null =
    view?.selected?.method ??
    paymentMethodByProvider(activeSession?.provider_id)

  // Способы на экране: выключенные продавцом не показываем вовсе.
  const options = (view?.methods ?? []).filter(
    (option) => option.available || option.reason !== "disabled"
  )
  const availableOptions = options.filter((option) => option.available)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Единственный доступный способ выбираем сразу — лишний клик ничего не решает.
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodCode | "">(
    savedMethod ??
      (availableOptions.length === 1 ? availableOptions[0].method : "")
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "payment"

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  // Заказ целиком покрыт бонусами (кредитные линии ядра): платёжная сессия
  // не нужна — бэкенд пропускает проверку оплаты при total=0.
  const paidByBonus = getBonusCreditAmount(cart) > 0 && cart?.total === 0

  const paymentReady =
    (Boolean(savedMethod) && cart?.shipping_methods.length !== 0) ||
    paidByGiftcard ||
    paidByBonus

  const money = (amount: number) =>
    convertToLocale({
      amount,
      currency_code: view?.currency_code ?? cart?.currency_code ?? "kzt",
    })

  const unavailableText = (reason: string | null) =>
    reason && (UNAVAILABLE_REASONS as string[]).includes(reason)
      ? m.payment.unavailable[reason as PaymentMethodUnavailableReason]
      : null

  // Однострочное пояснение способа; у долга — срок, а лимит отдельной строкой.
  const describe = (method: PaymentMethodCode) => {
    if (method === "debt") {
      return m.payment.methods.debt.description.replace(
        "{days}",
        String(view?.debt?.term_days ?? "")
      )
    }
    return m.payment.methods[method].description
  }

  const debtLimit =
    view?.debt?.max_amount !== null && view?.debt?.max_amount !== undefined
      ? m.payment.methods.debt.limit.replace(
          "{amount}",
          money(view.debt.max_amount)
        )
      : null

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), {
      scroll: false,
    })
  }

  // Причина отказа в выбранном способе: сначала из текста ошибки бэкенда
  // (`payment_method_unavailable:<reason>:…`), а если текст не дошёл (в
  // продакшене Next прячет сообщения ошибок server action) — по свежему
  // списку способов.
  const explainSelectError = async (
    method: PaymentMethodCode,
    message?: string
  ) => {
    const fromMessage = unavailableText(paymentMethodUnavailableReason(message))
    try {
      const fresh = await getCartPaymentMethods(cart.id)
      setView(fresh)
      const option = fresh.methods.find((o) => o.method === method)
      if (option && !option.available) {
        return fromMessage ?? unavailableText(option.reason) ?? message ?? null
      }
    } catch {
      // Перечитать не удалось — остаётся то, что знаем из ошибки.
    }
    return fromMessage ?? message ?? null
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Kaspi QR: бэкенд выставляет счёт (идемпотентно); перевод и долг —
      // только запоминают выбор. Повторно тот же способ не отправляем.
      if (
        !paidByGiftcard &&
        !paidByBonus &&
        selectedMethod &&
        selectedMethod !== savedMethod
      ) {
        try {
          await selectCartPaymentMethod(cart.id, selectedMethod)
        } catch (err: any) {
          setError(await explainSelectError(selectedMethod, err?.message))
          return
        }
      }

      return router.push(pathname + "?" + createQueryString("step", "review"), {
        scroll: false,
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  const methodIcon = (method: PaymentMethodCode) =>
    paymentInfoMap[paymentProviderByMethod[method]]?.icon

  return (
    <div className="bg-surface">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none":
                !isOpen && !paymentReady,
            }
          )}
        >
          {m.checkout.payment.title}
          {!isOpen && paymentReady && <CheckCircleSolid />}
        </Heading>
        {!isOpen && paymentReady && (
          <Text>
            <button
              onClick={handleEdit}
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              data-testid="edit-payment-button"
            >
              {m.common.edit}
            </button>
          </Text>
        )}
      </div>
      <div>
        <div className={isOpen ? "block" : "hidden"}>
          {!paidByGiftcard && !paidByBonus && options.length > 0 && (
            <RadioGroup
              value={selectedMethod}
              onChange={(value: PaymentMethodCode | "") => {
                setError(null)
                setSelectedMethod(value)
              }}
            >
              {options.map((option) => (
                <PaymentMethodOption
                  key={option.method}
                  value={option.method}
                  title={m.payment.methods[option.method].title}
                  description={describe(option.method)}
                  note={option.method === "debt" ? debtLimit : null}
                  icon={methodIcon(option.method)}
                  unavailableReason={
                    option.available
                      ? null
                      : unavailableText(option.reason) ??
                        m.payment.unavailable.disabled
                  }
                  selected={selectedMethod === option.method}
                />
              ))}
            </RadioGroup>
          )}

          {!paidByGiftcard && !paidByBonus && !view && (
            <Text
              className="txt-medium text-ui-fg-error"
              data-testid="payment-methods-error"
            >
              {m.payment.loadError}
            </Text>
          )}

          {!paidByGiftcard && !paidByBonus && view && options.length === 0 && (
            <Text
              className="txt-medium text-ui-fg-subtle"
              data-testid="payment-methods-empty"
            >
              {m.payment.noMethods}
            </Text>
          )}

          {paidByGiftcard && (
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                {m.checkout.payment.methodLabel}
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                {m.checkout.payment.giftCard}
              </Text>
            </div>
          )}

          {paidByBonus && (
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                {m.checkout.payment.methodLabel}
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                {m.cart.totals.bonuses}
              </Text>
            </div>
          )}

          <ErrorMessage
            error={error}
            data-testid="payment-method-error-message"
          />

          <Button
            size="large"
            className="mt-6"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!selectedMethod && !paidByGiftcard && !paidByBonus}
            data-testid="submit-payment-button"
          >
            {m.checkout.payment.continueToReview}
          </Button>
        </div>

        <div className={isOpen ? "hidden" : "block"}>
          {cart && paymentReady && savedMethod ? (
            <div className="flex items-start gap-x-1 w-full">
              <div className="flex flex-col w-1/3">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  {m.checkout.payment.methodLabel}
                </Text>
                <Text
                  className="txt-medium text-ui-fg-subtle"
                  data-testid="payment-method-summary"
                >
                  {m.payment.methods[savedMethod].title}
                </Text>
              </div>
              <div className="flex flex-col w-2/3">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  {m.checkout.payment.detailsLabel}
                </Text>
                <div
                  className="flex gap-2 txt-medium text-ui-fg-subtle items-center"
                  data-testid="payment-details-summary"
                >
                  <Container className="flex items-center h-7 w-fit p-2 bg-ui-button-neutral-hover">
                    {methodIcon(savedMethod) || <CreditCard />}
                  </Container>
                  <Text>{m.payment.summary[savedMethod]}</Text>
                </div>
              </div>
            </div>
          ) : paidByGiftcard ? (
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                {m.checkout.payment.methodLabel}
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                {m.checkout.payment.giftCard}
              </Text>
            </div>
          ) : paidByBonus ? (
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                {m.checkout.payment.methodLabel}
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                {m.cart.totals.bonuses}
              </Text>
            </div>
          ) : null}
        </div>
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default Payment
