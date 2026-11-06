import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { CHAT_HISTORY_MODULE } from "../../modules/chat-history"
import ChatHistoryModuleService from "../../modules/chat-history/service"
import { numericAmount } from "../../lib/payments/amount"
import { upsertDecision, UpsertDecision } from "../../lib/assistant/chat-sync"

export type ChatConversationInput = {
  customer_id: string
  sales_channel_id: string
  client_id: string
  title: string
  title_custom: boolean
  messages: { role: "user" | "assistant"; content: string }[]
  cards: Record<string, unknown> | null
  cart_id: string | null
  order_id: string | null
  client_updated_at: number
}

const find = async (
  service: ChatHistoryModuleService,
  key: { customer_id: string; sales_channel_id: string; client_id: string }
) => {
  // Только ключ: вход шага несёт и ленту, а фильтр по ней ничего не найдёт.
  const [row] = await service.listChatConversations(
    {
      customer_id: key.customer_id,
      sales_channel_id: key.sales_channel_id,
      client_id: key.client_id,
    },
    { take: 1 }
  )
  return row ?? null
}

// Сохранить копию диалога с устройства: новая — заводится, более свежая —
// перезаписывает, устаревшая и удалённая — не трогают сервер. Компенсации нет:
// копия истории — не деньги и не заказ, следующая синхронизация её поправит.
export const upsertChatConversationStep = createStep(
  "upsert-chat-conversation",
  async (input: ChatConversationInput, { container }) => {
    const service = container.resolve<ChatHistoryModuleService>(CHAT_HISTORY_MODULE)
    const existing = await find(service, input)
    const decision: UpsertDecision = upsertDecision(
      existing
        ? {
            client_updated_at: numericAmount(existing.client_updated_at) ?? 0,
            removed: !!existing.removed_at,
          }
        : null,
      input.client_updated_at
    )
    const fields = {
      title: input.title,
      title_custom: input.title_custom,
      messages: input.messages as unknown as Record<string, unknown>,
      cards: input.cards,
      cart_id: input.cart_id,
      order_id: input.order_id,
      client_updated_at: input.client_updated_at,
    }
    if (decision === "create") {
      await service.createChatConversations({
        customer_id: input.customer_id,
        sales_channel_id: input.sales_channel_id,
        client_id: input.client_id,
        ...fields,
      })
    } else if (decision === "update" && existing) {
      await service.updateChatConversations({ id: existing.id, ...fields })
    }
    return new StepResponse({ decision })
  }
)

export type RemoveChatConversationInput = {
  customer_id: string
  sales_channel_id: string
  client_id: string
}

// Удалить диалог: ленту стираем, пометку оставляем — иначе копия с другого
// устройства вернула бы его при следующей синхронизации.
export const removeChatConversationStep = createStep(
  "remove-chat-conversation",
  async (input: RemoveChatConversationInput, { container }) => {
    const service = container.resolve<ChatHistoryModuleService>(CHAT_HISTORY_MODULE)
    const existing = await find(service, input)
    const removedAt = new Date()
    if (existing) {
      await service.updateChatConversations({
        id: existing.id,
        removed_at: removedAt,
        messages: [] as unknown as Record<string, unknown>,
        cards: null,
        title: "",
      })
    } else {
      await service.createChatConversations({
        ...input,
        title: "",
        messages: [] as unknown as Record<string, unknown>,
        client_updated_at: removedAt.getTime(),
        removed_at: removedAt,
      })
    }
    return new StepResponse({ removed: true })
  }
)
