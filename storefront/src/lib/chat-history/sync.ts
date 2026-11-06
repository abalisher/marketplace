import { ChatConversation } from "./conversation"

const MAX_CONVERSATIONS = 50

// Сведение истории устройства с копиями на сервере (вошедший покупатель).
// Побеждает более свежая копия диалога; удалённые на другом устройстве
// убираются и здесь. upload — что этому устройству отправить на сервер: его
// диалоги, которых там нет, и те, что здесь свежее.
export const mergeConversations = (
  local: ChatConversation[],
  remote: ChatConversation[],
  removed: string[]
): { merged: ChatConversation[]; upload: ChatConversation[] } => {
  const gone = new Set(removed)
  const byId = new Map<string, ChatConversation>()
  for (const conversation of remote) {
    if (!gone.has(conversation.id)) {
      byId.set(conversation.id, conversation)
    }
  }

  const upload: ChatConversation[] = []
  for (const conversation of local) {
    if (gone.has(conversation.id)) {
      continue
    }
    const server = byId.get(conversation.id)
    if (!server || conversation.updatedAt > server.updatedAt) {
      byId.set(conversation.id, conversation)
      upload.push(conversation)
    }
  }

  const merged = Array.from(byId.values())
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, MAX_CONVERSATIONS)
  return { merged, upload }
}
