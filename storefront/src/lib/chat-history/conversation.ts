import { AssistantMessage } from "@lib/data/assistant"

// Один диалог в локальной истории витрины. Бэкенд остаётся stateless: переписка
// живёт на устройстве покупателя (DECISIONS 2026-07-24), как в mobile (T2.5).
// Вставки НЕ сохраняются — они эфемерны и относятся к последнему ходу.
export type ChatConversation = {
  id: string
  title: string
  messages: AssistantMessage[]
  cartId?: string
  orderId?: string
  updatedAt: number
  // Покупатель переименовал диалог руками (T10.1b): такой заголовок больше не
  // перетирается автозаголовком по первой реплике на каждом ходе.
  titleCustom?: boolean
}

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
