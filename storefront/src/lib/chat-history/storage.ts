import { ChatConversation, isLastingAttachment } from "./conversation"

const KEY_PREFIX = "sm_chat_history"
const MAX_CONVERSATIONS = 50

// Чья история: витрина (компания-продавец или площадка) × покупатель.
// - Витрина — корзины и заказы у каждого продавца свои, и диалог с одним
//   продавцом на витрине другого продолжать нечем.
// - Покупатель — на общем устройстве следующий человек не должен видеть чужие
//   диалоги. Гость — отдельная история; при входе она переходит покупателю
//   (диалог, начатый до входа, продолжается после него, T10.8).
// id покупателя приходит с сервера (сессия), браузер его не угадывает.
export type ChatHistoryOwner = {
  store: string | null
  customerId: string | null
}

export const historyKey = ({ store, customerId }: ChatHistoryOwner): string =>
  `${KEY_PREFIX}_${store ?? "main"}_${customerId ? `usr_${customerId}` : "guest"}`

// Разбор одной записи: битая запись НЕ должна ронять всю историю (тот же урок,
// что в mobile T2.5 — покордовый разбор списка).
const parseConversation = (raw: unknown): ChatConversation | null => {
  if (typeof raw !== "object" || raw === null) {
    return null
  }

  const candidate = raw as Partial<ChatConversation>

  if (
    typeof candidate.id !== "string" ||
    typeof candidate.title !== "string" ||
    !Array.isArray(candidate.messages)
  ) {
    return null
  }

  const messages = candidate.messages.filter(
    (message) =>
      typeof message?.content === "string" &&
      (message.role === "user" || message.role === "assistant")
  )

  if (messages.length === 0) {
    return null
  }

  // Карточки — тоже покордово: битая карточка выпадает, лента остаётся.
  const cards: NonNullable<ChatConversation["cards"]> = {}
  if (typeof candidate.cards === "object" && candidate.cards !== null) {
    for (const [index, list] of Object.entries(candidate.cards)) {
      const position = Number(index)
      if (!Number.isInteger(position) || !Array.isArray(list)) {
        continue
      }
      const valid = list.filter(
        (card) => typeof card?.type === "string" && isLastingAttachment(card)
      )
      if (valid.length) {
        cards[position] = valid
      }
    }
  }

  return {
    id: candidate.id,
    title: candidate.title,
    messages,
    cartId: typeof candidate.cartId === "string" ? candidate.cartId : undefined,
    orderId:
      typeof candidate.orderId === "string" ? candidate.orderId : undefined,
    updatedAt:
      typeof candidate.updatedAt === "number" ? candidate.updatedAt : 0,
    titleCustom: candidate.titleCustom === true,
    cards,
  }
}

// Диалоги из чужого источника (копии с сервера) — тем же покордовым разбором,
// что и локальная история: битая запись выпадает, остальные остаются.
export const normalizeConversations = (list: unknown[]): ChatConversation[] =>
  list
    .map(parseConversation)
    .filter((conversation): conversation is ChatConversation => Boolean(conversation))
    .sort((a, b) => b.updatedAt - a.updatedAt)

// История диалогов из localStorage, новые сверху. Недоступное хранилище
// (приватный режим, отключённые cookie) — это пустая история, а не падение.
const readList = (key: string): ChatConversation[] => {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .map(parseConversation)
      .filter((conversation): conversation is ChatConversation =>
        Boolean(conversation)
      )
      .sort((a, b) => b.updatedAt - a.updatedAt)
  } catch {
    return []
  }
}

export const saveConversations = (
  owner: ChatHistoryOwner,
  conversations: ChatConversation[]
): void => {
  try {
    window.localStorage.setItem(
      historyKey(owner),
      JSON.stringify(conversations.slice(0, MAX_CONVERSATIONS))
    )
  } catch {
    // Переполненное/недоступное хранилище не должно ломать диалог.
  }
}

// История владельца. Покупатель только что вошёл — его гостевые диалоги на
// этой витрине переходят к нему (гостевая история после этого пуста).
export const loadConversations = (owner: ChatHistoryOwner): ChatConversation[] => {
  const own = readList(historyKey(owner))
  if (!owner.customerId) {
    return own
  }
  const guestKey = historyKey({ store: owner.store, customerId: null })
  const guest = readList(guestKey)
  if (!guest.length) {
    return own
  }
  const known = new Set(own.map((conversation) => conversation.id))
  const merged = [...guest.filter((c) => !known.has(c.id)), ...own].sort(
    (a, b) => b.updatedAt - a.updatedAt
  )
  saveConversations(owner, merged)
  try {
    window.localStorage.removeItem(guestKey)
  } catch {
    // см. saveConversations
  }
  return merged
}
