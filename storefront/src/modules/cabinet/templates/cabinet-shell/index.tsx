"use client"

import { ChatConversation } from "@lib/chat-history/conversation"
import {
  loadRailCollapsed,
  saveRailCollapsed,
} from "@lib/chat-history/rail-state"
import { useChatHistory } from "@lib/chat-history/use-chat-history"
import { useMessages } from "@lib/i18n/i18n-context"
import { Theme } from "@lib/theme/config"
import ChatRail from "@modules/assistant/components/chat-rail"
import CabinetNav from "@modules/cabinet/components/cabinet-nav"
import { BarsThree } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

// Рельс кабинета — тот же, что в чате: колонка 280px (свёрнутая 72px), на
// мобильном drawer поверх содержимого.
const railClass = (isCollapsed: boolean, isDrawerOpen: boolean) =>
  clx(
    "z-40 shrink-0 bg-surface-dim p-3 small:static small:block small:border-r small:border-line small:shadow-none",
    isDrawerOpen
      ? "absolute inset-y-0 left-0 w-[312px] shadow-lg"
      : "hidden small:block",
    isCollapsed ? "small:w-[72px]" : "small:w-[280px]"
  )

// Оболочка кабинета клиента (T10.6): та же раскладка, что у чата — рельс
// истории слева, один столбец содержимого по центру. Кабинет живёт РЯДОМ с
// диалогами, а не в отдельном «Аккаунте» стартера: покупатель ходит между
// «спросить ассистента» и «посмотреть свой заказ» постоянно, и смена оболочки
// на этом переходе читалась как выход из приложения.
//
// История здесь только показывается: выбор диалога уводит в чат ссылкой
// `?conversation=<id>` — ленту держит чат, а не кабинет.
const CabinetShell = ({
  theme,
  isAuthenticated,
  children,
}: {
  theme: Theme
  // Вошёл ли покупатель: рельс показывает кнопку выхода только вошедшему.
  isAuthenticated: boolean
  children: React.ReactNode
}) => {
  const m = useMessages()
  const router = useRouter()
  const { countryCode } = useParams() as { countryCode: string }
  const chatHistory = useChatHistory()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isRailCollapsed, setIsRailCollapsed] = useState(false)

  useEffect(() => {
    setIsRailCollapsed(loadRailCollapsed())
  }, [])

  const toggleRail = () => {
    setIsRailCollapsed((collapsed) => {
      saveRailCollapsed(!collapsed)
      return !collapsed
    })
  }

  const openChat = (conversation?: ChatConversation) => {
    router.push(
      conversation
        ? `/${countryCode}/chat?conversation=${conversation.id}`
        : `/${countryCode}/chat`
    )
  }

  return (
    <div className="relative flex min-h-0 flex-1">
      <div className={railClass(isRailCollapsed, isDrawerOpen)}>
        <ChatRail
          conversations={chatHistory.conversations}
          theme={theme}
          // Свёрнутость — настройка ДЕСКТОПА. В drawer'е мобильного рельс
          // всегда развёрнут: иначе покупатель, свернувший панель на большом
          // экране, получал на телефоне столбик иконок без истории, темы и
          // языка (находка гейта U T10.6b).
          isCollapsed={isRailCollapsed && !isDrawerOpen}
          onToggleCollapse={toggleRail}
          onPick={openChat}
          onRename={chatHistory.rename}
          onRemove={chatHistory.remove}
          onNew={() => openChat()}
          isAuthenticated={isAuthenticated}
        />
      </div>

      {isDrawerOpen && (
        <button
          type="button"
          aria-label={m.assistant.rail.open}
          onClick={() => setIsDrawerOpen(false)}
          className="absolute inset-0 z-30 bg-scrim/50 small:hidden"
          data-testid="cabinet-rail-scrim"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        {/* Шапка — только мобильная: на десктопе рельс всегда на экране. */}
        <div className="flex items-center gap-2 px-2 py-2 small:hidden">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-label={m.assistant.rail.open}
            className="flex h-12 w-12 items-center justify-center rounded-chip text-ink transition-colors hover:bg-surface-dim"
            data-testid="cabinet-history-toggle"
          >
            <BarsThree />
          </button>
          <span className="text-title-medium text-ink">{m.cabinet.title}</span>
        </div>

        <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6 px-4 py-4 small:py-6">
          <CabinetNav />
          {children}
        </div>
      </div>
    </div>
  )
}

export default CabinetShell
