import { MedusaService } from "@medusajs/framework/utils"
import ChatConversation from "./models/chat-conversation"

// Копии диалогов покупателя с ассистентом (см. модель).
class ChatHistoryModuleService extends MedusaService({ ChatConversation }) {}

export default ChatHistoryModuleService
