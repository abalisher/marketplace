"use client"

import { useMessages } from "@lib/i18n/i18n-context"

// «Печатает…»: три точки каскадом в пузыре ассистента (зеркало AppTypingBubble
// из ui_kit). Текст остаётся в aria-label — скринридеру точки бесполезны.
const TypingBubble = () => {
  const m = useMessages()

  return (
    <div
      className="flex w-fit items-center gap-1 rounded-bubble rounded-tl-base border border-line bg-surface px-4 py-3"
      role="status"
      aria-label={m.assistant.typing}
      data-testid="chat-typing"
    >
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="h-1.5 w-1.5 animate-typing-dot rounded-circle bg-ink-secondary"
          style={{ animationDelay: `${index * 0.16}s` }}
        />
      ))}
    </div>
  )
}

export default TypingBubble
