"use client"

import { useMessages } from "@lib/i18n/i18n-context"
import MessageActions from "@modules/assistant/components/message-actions"
import MessageContent from "@modules/assistant/components/message-content"

// Ответ ассистента (эталон Gemini, бриф T10.1a раздел 3.4): без пузыря и рамки,
// во всю ширину столбца, метка-аватар слева сверху. Вставки хода (карточки
// товара, Kaspi, статус заказа) приходят в `children` и живут ВНУТРИ блока
// ответа — сразу под текстом, до ряда действий.
// [isStreaming] — ответ ещё печатается (T10.1d): ряд действий не показываем,
// копировать и повторять половину ответа нечего.
const AssistantAnswer = ({
  text,
  onRegenerate,
  isStreaming = false,
  children,
}: {
  text: string
  onRegenerate?: () => void
  isStreaming?: boolean
  children?: React.ReactNode
}) => {
  const m = useMessages()

  return (
    <div
      className="group flex w-full gap-3"
      data-testid="chat-bubble-assistant"
    >
      <span
        aria-hidden
        className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-base bg-ink text-overline text-surface"
      >
        {m.assistant.mark}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <MessageContent text={text} />
        {children}
        {!isStreaming && (
          <MessageActions text={text} onRegenerate={onRegenerate} />
        )}
      </div>
    </div>
  )
}

export default AssistantAnswer
