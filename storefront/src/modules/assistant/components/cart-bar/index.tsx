"use client"

import { AssistantCartSummary } from "@lib/data/assistant"
import { useMessages } from "@lib/i18n/i18n-context"
import { convertToLocale } from "@lib/util/money"
import QuantityStepper from "@modules/assistant/components/quantity-stepper"
import { useState } from "react"

// Полоса корзины над композером (T10.15). С T10.19 — ЕДИНСТВЕННОЕ место, где
// покупатель сам правит количество: карточек со счётчиками в ленте больше нет
// (на демо их не поняли, а длинный подбор закрывал ответ). Свёрнутая — одна
// строка «Корзина · N · итог · Изменить»; раскрытая — позиции со счётчиками.
// Кнопка подписана словом, а не стрелкой: стрелка не читалась как «здесь можно
// поменять количество».
const CartBar = ({
  cart,
  quantities,
  isBusy,
  hasError,
  onQuantityChange,
  onCheckout,
  checkoutDisabled,
}: {
  cart: AssistantCartSummary | null
  quantities: Record<string, number>
  isBusy: boolean
  hasError: boolean
  onQuantityChange: (variantId: string, title: string, next: number) => void
  // «Оформить» — реплика покупателя в чат: ассистент переходит к доставке и
  // оплате. Недоступна, пока идёт ход или меняется количество.
  onCheckout?: () => void
  checkoutDisabled?: boolean
}) => {
  const m = useMessages()
  const [isOpen, setIsOpen] = useState(false)

  // Пустую корзину не показываем: полоса появляется ровно тогда, когда есть
  // что показывать, и исчезает после оформления заказа.
  if (!cart || cart.items.length === 0) {
    return null
  }

  const total = convertToLocale({
    amount: cart.total,
    currency_code: cart.currency,
  })

  return (
    <div
      className="mb-2 overflow-hidden rounded-card border border-line bg-surface"
      data-testid="assistant-cart-bar"
    >
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-label={
            isOpen ? m.assistant.cart.collapse : m.assistant.cart.expand
          }
          className="flex min-h-[48px] min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-surface-dim focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          data-testid="assistant-cart-toggle"
        >
          <span className="text-body-medium font-semibold text-ink">
            {m.assistant.cart.title}
          </span>
          <span
            className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-chip bg-accent px-1 text-caption tabular-nums text-surface"
            data-testid="assistant-cart-count"
          >
            {cart.items.length}
          </span>
          <span className="ml-auto text-body-medium tabular-nums text-ink">
            {total}
          </span>
          <span className="shrink-0 text-body-medium font-semibold text-accent">
            {isOpen ? m.assistant.cart.done : m.assistant.cart.edit}
          </span>
        </button>
        {/* Главное действие корзины — дальше к доставке и оплате. Отдельная
          кнопка, а не часть строки: строка раскрывает состав. */}
        {onCheckout && (
          <button
            type="button"
            onClick={() => {
              setIsOpen(false)
              onCheckout()
            }}
            disabled={checkoutDisabled || isBusy}
            className="m-1.5 inline-flex min-h-[40px] shrink-0 items-center justify-center rounded-chip bg-accent px-4 text-body-medium font-semibold text-on-accent transition-colors hover:bg-accent-pressed disabled:opacity-50"
            data-testid="assistant-cart-checkout"
          >
            {m.assistant.cart.checkout}
          </button>
        )}
      </div>

      {hasError && (
        <p
          className="px-3 pb-2 text-body-medium text-error"
          data-testid="assistant-cart-error"
        >
          {m.assistant.cart.error}
        </p>
      )}

      {isOpen && (
        // На длинной корзине список прокручивается внутри полосы: иначе
        // раскрытая полоса вытолкнула бы ленту за верх экрана.
        <ul className="flex max-h-[45vh] flex-col gap-1 overflow-y-auto border-t border-line px-3 py-2">
          {cart.items.map((line) => (
            <li
              key={line.variant_id}
              className="flex items-center gap-3 py-1"
              data-testid="assistant-cart-line"
            >
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-body-medium text-ink">{line.title}</span>
                <span className="text-caption tabular-nums text-ink-secondary">
                  {convertToLocale({
                    amount: line.total,
                    currency_code: cart.currency,
                  })}
                </span>
              </div>
              <QuantityStepper
                value={quantities[line.variant_id] ?? line.quantity}
                title={line.title}
                disabled={isBusy}
                onChange={(next) =>
                  onQuantityChange(line.variant_id, line.title, next)
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default CartBar
