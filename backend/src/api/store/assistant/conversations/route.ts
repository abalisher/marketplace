import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { CHAT_HISTORY_MODULE } from "../../../../modules/chat-history"
import ChatHistoryModuleService from "../../../../modules/chat-history/service"
import { MAX_SYNCED_CONVERSATIONS } from "../../../../lib/assistant/chat-sync"
import { numericAmount } from "../../../../lib/payments/amount"
import { upsertChatConversationWorkflow } from "../../../../workflows/chat-history/sync-chat-conversation"
import { StoreUpsertChatConversationType } from "../validators"
import { conversationOwner } from "./scope"

// GET /store/assistant/conversations — диалоги покупателя на этой витрине
// (копии с его устройств, новые сверху) и id удалённых: устройство уберёт их
// у себя, а не вернёт на сервер старой копией.
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const owner = conversationOwner(req)
  const service = req.scope.resolve<ChatHistoryModuleService>(CHAT_HISTORY_MODULE)
  const rows = await service.listChatConversations(owner, { take: null })
  const live = rows
    .filter((row) => !row.removed_at)
    .map((row) => ({
      id: row.client_id,
      title: row.title,
      titleCustom: row.title_custom,
      messages: row.messages,
      cards: row.cards ?? {},
      cartId: row.cart_id ?? undefined,
      orderId: row.order_id ?? undefined,
      updatedAt: numericAmount(row.client_updated_at) ?? 0,
    }))
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, MAX_SYNCED_CONVERSATIONS)

  res.json({
    conversations: live,
    removed: rows.filter((row) => !!row.removed_at).map((row) => row.client_id),
  })
}

// POST /store/assistant/conversations — сохранить копию диалога с устройства
// (свежая побеждает, удалённый не воскресает — lib/assistant/chat-sync.ts).
export async function POST(
  req: AuthenticatedMedusaRequest<StoreUpsertChatConversationType>,
  res: MedusaResponse
) {
  const body = req.validatedBody
  const { result } = await upsertChatConversationWorkflow(req.scope).run({
    input: {
      ...conversationOwner(req),
      client_id: body.id,
      title: body.title,
      title_custom: body.title_custom ?? false,
      messages: body.messages,
      cards: (body.cards ?? null) as Record<string, unknown> | null,
      cart_id: body.cart_id ?? null,
      order_id: body.order_id ?? null,
      client_updated_at: body.updated_at,
    },
    throwOnError: true,
  })
  res.json({ status: result.decision })
}
