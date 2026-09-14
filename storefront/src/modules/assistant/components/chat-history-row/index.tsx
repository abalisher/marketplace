"use client"

import { ChatConversation } from "@lib/chat-history/conversation"
import { useMessages } from "@lib/i18n/i18n-context"
import { EllipsisHorizontal, Pencil, Trash } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { useEffect, useRef, useState } from "react"

// Строка диалога в рельсе истории (эталон Gemini, бриф T10.1a раздел 3.1):
// название, меню «⋮» с переименованием и удалением, инлайн-правка названия.
// Меню на мобильном видно всегда (наведения нет), на десктопе — при наведении
// или фокусе. Высота строки 40px на десктопе и 48px на мобильном (тап-таргет).
const ChatHistoryRow = ({
  conversation,
  isActive,
  onPick,
  onRename,
  onRemove,
}: {
  conversation: ChatConversation
  isActive: boolean
  onPick: () => void
  onRename: (title: string) => void
  onRemove: () => void
}) => {
  const m = useMessages()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  // null — обычный режим; строка — идёт переименование.
  const [draft, setDraft] = useState<string | null>(null)
  const rowRef = useRef<HTMLLIElement>(null)

  // Меню закрывается кликом вне строки и по Esc — иначе оно висит поверх списка
  // и мешает выбрать другой диалог.
  useEffect(() => {
    if (!isMenuOpen) {
      return
    }
    const closeOnOutside = (event: MouseEvent) => {
      if (!rowRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", closeOnOutside)
    document.addEventListener("keydown", closeOnEscape)
    return () => {
      document.removeEventListener("mousedown", closeOnOutside)
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [isMenuOpen])

  // Пустое имя = отмена (бриф 3.1): подпись «без названия» покупателю бесполезна.
  const submitRename = () => {
    if (draft !== null && draft.trim()) {
      onRename(draft)
    }
    setDraft(null)
  }

  const startRename = () => {
    setIsMenuOpen(false)
    setDraft(conversation.title)
  }

  const menuItemClass =
    "flex min-h-[48px] items-center gap-2 rounded-chip px-3 text-left text-body-large transition-colors small:min-h-[40px]"

  return (
    <li ref={rowRef} className="group relative">
      {draft === null ? (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPick}
            className={clx(
              "min-h-[48px] flex-1 truncate rounded-full px-3 text-left text-body-large transition-colors small:min-h-[36px] small:text-rail",
              isActive
                ? "bg-accent-container text-accent"
                : "text-ink hover:bg-surface-dim"
            )}
            data-testid="chat-history-item"
          >
            {conversation.title}
          </button>
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={m.assistant.rail.menu}
            aria-expanded={isMenuOpen}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-chip text-ink-secondary transition-colors hover:bg-surface-dim hover:text-ink small:h-9 small:w-9 small:opacity-0 small:group-hover:opacity-100 small:group-focus-within:opacity-100"
            data-testid="chat-history-menu"
          >
            <EllipsisHorizontal />
          </button>
        </div>
      ) : (
        <input
          value={draft}
          autoFocus
          onChange={(event) => setDraft(event.target.value)}
          onBlur={submitRename}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              submitRename()
            }
            if (event.key === "Escape") {
              event.preventDefault()
              setDraft(null)
            }
          }}
          aria-label={m.assistant.rail.rename}
          title={m.assistant.rail.renameHint}
          className="min-h-[48px] w-full rounded-chip border border-accent bg-surface px-3 text-body-large text-ink outline-none small:min-h-[40px]"
          data-testid="chat-history-rename-input"
        />
      )}

      {isMenuOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 flex w-[220px] flex-col rounded-card border border-line bg-surface p-1 shadow-lg"
          data-testid="chat-history-menu-items"
        >
          <button
            type="button"
            role="menuitem"
            onClick={startRename}
            className={clx(menuItemClass, "text-ink hover:bg-surface-dim")}
            data-testid="chat-history-rename"
          >
            <Pencil />
            {m.assistant.rail.rename}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsMenuOpen(false)
              onRemove()
            }}
            className={clx(menuItemClass, "text-error hover:bg-error/10")}
            data-testid="chat-history-remove"
          >
            <Trash />
            {m.assistant.history.remove}
          </button>
        </div>
      )}
    </li>
  )
}

export default ChatHistoryRow
