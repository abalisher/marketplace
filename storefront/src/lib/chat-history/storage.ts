import { ChatConversation } from "./conversation"

const STORAGE_KEY = "sm_chat_history"
const MAX_CONVERSATIONS = 50

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
  }
}

// История диалогов из localStorage, новые сверху. Недоступное хранилище
// (приватный режим, отключённые cookie) — это пустая история, а не падение.
export const loadConversations = (): ChatConversation[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
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

export const saveConversations = (conversations: ChatConversation[]): void => {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(conversations.slice(0, MAX_CONVERSATIONS))
    )
  } catch {
    // Переполненное/недоступное хранилище не должно ломать диалог.
  }
}
