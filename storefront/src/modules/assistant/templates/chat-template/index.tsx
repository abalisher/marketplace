"use client"

import {
  ChatConversation,
  conversationTitle,
} from "@lib/chat-history/conversation"
import {
  loadRailCollapsed,
  saveRailCollapsed,
} from "@lib/chat-history/rail-state"
import { useChatHistory } from "@lib/chat-history/use-chat-history"
import { ChatAttachment } from "@lib/assistant/file-attachment"
import { AssistantAttachment, AssistantMessage } from "@lib/data/assistant"
import { postAssistantMessage } from "@lib/data/assistant-post"
import {
  AssistantStreamUnavailableError,
  streamAssistantMessage,
} from "@lib/data/assistant-stream"
import { useMessages } from "@lib/i18n/i18n-context"
import { Theme } from "@lib/theme/config"
import AssistantAnswer from "@modules/assistant/components/assistant-answer"
import AttachmentList from "@modules/assistant/components/attachment-list"
import CartBar from "@modules/assistant/components/cart-bar"
import CartEventLine from "@modules/assistant/components/cart-event-line"
import ChatBubble from "@modules/assistant/components/chat-bubble"
import ChatComposer from "@modules/assistant/components/chat-composer"
import ChatRail from "@modules/assistant/components/chat-rail"
import SuggestionChips from "@modules/assistant/components/suggestion-chips"
import TypingBubble from "@modules/assistant/components/typing-bubble"
import { useAssistantCart } from "@modules/assistant/hooks/use-assistant-cart"
import { BarsThree, PencilSquare } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

// Новый id диалога. crypto.randomUUID есть во всех целевых браузерах, но в
// http-контексте без secure origin его может не быть — тогда времянка на Date.
const newConversationId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `chat-${Date.now()}`

// Рельс: на десктопе — колонка 280px (свёрнутая 72px), на мобильном — drawer
// поверх ленты по кнопке «☰» в шапке чата.
const railClass = (isCollapsed: boolean, isDrawerOpen: boolean) =>
  clx(
    "z-40 shrink-0 bg-surface-dim p-3 small:static small:block small:border-r small:border-line small:shadow-none",
    // Drawer позиционируется внутри области чата (родитель `relative`), а не
    // по окну: `fixed` уводил его верх под шапку витрины и «Новый чат» пропадал.
    isDrawerOpen
      ? "absolute inset-y-0 left-0 w-[312px] shadow-lg"
      : "hidden small:block",
    isCollapsed ? "small:w-[72px]" : "small:w-[280px]"
  )

