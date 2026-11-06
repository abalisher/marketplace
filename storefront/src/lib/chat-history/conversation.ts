import { AssistantAttachment, AssistantMessage } from "@lib/data/assistant"

// Один диалог в локальной истории витрины. Бэкенд остаётся stateless: переписка
// живёт на устройстве покупателя (DECISIONS 2026-07-24), как в mobile (T2.5).
export type ChatConversation = {
  id: string
  title: string
  messages: AssistantMessage[]
  // Карточки ответов (статус заказа, документы) по месту ответа в ленте: ушёл
  // со страницы и вернулся — карточки на месте, как и текст. Карточки-действия
  // (оплата, форма доставки, вход) не сохраняются — см. isLastingAttachment.
  cards?: Record<number, AssistantAttachment[]>
  cartId?: string
  orderId?: string
  updatedAt: number
  // Покупатель переименовал диалог руками (T10.1b): такой заголовок больше не
  // перетирается автозаголовком по первой реплике на каждом ходе.
  titleCustom?: boolean
}

// Карточка, которая остаётся в ленте навсегда: снимок факта (статус заказа на
// момент ответа, документы). Карточки-действия живут только под последним
// ответом и только в текущем открытии чата: поднятый из истории QR давно
// оплаченной корзины или форма уже сохранённого адреса сбивали бы с толку.
//
// Оплата оформленного заказа (`order_payment`) — тоже постоянная: в карточке
// только id заказа, состояние она читает живым при каждом открытии.
export const isLastingAttachment = (attachment: AssistantAttachment): boolean =>
  attachment.type === "order_status" ||
  attachment.type === "documents" ||
  attachment.type === "order_payment"

// Сохраняемые карточки диалога: только «вечные» и только у ответов, которые
// ещё есть в ленте (после «Повторить ответ» хвост истории обрезается).
export const lastingCards = (
  cards: Record<number, AssistantAttachment[]>,
  messageCount: number
): Record<number, AssistantAttachment[]> =>
  Object.fromEntries(
    Object.entries(cards)
      .map(([index, list]) => [Number(index), list.filter(isLastingAttachment)] as const)
      .filter(([index, list]) => index < messageCount && list.length > 0)
  )

const TITLE_LIMIT = 48

// Заголовок диалога — первая реплика покупателя, обрезанная до 48 символов
// (так же, как в mobile): по нему покупатель узнаёт диалог в списке.
//
// Диалог может НАЧАТЬСЯ со снимка без подписи (T10.4b) — тогда первая реплика
// пуста, и заголовком становится первый непустой текст, то есть ответ
// ассистента (он выписывает разобранное словами). Безымянная строка в истории
// хуже любого заголовка: узнать по ней диалог нельзя.
export const conversationTitle = (messages: AssistantMessage[]): string => {
  const first =
    messages.find(
      (message) => message.role === "user" && message.content.trim()
    ) ?? messages.find((message) => message.content.trim())
  const text = first?.content.trim().replace(/\s+/g, " ") ?? ""

  if (text.length <= TITLE_LIMIT) {
    return text
  }

  return `${text.slice(0, TITLE_LIMIT - 1)}…`
}
