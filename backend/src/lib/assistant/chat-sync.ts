// Сведение копий диалога с разных устройств покупателя: побеждает более свежая
// (время последнего изменения на устройстве); удалённый на одном устройстве
// диалог не воскрешает старая копия с другого. Чистые правила — их проверяют
// тесты, а роут и шаг workflow только применяют.

export type StoredConversation = {
  client_updated_at: number
  removed: boolean
}

export type UpsertDecision = "create" | "update" | "stale" | "removed"

export const upsertDecision = (
  existing: StoredConversation | null,
  incomingUpdatedAt: number
): UpsertDecision => {
  if (!existing) {
    return "create"
  }
  if (existing.removed) {
    return "removed"
  }
  return incomingUpdatedAt >= existing.client_updated_at ? "update" : "stale"
}

// Сколько диалогов держим на покупателя и витрину — как локальная история.
export const MAX_SYNCED_CONVERSATIONS = 50