// Чат-оболочка ассистента покупателя по эталону Gemini (бриф
// `docs/qa/2026-08-27-T10.1-gemini-brief.md`, T10.1b): рельс истории слева,
// один столбец разговора по центру, композер внизу (на приветствии — по центру).
// Бизнес-логики здесь нет: держим ленту сообщений, токены сессии (cart_id +
// order_id), вставки последнего хода и локальную историю диалогов; шлём всю
// историю каждым ходом и берём токены из ответа как есть (их отсутствие после
// place_order штатно сбрасывает корзину). Всё остальное — подбор, расчёт,
// корзина, оплата, заказ, трекинг — считает бэкенд.
const ChatTemplate = ({
  theme,
  isAuthenticated,
}: {
  theme: Theme
  // Залогинен ли покупатель — решает только вид ссылки «Открыть заказ» во
  // вставке статуса (страница заказа живёт в «Аккаунте»). Права проверяет
  // бэкенд, здесь это подсказка UI (T3.9).
  isAuthenticated: boolean
}) => {
  const m = useMessages()
  const chatHistory = useChatHistory()
  const searchParams = useSearchParams()
  const [conversationId, setConversationId] = useState(newConversationId)
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [attachments, setAttachments] = useState<AssistantAttachment[]>([])
  const [cartId, setCartId] = useState<string | undefined>(undefined)
  const [orderId, setOrderId] = useState<string | undefined>(undefined)
  const [isSending, setIsSending] = useState(false)
  // Текст ответа, который печатается ПРЯМО СЕЙЧАС (стриминг, T10.1d). Пока он
  // пуст, в ленте стоит «печатает…»; с первой дельты его место занимает
  // растущий ответ.
  const [streamedText, setStreamedText] = useState("")
  const [hasError, setHasError] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isRailCollapsed, setIsRailCollapsed] = useState(false)
  // След от счётчиков в ленте (T10.15): по одной отметке на позицию, последнее
  // нажатие переписывает её. Отметки локальные и эфемерные — в историю диалога
  // и к модели они не идут (иначе снова получилась бы «реплика, которой я не
  // писал»), и гаснут, как только покупатель отправляет сообщение сам.
  const [cartEvents, setCartEvents] = useState<
    { variantId: string; title: string; quantity: number }[]
  >([])
  // Вложения ОТПРАВЛЕННЫХ реплик по их месту в ленте (T10.4b): бэкенд файлы не
  // возвращает (вложение живёт ровно один ход), а покупатель должен видеть в
  // ленте, какой снимок он приложил. Живут в памяти вкладки: в localStorage
  // истории их не пишем — три кадра по 8 МБ выбили бы квоту хранилища.
  const [sentFiles, setSentFiles] = useState<Record<number, ChatAttachment[]>>(
    {}
  )

  const feedRef = useRef<HTMLDivElement>(null)

  // Корзина чата: счётчики «−/+» в полосе корзины пишут в неё напрямую, без
  // хода модели (T10.15, с T10.19 — единственное место счётчиков). Если
  // счётчик вернул новый cart_id, кладём его рядом с историей диалога —
  // следующим ходом он уйдёт ассистенту, как и раньше.
  const cart = useAssistantCart({
    cartId,
    onCartId: (nextCartId) => {
      setCartId(nextCartId)
      persist(messages, { cart: nextCartId, order: orderId })
    },
  })

  // Идущий ход: «Стоп» обрывает соединение, бэкенд гасит ход у модели
  // (исполненные инструменты не откатываются — корзина и заказ уже созданы).
  const streamAbortRef = useRef<AbortController | null>(null)

  // Автопрокрутка вниз — только если покупатель УЖЕ был внизу (бриф раздел 7):
  // иначе он читает старое сообщение, а лента рывком уезжает к новому.
  const isAtBottomRef = useRef(true)

  // Корзина, за оплату которой диалог уже продолжен автоматически: реплика
  // «Я оплатил» уходит РОВНО ОДИН раз на корзину (замечание владельца на
  // приёмке 2026-08-11 — поллинг только читал статус, ход начинал человек).
  // На витрине проброс был потерян (прогон 2026-08-13: деньги списаны, заказ не
  // оформлен, экран замер) — держим отметку здесь же, рядом с отправкой хода.
  const autoContinuedCartRef = useRef<string | undefined>(undefined)

  // Свёрнутость рельса читаем после монтирования: localStorage на сервере нет.
  useEffect(() => {
    setIsRailCollapsed(loadRailCollapsed())
  }, [])

  // Возврат на `/chat` больше не сбрасывает диалог в приветствие: как только
  // локальная история прочитана, поднимаем последнюю запись вместе с токенами
  // (прогон 2026-08-13: покупатель уходил в «Заказы» и терял ленту, хотя она
  // лежала в localStorage). Делаем это ОДИН раз и только если в текущем диалоге
  // ещё ничего нет — начатый разговор не перетираем. Вставки не восстанавливаем,
  // они эфемерны и придут со следующим ходом.
  const restoredRef = useRef(false)
  useEffect(() => {
    if (restoredRef.current || !chatHistory.isLoaded) {
      return
    }
    restoredRef.current = true
    // Из кабинета диалог открывают по ссылке `?conversation=<id>` (рельс там
    // тот же, но страница другая, и поднять ленту в памяти некому). Нет метки
    // — поднимаем последний диалог, как и раньше.
    const requestedId = searchParams.get("conversation")
    const requested = requestedId
      ? chatHistory.conversations.find((item) => item.id === requestedId)
      : undefined
    const [latest] = chatHistory.conversations
    const target = requested ?? latest
    if (target?.messages.length && messages.length === 0) {
      resume(target)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatHistory.isLoaded, chatHistory.conversations])

  // Возврат со страницы входа (T10.8): покупатель нажал кнопку в ленте, вошёл
  // по номеру и вернулся сюда с меткой `logged_in`. Продолжаем диалог сами —
  // ассистент увидит профиль и спросит только недостающее; иначе покупатель
  // возвращается в чат и не понимает, что делать дальше. Реплика уходит РОВНО
  // один раз, метка из адреса убирается (перезагрузка страницы не должна слать
  // её повторно).
  const autoContinuedLoginRef = useRef(false)
  const justLoggedIn = searchParams.get("logged_in") === "1"
  useEffect(() => {
    if (
      autoContinuedLoginRef.current ||
      !justLoggedIn ||
      !isAuthenticated ||
      !chatHistory.isLoaded ||
      isSending ||
      messages.length === 0
    ) {
      return
    }
    autoContinuedLoginRef.current = true
    window.history.replaceState(null, "", window.location.pathname)
    send(m.assistant.auth.loggedInReply)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justLoggedIn, isAuthenticated, chatHistory.isLoaded, isSending, messages])

  // Прокрутка ленты вниз при новом сообщении / вставке / индикаторе печати.
  // Скроллим САМУ ленту, а не через scrollIntoView: та прокручивает ближайший
  // скроллящийся предок — окно, — и экран чата уезжает под шапку.
  useEffect(() => {
    const feed = feedRef.current
    if (feed && isAtBottomRef.current) {
      feed.scrollTop = feed.scrollHeight
    }
  }, [messages, attachments, cartEvents, isSending, streamedText])

  const handleFeedScroll = () => {
    const feed = feedRef.current
    if (!feed) {
      return
    }
    // Порог 48px: «почти внизу» — тоже внизу, иначе автопрокрутка отключается
    // от одного случайного пикселя.
    isAtBottomRef.current =
      feed.scrollHeight - feed.scrollTop - feed.clientHeight < 48
  }

  // Сохранение диалога на устройстве после хода: вместе с токенами, чтобы после
  // возобновления корзина и заказ остались теми же. Название, переименованное
  // покупателем, автозаголовком не перетираем (T10.1b).
  const persist = (
    history: AssistantMessage[],
    tokens: { cart?: string; order?: string }
  ) => {
    const saved = chatHistory.conversations.find(
      (conversation) => conversation.id === conversationId
    )
    chatHistory.upsert({
      id: conversationId,
      title: saved?.titleCustom ? saved.title : conversationTitle(history),
      titleCustom: saved?.titleCustom,
      messages: history,
      cartId: tokens.cart,
      orderId: tokens.order,
      updatedAt: Date.now(),
    })
  }

  // Один ход: шлём переданную историю целиком + текущие токены. Ответ
  // печатается стримингом (SSE), а итог хода — история, токены и вставки —
  // приходит событием `done` и авторитетно заменяет ленту. Если поток не
  // открылся (старый бэкенд, прокси недоступен), тот же ход уходит обычным POST
  // и ответ появляется целиком. Ошибка оставляет последнюю реплику покупателя в
  // ленте — «Повторить» отправит ту же историю заново.
  const runTurn = async (
    history: AssistantMessage[],
    files: ChatAttachment[] = []
  ) => {
    setIsSending(true)
    setHasError(false)
    setStreamedText("")
    isAtBottomRef.current = true
    const abort = new AbortController()
    streamAbortRef.current = abort
    // Токены хода держим локально: они меняются посреди хода (событие `state`),
    // а сохранять диалог нужно с актуальными.
    const tokens: { cart?: string; order?: string } = {
      cart: cartId,
      order: orderId,
    }
    const applyTokens = (cart?: string, order?: string) => {
      tokens.cart = cart
      tokens.order = order
      setCartId(cart)
      setOrderId(order)
    }
    try {
      const request = {
        messages: history,
        cart_id: cartId,
        order_id: orderId,
        // Вложения относятся к ПОСЛЕДНЕЙ реплике истории и уходят ровно один
        // раз: на следующем ходе бэкенд их уже не получит и не ждёт.
        files: files.length
          ? files.map((file) => ({
              mime_type: file.mimeType,
              data: file.data,
              name: file.name,
            }))
          : undefined,
      }
      let turn: {
        reply: string
        messages: AssistantMessage[] | null
        cart_id?: string
        order_id?: string
        attachments?: AssistantAttachment[]
      }
      try {
        turn = await streamAssistantMessage(request, {
          onDelta: (text) => setStreamedText((printed) => printed + text),
          onReset: () => setStreamedText(""),
          onState: (next) => applyTokens(next.cart_id, next.order_id),
          signal: abort.signal,
        })
      } catch (error) {
        if (!(error instanceof AssistantStreamUnavailableError)) {
          throw error
        }
        // Откат ПОСЛЕ начала потока запрещён (инструменты хода могли уже
        // сработать) — сюда попадаем только если поток не открылся вовсе.
        turn = await postAssistantMessage(request, abort.signal)
      }
      // Ход оборван «Стопом»: итога от бэкенда нет (соединение разорвано) —
      // ленту склеиваем сами из напечатанного, токены уже пришли событием
      // `state`. Ничего не напечаталось — лента остаётся как была.
      const next =
        turn.messages ??
        (turn.reply
          ? [...history, { role: "assistant" as const, content: turn.reply }]
          : history)
      setMessages(next)
      if (turn.messages) {
        applyTokens(turn.cart_id, turn.order_id)
      }
      // Вставки эфемерны: живут ровно один ход, как в mobile.
      setAttachments(turn.attachments ?? [])
      // Корзину на этом ходе мог поменять и сам ассистент — перечитываем состав,
      // иначе полоса корзины и счётчики покажут вчерашние цифры (T10.15).
      cart.refresh(tokens.cart)
      persist(next, tokens)
    } catch {
      // «Стоп» на ходе БЕЗ потока (откат на обычный POST) обрывает запрос — это
      // решение покупателя, а не сбой: плашку ошибки в этом случае не поднимаем.
      if (!abort.signal.aborted) {
        setHasError(true)
      }
    } finally {
      streamAbortRef.current = null
      setStreamedText("")
      setIsSending(false)
    }
  }

  // «Стоп»: рвём соединение — бэкенд прекращает ход, а в ленте остаётся ровно
  // то, что покупатель успел прочитать.
  const stop = () => {
    streamAbortRef.current?.abort()
  }

  const send = (text: string, files: ChatAttachment[] = []) => {
    const next: AssistantMessage[] = [
      ...messages,
      { role: "user", content: text },
    ]
    if (files.length) {
      // Место реплики в ленте и есть ключ: по нему пузырь покупателя рисует
      // превью того, что он приложил.
      setSentFiles((current) => ({ ...current, [messages.length]: files }))
    }
    setMessages(next)
    // Отметки о нажатиях гаснут: дальше о корзине говорит сам ассистент — он
    // видит её состав снимком.
    setCartEvents([])
    void runTurn(next, files)
  }

  // Вложения реплики, которой заканчивается история: ход не удался или его
  // переигрывают, а файл к нему всё ещё приложен — переспрашивать покупателя
  // «пришлите фото ещё раз» было бы издевательством.
  const filesOfLastTurn = (history: AssistantMessage[]) =>
    sentFiles[history.length - 1] ?? []

  const retry = () => {
    void runTurn(messages, filesOfLastTurn(messages))
  }

  // «Повторить ответ» под последним ответом ассистента (бриф раздел 3.4):
  // переигрываем последний ход — историю обрезаем по последней реплике
  // покупателя, иначе ход ушёл бы с ответом ассистента в хвосте.
  const regenerate = () => {
    if (isSending) {
      return
    }
    const fromEnd = [...messages]
      .reverse()
      .findIndex((message) => message.role === "user")
    if (fromEnd === -1) {
      return
    }
    const history = messages.slice(0, messages.length - fromEnd)
    setMessages(history)
    setAttachments([])
    setCartEvents([])
    void runTurn(history, filesOfLastTurn(history))
  }

  // Счётчик в полосе корзины изменил количество: пишем в корзину напрямую и
  // ставим в ленте тихую отметку. Хода модели тут нет —
  // ассистент увидит новый состав снимком корзины на следующем ходе (T10.15).
  // Работает и пока ассистент печатает: корзина от его ответа не зависит.
  const changeQuantity = (variantId: string, title: string, next: number) => {
    cart.setQuantity(variantId, next)
    setCartEvents((events) => [
      ...events.filter((event) => event.variantId !== variantId),
      { variantId, title, quantity: next },
    ])
  }

  // Оплата подтвердилась (поллинг платёжной вставки) — продолжаем диалог сами:
  // ассистент проверит платёж и оформит заказ. Реплика обычная, текстом — тот
  // же протокол, что у тапа по карточке товара.
  const handlePaid = () => {
    if (isSending || !cartId || autoContinuedCartRef.current === cartId) {
      return
    }
    autoContinuedCartRef.current = cartId
    send(m.assistant.payment.paidReply)
  }

  const startNew = () => {
    setConversationId(newConversationId())
    setMessages([])
    setAttachments([])
    setCartEvents([])
    setSentFiles({})
    cart.reset()
    // Новый диалог — новая корзина: отметку авто-продолжения снимаем.
    autoContinuedCartRef.current = undefined
    setCartId(undefined)
    setOrderId(undefined)
    setHasError(false)
    setIsDrawerOpen(false)
  }

  // Возобновление диалога: лента и токены сессии — из сохранённой записи.
  // Вставки не восстанавливаем (эфемерны), они придут со следующим ходом.
  const resume = (conversation: ChatConversation) => {
    setConversationId(conversation.id)
    setMessages(conversation.messages)
    setAttachments([])
    setCartEvents([])
    // Превью вложений поднятого диалога нет: файлы не сохраняются нигде — ни у
    // нас, ни на бэкенде. В ленте остаётся текст — то, что ассистент выписал
    // словами по вложению (правило системного промпта T10.4a).
    setSentFiles({})
    // Корзина возобновлённого диалога — та же: перечитываем её состав, чтобы
    // полоса корзины поднялась вместе с лентой.
    cart.refresh(conversation.cartId)
    autoContinuedCartRef.current = undefined
    setCartId(conversation.cartId)
    setOrderId(conversation.orderId)
    setHasError(false)
    setIsDrawerOpen(false)
  }

  const removeConversation = (id: string) => {
    chatHistory.remove(id)
    if (id === conversationId) {
      startNew()
    }
  }

  const toggleRail = () => {
    setIsRailCollapsed((collapsed) => {
      saveRailCollapsed(!collapsed)
      return !collapsed
    })
  }

  const isEmpty = messages.length === 0
  const lastIndex = messages.length - 1

  const composer = (
    <ChatComposer
      isSending={isSending}
      placeholder={
        isEmpty
          ? m.assistant.composer.placeholder
          : m.assistant.inputPlaceholder
      }
      onSend={send}
      onStop={stop}
    />
  )

  return (
    <div className="relative flex min-h-0 flex-1">
      <div className={railClass(isRailCollapsed, isDrawerOpen)}>
        <ChatRail
          conversations={chatHistory.conversations}
          activeId={conversationId}
          theme={theme}
          // Свёрнутость — настройка ДЕСКТОПА: в drawer'е мобильного рельс
          // всегда развёрнут, иначе покупатель, свернувший панель на большом
          // экране, получает на телефоне столбик иконок без истории, темы и
          // языка (находка гейта U T10.6b, тот же дефект был в кабинете).
          isCollapsed={isRailCollapsed && !isDrawerOpen}
          onToggleCollapse={toggleRail}
          onPick={resume}
          onRename={chatHistory.rename}
          onRemove={removeConversation}
          onNew={startNew}
          isAuthenticated={isAuthenticated}
        />
      </div>

      {/* Затемнение под drawer-ом истории (только мобильный). */}
      {isDrawerOpen && (
        <button
          type="button"
          aria-label={m.assistant.rail.open}
          onClick={() => setIsDrawerOpen(false)}
          className="absolute inset-0 z-30 bg-scrim/50 small:hidden"
          data-testid="chat-rail-scrim"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <h1 className="sr-only">{m.assistant.title}</h1>

        {/* Шапка чата — только мобильная: кнопка истории слева, название
            посередине, «новый чат» справа (раскладка эталона). На десктопе
            шапки нет вовсе: рельс всегда на экране и всё это есть в нём. */}
        <div className="flex h-14 items-center gap-1 px-1 small:hidden">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-label={m.assistant.rail.open}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-chip text-ink transition-colors hover:bg-surface-dim"
            data-testid="chat-history-toggle"
          >
            <BarsThree />
          </button>
          <span className="flex-1 truncate text-title-medium text-ink">
            {m.assistant.title}
          </span>
          <button
            type="button"
            onClick={startNew}
            aria-label={m.assistant.rail.newChat}
            title={m.assistant.rail.newChat}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-chip text-ink transition-colors hover:bg-surface-dim"
            data-testid="chat-new-button-header"
          >
            <PencilSquare />
          </button>
        </div>

        {isEmpty ? (
          // Приветствие по эталону Gemini (решение владельца 2026-09-14):
          // обращение обычным весом и крупно, под ним компактные подсказки и
          // композер. Квадратной метки «СМ» и абзаца-пояснения здесь больше
          // нет: у эталона на пустом экране ровно две вещи — обращение и поле,
          // а метка живёт там, где ей место, — у ответа ассистента.
          <div className="mx-auto flex w-full max-w-[760px] flex-1 flex-col items-center overflow-y-auto px-4 pb-4 small:justify-center small:pb-6">
            {/* На ТЕЛЕФОНЕ композер прижат к низу, а по центру остаётся одно
                обращение — так в эталоне (правка владельца 2026-09-14): поле
                стоит там, где под ним откроется клавиатура. На десктопе
                эталон центрирует всё вместе, поэтому обращение перестаёт
                растягиваться (`small:flex-none`), а центрирует родитель. */}
            <div className="flex flex-1 items-center justify-center py-6 small:flex-none">
              <h2 className="text-assistant-greeting text-ink small:text-assistant-greeting-large">
                {m.assistant.greeting}
              </h2>
            </div>
            <div className="flex w-full flex-col items-center gap-2">
              <SuggestionChips disabled={isSending} onPick={send} />
              {composer}
            </div>
          </div>
        ) : (
          <>
            <div
              ref={feedRef}
              onScroll={handleFeedScroll}
              role="log"
              aria-live="polite"
              className="mx-auto flex w-full max-w-[760px] flex-1 flex-col gap-5 overflow-y-auto px-4 py-4"
            >
              {messages.map((message, index) =>
                message.role === "user" ? (
                  <ChatBubble
                    key={index}
                    text={message.content}
                    attachments={sentFiles[index]}
                  />
                ) : (
                  <AssistantAnswer
                    key={index}
                    text={message.content}
                    onRegenerate={
                      index === lastIndex && !isSending ? regenerate : undefined
                    }
                  >
                    {/* Вставки принадлежат последнему ответу ассистента:
                        показываем их внутри блока ответа, сразу за текстом. */}
                    {index === lastIndex && attachments.length > 0 && (
                      <AttachmentList
                        attachments={attachments}
                        cartId={cartId}
                        orderId={orderId}
                        isAuthenticated={isAuthenticated}
                        onPaid={handlePaid}
                      />
                    )}
                  </AssistantAnswer>
                )
              )}

              {/* Тихий след от счётчиков: покупатель нажал «+», корзина
                  изменилась молча — без отметки непонятно, сработало ли. */}
              {cartEvents.length > 0 && (
                <div className="flex flex-col gap-1">
                  {cartEvents.map((event) => (
                    <CartEventLine
                      key={event.variantId}
                      title={event.title}
                      quantity={event.quantity}
                    />
                  ))}
                </div>
              )}

              {/* Ход идёт: до первой дельты — «печатает…», дальше растущий
                  ответ на месте будущего сообщения (ряд действий появится,
                  когда ответ дописан). */}
              {isSending &&
                (streamedText ? (
                  <AssistantAnswer text={streamedText} isStreaming />
                ) : (
                  <TypingBubble />
                ))}

              {hasError && (
                <div
                  className="flex items-center justify-between gap-2 rounded-card border border-error bg-error/10 px-3 py-2"
                  data-testid="chat-error"
                >
                  <span className="text-body-medium text-error">
                    {m.assistant.error}
                  </span>
                  <button
                    type="button"
                    onClick={retry}
                    disabled={isSending}
                    className="text-body-medium font-semibold text-accent hover:text-accent-pressed disabled:opacity-50"
                    data-testid="chat-retry-button"
                  >
                    {m.assistant.retry}
                  </button>
                </div>
              )}
            </div>

            <div className="mx-auto w-full max-w-[760px] px-4 pb-4">
              {/* Полоса корзины — единственное место, где покупатель сам
                  правит количество (T10.15, T10.19): в ленте счётчиков нет. */}
              <CartBar
                cart={cart.cart}
                quantities={cart.quantities}
                isBusy={cart.isBusy}
                hasError={cart.hasError}
                onQuantityChange={changeQuantity}
              />
              {composer}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ChatTemplate
