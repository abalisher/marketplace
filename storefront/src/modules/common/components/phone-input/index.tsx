"use client"

import { useMessages } from "@lib/i18n/i18n-context"
import { clx } from "@medusajs/ui"
import { useEffect, useId, useRef, useState } from "react"

// Номер Казахстана: «+7» и десять цифр.
const NATIONAL_LENGTH = 10
const MASK = "+7 ___ ___ __ __"

// Десять национальных цифр из того, что ввели или вставили: «87077126426»,
// «+7 (707) 712-64-26», «7077126426» — всё одно и то же.
export const nationalDigits = (raw: string): string => {
  let digits = raw.replace(/\D/g, "")
  if (digits.length > NATIONAL_LENGTH && /^[78]/.test(digits)) {
    digits = digits.slice(1)
  }
  return digits.slice(0, NATIONAL_LENGTH)
}

// Значение, которое отдали полю (канон «+7707712…» — в том числе недобранный,
// или номер в любом виде): «+7» в начале — префикс, а не первая цифра.
const fromValue = (value: string | null | undefined): string => {
  const raw = (value ?? "").trim()
  return raw.startsWith("+7") ? nationalDigits(raw.slice(2)) : nationalDigits(raw)
}

// «7077126426» → «+7 707 712 64 26» (недобранное — как есть, без хвостов).
const formatNational = (national: string): string => {
  const parts = [
    national.slice(0, 3),
    national.slice(3, 6),
    national.slice(6, 8),
    national.slice(8, 10),
  ].filter(Boolean)
  return ["+7", ...parts].join(" ")
}

// Канон бэкенда: «+77077126426»; ничего не ввели — пусто.
const canonical = (national: string): string =>
  national ? `+7${national}` : ""

// Поле телефона: «+7» уже стоит и не стирается, номер сам раскладывается по
// группам, серым — сколько осталось ввести («+7 707 ___ __ __»). В форму
// уходит канон «+77077126426» скрытым полем с `name`; onChange получает его же.
// Неполный номер — подсказка браузера и форма не отправится (если required).
const PhoneInput = ({
  label,
  name,
  value,
  defaultValue,
  onChange,
  required,
  disabled,
  autoFocus,
  "data-testid": dataTestId,
}: {
  label: string
  name?: string
  value?: string
  defaultValue?: string | null
  onChange?: (canonicalPhone: string) => void
  required?: boolean
  disabled?: boolean
  autoFocus?: boolean
  "data-testid"?: string
}) => {
  const m = useMessages()
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const controlled = value !== undefined
  const [own, setOwn] = useState(() => fromValue(defaultValue))
  const national = controlled ? fromValue(value) : own
  const shown = formatNational(national)
  const complete = national.length === NATIONAL_LENGTH

  useEffect(() => {
    input.current?.setCustomValidity(
      (required && !complete) || (national && !complete)
        ? m.common.phoneIncomplete
        : ""
    )
  }, [required, complete, national, m.common.phoneIncomplete])

  const update = (raw: string) => {
    // «+7» — префикс поля, а не цифры номера: убираем его, где бы ни стоял
    // курсор (цифра, набранная перед «+7», — тоже первая цифра номера).
    // Стёрли всё вместе с «+7» — остаётся «+7».
    const next = nationalDigits(raw.replace("+7", ""))
    if (!controlled) {
      setOwn(next)
    }
    onChange?.(canonical(next))
  }

  // Курсор — всегда за «+7 »: набирать перед префиксом нечего.
  const caretAfterPrefix = (target: HTMLInputElement) => {
    if (
      (target.selectionStart ?? 0) < 3 &&
      target.selectionStart === target.selectionEnd
    ) {
      const end = target.value.length
      target.setSelectionRange(end, end)
    }
  }

  return (
    <div className="flex w-full flex-col">
      <div className="relative w-full rounded-md bg-ui-bg-field">
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-4 top-1 z-10 text-[11px] leading-4 text-ui-fg-subtle"
        >
          {label}
          {required && <span className="text-error">*</span>}
        </label>
        {/* Серая подсказка: недобранный хвост шаблона за введённым текстом. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre rounded-md border border-transparent px-4 pb-1 pt-4 text-[15px] leading-[22px] tabular-nums"
        >
          <span className="invisible">{shown}</span>
          <span className="text-ink-secondary/60">
            {MASK.slice(shown.length)}
          </span>
        </div>
        <input
          ref={input}
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={shown}
          onChange={(event) => update(event.target.value)}
          onFocus={(event) => {
            const target = event.target
            requestAnimationFrame(() => caretAfterPrefix(target))
          }}
          onClick={(event) => caretAfterPrefix(event.currentTarget)}
          onKeyUp={(event) => caretAfterPrefix(event.currentTarget)}
          disabled={disabled}
          autoFocus={autoFocus}
          className={clx(
            "block h-11 w-full appearance-none rounded-md border border-ui-border-base bg-transparent px-4 pb-1 pt-4 text-[15px] leading-[22px] tabular-nums",
            "hover:bg-ui-bg-field-hover/50 focus:outline-none focus:ring-0 focus:shadow-borders-interactive-with-active",
            disabled && "opacity-60"
          )}
          data-testid={dataTestId}
        />
      </div>
      {name && <input type="hidden" name={name} value={canonical(national)} />}
    </div>
  )
}

export default PhoneInput
