"use client"

import { ChatConversation } from "@lib/chat-history/conversation"
import { FEATURE_COMPANIES } from "@lib/feature-flags"
import { useMessages } from "@lib/i18n/i18n-context"
import { Theme } from "@lib/theme/config"
import ChatDeleteDialog from "@modules/assistant/components/chat-delete-dialog"
import ChatHistoryRow from "@modules/assistant/components/chat-history-row"
import CabinetRailLinks from "@modules/cabinet/components/cabinet-rail-links"
import CabinetSignOutButton from "@modules/cabinet/components/cabinet-sign-out-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import LanguageSwitcher from "@modules/layout/components/language-switcher"
import ThemeSwitcher from "@modules/layout/components/theme-switcher"
import {
  MagnifyingGlassMini,
  PencilSquare,
  SidebarLeft,
  XMarkMini,
} from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { useState } from "react"

// Порог, с которого показываем поиск: на трёх диалогах поле — шум (бриф T10.1a).
const SEARCH_THRESHOLD = 5

const matches = (conversation: ChatConversation, query: string) => {
  const needle = query.trim().toLowerCase()
  if (!needle) {
    return true
  }
  if (conversation.title.toLowerCase().includes(needle)) {
    return true
  }
  return conversation.messages.some((message) =>
    message.content.toLowerCase().includes(needle)
  )
}

