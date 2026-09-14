"use client"

import { useMessages } from "@lib/i18n/i18n-context"
import { convertToLocale } from "@lib/util/money"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { HttpTypes } from "@medusajs/types"

// Текущая корзина в кабинете: позиции, количества, итог и один выход обратно в
// чат. Редактирования здесь НЕТ намеренно — корзину ведёт ассистент (пивот №3),
// и вторая точка правки развела бы состояние диалога и корзину.
const CartLines = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const m = useMessages()

  return (
    <div className="flex flex-col gap-4" data-testid="cabinet-cart">
      <ul className="flex flex-col gap-2">
        {cart.items?.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-card border border-line bg-surface p-3"
            data-testid="cabinet-cart-line"
          >
            <div className="w-16 shrink-0">
              <Thumbnail thumbnail={item.thumbnail} images={[]} size="square" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-body-large text-ink">
                {item.product_title ?? item.title}
              </span>
              {/* Вариант (фасовка) обязателен: без него «Цемент ПЦ 400-Д20»
                  в мешке 50 кг и в мешке 25 кг — две одинаковые строки
                  (находка гейта U T10.6b). */}
              <span className="text-body-medium text-ink-secondary">
                {[
                  item.variant_title,
                  `${m.cabinet.cart.quantity}: ${item.quantity}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </div>
            <span className="shrink-0 tabular-nums text-body-large text-ink">
              {convertToLocale({
                amount: item.total ?? 0,
                currency_code: cart.currency_code,
              })}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-line pt-3">
        <span className="text-title-medium text-ink">
          {m.cabinet.cart.total}
        </span>
        <span
          className="text-price tabular-nums text-ink"
          data-testid="cabinet-cart-total"
        >
          {convertToLocale({
            amount: cart.total ?? 0,
            currency_code: cart.currency_code,
          })}
        </span>
      </div>

      <LocalizedClientLink
        href="/chat"
        className="flex min-h-[48px] w-fit items-center rounded-chip bg-accent px-5 text-button text-surface transition-colors hover:bg-accent-pressed"
        data-testid="cabinet-cart-continue"
      >
        {m.cabinet.cart.continue}
      </LocalizedClientLink>
    </div>
  )
}

export default CartLines
