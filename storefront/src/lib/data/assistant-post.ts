import type {
  AssistantChatRequest,
  AssistantChatResponse,
} from "@lib/data/assistant"

// Обычный (непотоковый) ход ассистента на клиенте — откат, когда SSE не
// открылся. Запрос идёт в наш route handler `/api/assistant/chat` (он добавляет
// авторизацию и publishable-ключ и проксирует ход бэкенду), а не server
// action'ом: с вложением тело доходит до 12 МБ, а у действий Next предел 1 МБ.
// Бизнес-логики здесь нет: только транспорт.

export const postAssistantMessage = async (
  request: AssistantChatRequest,
  signal?: AbortSignal
): Promise<AssistantChatResponse> => {
  const response = await fetch("/api/assistant/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
    signal,
  })
  if (!response.ok) {
    throw new Error(`assistant turn failed: ${response.status}`)
  }
  return (await response.json()) as AssistantChatResponse
}