// Рельс истории диалогов (эталон Gemini, бриф T10.1a разделы 2 и 3.1): «новый
// чат», поиск, список диалогов с переименованием и удалением, внизу — вход в
// кабинет, тема и язык. История локальная (localStorage), бэкенд stateless.
// Свёрнутый рельс (72px) оставляет только иконки — подписи уходят в tooltip.
const ChatRail = ({
  conversations,
  activeId,
  theme,
  isCollapsed,
  onToggleCollapse,
  onPick,
  onRename,
  onRemove,
  onNew,
  isAuthenticated,
  brand = "СтройМаркет",
}: {
  conversations: ChatConversation[]
  activeId?: string
  theme: Theme
  isCollapsed: boolean
  onToggleCollapse: () => void
  onPick: (conversation: ChatConversation) => void
  onRename: (id: string, title: string) => void
  onRemove: (id: string) => void
  onNew: () => void
  // Вошёл ли покупатель: от этого зависит кнопка выхода внизу рельса.
  isAuthenticated?: boolean
  // Подпись витрины: название компании-продавца или площадки.
  brand?: string
}) => {
  const m = useMessages()
  const [query, setQuery] = useState("")
  const [pendingRemoval, setPendingRemoval] = useState<string | undefined>(
    undefined
  )

  const filtered = conversations.filter((conversation) =>
    matches(conversation, query)
  )
  const showSearch = conversations.length >= SEARCH_THRESHOLD
  // «Новый чат» подсвечен ТОЛЬКО когда мы и правда на чистом экране (эталон
  // подсвечивает его лишь пока не выбран ни один диалог из истории) — активный
  // диалог не найден в списке (черновой id ещё не сохранён туда).
  const isNewChatActive = !conversations.some(
    (conversation) => conversation.id === activeId
  )

  const iconButtonClass =
    "flex h-12 w-12 items-center justify-center rounded-chip text-ink-secondary transition-colors hover:bg-surface-dim hover:text-ink small:h-9 small:w-9"

  return (
    <aside
      className="flex h-full w-full flex-col gap-1 overflow-hidden small:gap-0"
      data-testid="chat-history-panel"
    >
      {/* Марка и свёртка — ОДНОЙ строкой (эталон: лого-текст и кнопка свёртки
          панели стоят рядом, а не разъезжаются по отдельным строкам). Правка
          по стенду 2026-09-14 (владелец сравнил живой рельс с Gemini второй
          раз: «вообще не похожи», «размер шрифта, огромные надписи») — марка
          снята с `text-title-medium`/`tracking-wide`/капса до обычного веса
          и регистра, как лёгкий лого-текст эталона. На свёрнутом рельсе марки
          нет — там только кнопка свёртки, отцентрованная. */}
      <div
        className={clx(
          "flex items-center",
          isCollapsed ? "justify-center" : "justify-between"
        )}
      >
        {!isCollapsed && (
          <LocalizedClientLink
            href="/chat"
            className="flex h-10 items-center px-3 text-title-medium font-normal text-ink transition-colors hover:text-accent small:mb-1"
            data-testid="chat-rail-brand"
          >
            {brand}
          </LocalizedClientLink>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={
            isCollapsed ? m.assistant.rail.expand : m.assistant.rail.collapse
          }
          title={
            isCollapsed ? m.assistant.rail.expand : m.assistant.rail.collapse
          }
          className={clx(iconButtonClass, "hidden small:flex")}
          data-testid="chat-rail-collapse"
        >
          <SidebarLeft />
        </button>
      </div>

      {/* «Новый чат» — своя строка, БЕЗ рамки-кнопки: эталон подсвечивает
          текущий пункт мягкой заливкой (те же токены, что у активного диалога
          истории), а не рисует отдельную карточку с border. Обводка и белый
          фон, которые были здесь раньше, и делали строку тяжелее всего
          остального рельса — ровно то, что владелец назвал «не похоже». */}
      {isCollapsed ? (
        <button
          type="button"
          onClick={onNew}
          aria-label={m.assistant.rail.newChat}
          title={m.assistant.rail.newChat}
          className={iconButtonClass}
          data-testid="chat-new-button"
        >
          <PencilSquare />
        </button>
      ) : (
        <button
          type="button"
          onClick={onNew}
          className={clx(
            "flex min-h-[48px] items-center gap-3 rounded-full px-3 text-body-large transition-colors small:min-h-[36px] small:text-rail",
            isNewChatActive
              ? "bg-accent-container font-semibold text-accent"
              : "text-ink hover:bg-surface-dim"
          )}
          data-testid="chat-new-button"
        >
          <PencilSquare />
          {m.assistant.rail.newChat}
        </button>
      )}

      {!isCollapsed && showSearch && (
        <div className="flex items-center gap-2 rounded-chip border border-line bg-surface px-3">
          <MagnifyingGlassMini className="shrink-0 text-ink-secondary" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={m.assistant.rail.searchPlaceholder}
            aria-label={m.assistant.rail.searchPlaceholder}
            className="min-h-[48px] flex-1 bg-transparent text-body-large text-ink outline-none placeholder:text-ink-secondary small:min-h-[36px] small:text-rail"
            data-testid="chat-history-search"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={m.assistant.rail.searchClear}
              className="shrink-0 text-ink-secondary transition-colors hover:text-ink"
              data-testid="chat-history-search-clear"
            >
              <XMarkMini />
            </button>
          )}
        </div>
      )}

      {/* Кабинет клиента: метафора «проектов» эталона (T10.6) — стоит СРАЗУ
          под «новым чатом» (на месте «Библиотеки»/«Блокнотов» Gemini), а не
          привязан к низу рельса. Правка по стенду 2026-09-14 (владелец:
          «сверху заказы и т.д., а снизу история»): раньше кабинет стоял
          вплотную к низу через mt-auto, и между пустой историей и им
          оставался голый провал в полэкрана — история (ниже) сама растягивает
          оставшееся место, кабинет ей в этом больше не мешает.
          В свёрнутом рельсе (72px) кабинет остаётся у низа иконками — там нет
          истории, которая иначе забрала бы всё пространство под пустоту. */}
      <div
        className={clx(
          "mt-1 flex flex-col gap-1 small:gap-0",
          isCollapsed && "mt-auto items-center gap-2 border-t border-line pt-3"
        )}
      >
        <CabinetRailLinks isCollapsed={isCollapsed} />
        {isAuthenticated && <CabinetSignOutButton isCollapsed={isCollapsed} />}
        {/* Раздел «Компания» аккаунта: на MVP юрлица заморожены (T10.9) —
            ссылку возвращает флаг. */}
        {FEATURE_COMPANIES && !isCollapsed && (
          <LocalizedClientLink
            href="/account/company"
            className="flex min-h-[48px] items-center px-3 text-body-large text-ink transition-colors hover:text-accent small:min-h-[36px] small:text-rail"
            data-testid="chat-company-link"
          >
            {m.assistant.legalEntity.company}
          </LocalizedClientLink>
        )}
      </div>

      {!isCollapsed && (
        <>
          {/* Заголовок группы — обычным регистром и весом, БЕЗ капса и
              разрядки (правка по стенду 2026-09-14): у эталона это плоская
              серая подпись, а не `overline` с буквами вразрядку — рядом с
              лёгкой маркой капс читался отдельным, более тяжёлым слоем.
              Заметка про локальное хранение переехала сюда tooltip'ом —
              отдельным абзацем в подвале она была ровно тем «лишним текстом»,
              которого нет в эталоне. */}
          <span
            className="px-3 pt-2 text-body-medium text-ink-secondary small:pb-1 small:pt-5"
            title={m.assistant.history.note}
          >
            {m.assistant.rail.recent}
          </span>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="px-3 text-body-medium text-ink-secondary">
                {m.assistant.history.empty}
              </p>
            ) : filtered.length === 0 ? (
              <p
                className="px-3 text-body-medium text-ink-secondary"
                data-testid="chat-history-search-empty"
              >
                {m.assistant.rail.searchEmpty}
              </p>
            ) : (
              <ul className="flex flex-col gap-1 small:gap-0">
                {filtered.map((conversation) => (
                  <ChatHistoryRow
                    key={conversation.id}
                    conversation={conversation}
                    isActive={conversation.id === activeId}
                    onPick={() => onPick(conversation)}
                    onRename={(title) => onRename(conversation.id, title)}
                    onRemove={() => setPendingRemoval(conversation.id)}
                  />
                ))}
              </ul>
            )}
          </div>

          {/* Низ рельса: тема и язык, рядом — компактной строкой профиля
              (эталон держит там одну плотную полосу, а не стопку подписей).
              История (flex-1 выше) сама дотягивается до этого блока — он
              всегда у самого низа. */}
          {/* Шесть текстовых кнопок (Авто/Светлая/Тёмная + Рус/Қаз/Eng) шире
              рельса на одной строке — `flex-wrap` даёт два ряда по три вместо
              обрезки за `overflow-hidden` подложки. */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line px-1 pt-3">
            <ThemeSwitcher theme={theme} />
            <LanguageSwitcher />
          </div>
        </>
      )}

      <ChatDeleteDialog
        isOpen={!!pendingRemoval}
        onCancel={() => setPendingRemoval(undefined)}
        onConfirm={() => {
          if (pendingRemoval) {
            onRemove(pendingRemoval)
          }
          setPendingRemoval(undefined)
        }}
      />
    </aside>
  )
}

export default ChatRail
