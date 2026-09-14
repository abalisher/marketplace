"use client"

import { useMessages } from "@lib/i18n/i18n-context"

// Чипы-примеры пустого экрана (1a): текст чипа уходит в диалог как обычная
// реплика покупателя — никакой особой логики, просто быстрый старт.
//
// Стоят НАД композером и компактно (решение владельца 2026-09-14): на эталоне
// под полем пусто, и три чипа высотой 48px с текстом 15px перетягивали на себя
// весь низ экрана. Высота 36px и текст 14px оставляют их подсказкой, а не
// главным объектом; тап-таргет добирается вертикальными полями строки.
const SuggestionChips = ({
  disabled,
  onPick,
}: {
  disabled: boolean
  onPick: (text: string) => void
}) => {
  const m = useMessages()

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-2">
      {m.assistant.examples.map((example) => (
        // Кнопка выше своей пилюли: видимый чип 36px, а нажимаемая область —
        // 48px за счёт прозрачных полей (правило тап-таргетов гейта U никуда
        // не делось, компактным стал только вид).
        <button
          key={example}
          type="button"
          onClick={() => onPick(example)}
          disabled={disabled}
          className="flex min-h-[48px] items-center py-1.5 disabled:opacity-50"
          data-testid="chat-suggestion"
        >
          <span className="flex min-h-[36px] items-center rounded-chip border border-line bg-surface px-3 text-assistant-chip text-ink-secondary transition-colors hover:border-accent hover:text-accent">
            {example}
          </span>
        </button>
      ))}
    </div>
  )
}

export default SuggestionChips
