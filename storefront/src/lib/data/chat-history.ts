"use server"

import { sdk } from "@lib/config"
import { ChatConversation } from "@lib/chat-history/conversation"
import { getAuthHeaders } from "./cookies"

// Копии диалогов вошедшего покупателя на сервере — одна лента на телефоне и
// компьютере. Витрину бэкенд узнаёт по publishable key (подставляет
// sdk.client.fetch), покупателя — по сессии. Сбои синхронизации не ломают чат:
// история на устройстве остаётся как есть.

export type RemoteChatHistory = {
  conversations: ChatConversation[]
  // Удалённые на другом устройстве — убрать у себя, а не вернуть на сервер.
  removed: string[]
}

export async function listRemoteConversations(): Promise<RemoteChatHistory | null> {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers)) {
    return null
  }
  try {
    return await sdk.client.fetch<RemoteChatHistory>("/store/assistant/conversations", {
      method: "GET",
      headers,
      cache: "no-store",
    })
  } catch {
    return null
  }
}

export async function saveRemoteConversation(
  conversation: ChatConversation
): Promise<void> {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers) || !conversation.messages.length) {
    return
  }
  try {
    await sdk.client.fetch("/store/assistant/conversations", {
      method: "POST",
      headers,
      body: {
        id: conversation.id,
        title: conversation.title,
        title_custom: conversation.titleCustom === true,
        messages: conversation.messages.map(({ role, content }) => ({
          role,
          content,
        })),
        cards: conversation.cards ?? null,
        cart_id: conversation.cartId ?? null,
        order_id: conversation.orderId ?? null,
        updated_at: Math.round(conversation.updatedAt),
      },
    })
  } catch {
    // Не сохранилось — повторим при следующем ходе или входе.
  }
}

export async function deleteRemoteConversation(id: string): Promise<void> {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers)) {
    return
  }
  try {
    await sdk.client.fetch(`/store/assistant/conversations/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers,
    })
  } catch {
    // см. saveRemoteConversation
  }
}
