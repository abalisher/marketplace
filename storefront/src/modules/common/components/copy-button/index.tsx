"use client"

import { useMessages } from "@lib/i18n/i18n-context"
import { useEffect, useState } from "react"

// Кнопка «Скопировать» рядом со значением, которое покупатель переносит в
// другое приложение (номер Kaspi, комментарий к переводу). Подтверждение
// «Скопировано» гаснет через 2 секунды.
const CopyButton = ({
  value,
  "data-testid": dataTestId,
}: {
  value: string
  "data-testid"?: string
}) => {
  const m = useMessages()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) {
      return
    }
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch {
      // Буфер закрыт политикой браузера (http, нет разрешения) — значение
      // остаётся на экране, подсказка «скопировано» была бы обманом.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-full bg-surface-dim px-3 text-body-medium font-semibold text-ink transition-colors hover:bg-line"
      data-testid={dataTestId}
    >
      {copied ? (
        <svg
          viewBox="0 0 20 20"
          className="h-4 w-4 text-success"
          aria-hidden="true"
        >
          <path
            d="M4.5 10.5l3.5 3.5 7.5-8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          viewBox="0 0 20 20"
          className="h-4 w-4 text-ink-secondary"
          aria-hidden="true"
        >
          <rect
            x="7"
            y="7"
            width="9"
            height="10"
            rx="2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M13 7V5a2 2 0 00-2-2H6a2 2 0 00-2 2v7a2 2 0 002 2h1"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      )}
      {copied ? m.payment.transfer.copied : m.payment.transfer.copy}
    </button>
  )
}

export default CopyButton
