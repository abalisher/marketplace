"use client"

import { useMessages } from "@lib/i18n/i18n-context"
import { clx } from "@medusajs/ui"
import { useEffect, useRef, useState } from "react"

// Счётчик количества «− N +» (T10.15). С T10.19 живёт только в строке полосы
// корзины: карточек подбора в ленте больше нет.
//
// Три решения формы:
//  * ноль — это не «0» на счётчике, а кнопка «В корзину»: минус при нуле
//    бессмысленен, а пустой счётчик читается как «товар уже добавлен нулём»;
//  * само число — кнопка: 30 мешков 30 нажатиями не набирают, тап открывает
//    ввод с клавиатуры;
//  * минус на единице убирает позицию совсем (возврат к «В корзину»), а не
//    оставляет ноль — иначе в корзине копились бы пустые строки.
const QuantityStepper = ({
  value,
  unit,
  title,
  disabled,
  onChange,
}: {
  value: number
  // Единица измерения товара («мешок», «м³») — подпись под числом при вводе.
  unit?: string | null
  // Название товара — только для screen-reader'ов: «Добавить: Пескобетон М300».
  title: string
  disabled?: boolean
  onChange: (next: number) => void
}) => {
  const m = useMessages()
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.select()
    }
  }, [isEditing])

  const label = (template: string) => template.replace("{title}", title)

  const commitDraft = () => {
    setIsEditing(false)
    const parsed = Number.parseInt(draft.replace(/[^\d]/g, ""), 10)
    if (!Number.isFinite(parsed) || parsed === value) {
      return
    }
    onChange(Math.max(0, parsed))
  }

  const buttonClass =
    "flex h-10 w-10 items-center justify-center rounded-chip text-ink transition-colors hover:bg-surface-dim focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:opacity-40"

  if (value <= 0) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(1)}
        aria-label={label(m.assistant.product.increase)}
        className="flex h-10 shrink-0 items-center gap-1 rounded-chip border border-line bg-surface px-3 text-body-medium font-semibold text-ink transition-colors hover:bg-surface-dim focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:opacity-40"
        data-testid="assistant-product-add"
      >
        <span aria-hidden className="text-title-medium leading-none">
          +
        </span>
        {m.assistant.product.add}
      </button>
    )
  }

  return (
    <div
      className="flex h-10 shrink-0 items-center rounded-chip border border-line bg-surface"
      data-testid="assistant-quantity-stepper"
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(value - 1)}
        aria-label={label(m.assistant.product.decrease)}
        className={buttonClass}
        data-testid="assistant-quantity-minus"
      >
        <span aria-hidden className="text-title-medium leading-none">
          −
        </span>
      </button>

      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commitDraft}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              commitDraft()
            }
            if (event.key === "Escape") {
              setIsEditing(false)
            }
          }}
          aria-label={label(m.assistant.product.quantity)}
          className="w-12 bg-transparent text-center text-body-large tabular-nums text-ink focus:outline-none"
          data-testid="assistant-quantity-input"
        />
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setDraft(String(value))
            setIsEditing(true)
          }}
          aria-label={label(m.assistant.product.quantity)}
          title={unit ?? undefined}
          className={clx(
            "min-w-[3rem] px-1 text-center text-body-large tabular-nums text-ink",
            "rounded-chip transition-colors hover:bg-surface-dim focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:opacity-40"
          )}
          data-testid="assistant-quantity-value"
        >
          {value}
        </button>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(value + 1)}
        aria-label={label(m.assistant.product.increase)}
        className={buttonClass}
        data-testid="assistant-quantity-plus"
      >
        <span aria-hidden className="text-title-medium leading-none">
          +
        </span>
      </button>
    </div>
  )
}

export default QuantityStepper
