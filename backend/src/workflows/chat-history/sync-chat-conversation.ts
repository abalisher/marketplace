import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  ChatConversationInput,
  RemoveChatConversationInput,
  removeChatConversationStep,
  upsertChatConversationStep,
} from "./steps"

// Сохранить копию диалога покупателя с устройства (см. шаг).
export const upsertChatConversationWorkflow = createWorkflow(
  "upsert-chat-conversation",
  (input: WorkflowData<ChatConversationInput>) =>
    new WorkflowResponse(upsertChatConversationStep(input))
)

// Удалить диалог покупателя на всех устройствах (см. шаг).
export const removeChatConversationWorkflow = createWorkflow(
  "remove-chat-conversation",
  (input: WorkflowData<RemoveChatConversationInput>) =>
    new WorkflowResponse(removeChatConversationStep(input))
)
