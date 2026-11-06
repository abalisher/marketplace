import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { removeChatConversationWorkflow } from "../../../../../workflows/chat-history/sync-chat-conversation"
import { conversationOwner } from "../scope"

// DELETE /store/assistant/conversations/:id — удалить диалог на всех
// устройствах покупателя.
export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  await removeChatConversationWorkflow(req.scope).run({
    input: { ...conversationOwner(req), client_id: req.params.id },
    throwOnError: true,
  })
  res.json({ id: req.params.id, deleted: true })
}
