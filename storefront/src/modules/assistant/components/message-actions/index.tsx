"use client"

import { useMessages } from "@lib/i18n/i18n-context"
import { ArrowPath, CheckMini, SquareTwoStack } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { useState } from "react"

// Действия под ответом ассистента (эталон Gemini, бриф T10.1a раздел 3.4):
// «копировать» и «повторить ответ». Оценок ответа («палец вверх/вниз») и правки
// отправленной реплики у нас нет осознанно — см. бриф, разделы 1 и 3.4.
// На мобильном кнопки видны всегда (наведения нет), на десктопе проявляются при
// наведении или фокусе внутри хода — родитель ставит класс `group`.
const MessageActions = ({
  text,
  onRegenerate,
}: {
  text: string
  // Только у последнего ответа: повтор перезапускает последний ход.
  onRegenerate?: () => void
}) => {
  const m = useMessages()
  const [isCopied, setIsCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      window.setTimeout(() => setIsCopied(false), 2000)
    } catch {
      // Буфер недоступен (нет разрешения, http-контекст) — молча ничего не
      // делаем: подсказка «скопировано» была бы обманом.
    }
  }

  const buttonClass =
    "flex h-10 w-10 items-center justify-center rounded-chip text-ink-secondary transition-colors hover:bg-surface-dim hover:text-ink"

  return (
    <div
      className={clx(
        "flex items-center gap-1 transition-opacity",
        "small:opacity-0 small:group-hover:opacity-100 small:group-focus-within:opacity-100"
      )}
      data-testid="chat-message-actions"
    >
      <button
        type="button"
        onClick={copy}
        aria-label={isCopied ? m.assistant.turn.copied : m.assistant.turn.copy}
        title={isCopied ? m.assistant.turn.copied : m.assistant.turn.copy}
        className={buttonClass}
        data-testid="chat-copy-button"
      >
        {isCopied ? <CheckMini /> : <SquareTwoStack />}
      </button>
      {onRegenerate && (
        <button
          type="button"
          onClick={onRegenerate}
          aria-label={m.assistant.turn.regenerate}
          title={m.assistant.turn.regenerate}
          className={buttonClass}
          data-testid="chat-regenerate-button"
        >
          <ArrowPath />
        </button>
      )}
      {isCopied && (
        <span className="text-body-medium text-ink-secondary" role="status">
          {m.assistant.turn.copied}
        </span>
      )}
    </div>
  )
}

export default MessageActions
