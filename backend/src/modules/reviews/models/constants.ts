import { MedusaError } from "@medusajs/framework/utils"

// Объекты оценки: поставщик (товар/продавец) и доставка — оцениваются РАЗДЕЛЬНО
// (ТЗ, область из ревью дизайна мобилки 2026-07-15). Доставку оценивают только
// заказы со способом delivery — гейт проверяется в слое API/workflow (подзадача 2).
export const REVIEW_TARGETS = ["supplier", "delivery"] as const
export type ReviewTarget = (typeof REVIEW_TARGETS)[number]

// Видимость отзыва: опубликован (по умолчанию) или скрыт модерацией.
export const REVIEW_STATUSES = ["published", "hidden"] as const
export type ReviewStatus = (typeof REVIEW_STATUSES)[number]

export const MIN_RATING = 1
export const MAX_RATING = 5

// Категории диспута «проблема с заказом» (ТЗ).
export const DISPUTE_CATEGORIES = [
  "not_delivered", // не доставлен / не выдан
  "damaged", // повреждён при доставке
  "wrong_item", // привезли не то
  "quality", // претензия к качеству товара
  "other", // иное
] as const
export type DisputeCategory = (typeof DISPUTE_CATEGORIES)[number]

// Стейт-машина диспута: открыт → на рассмотрении → решён | отклонён.
export const DISPUTE_STATUSES = [
  "open",
  "in_review",
  "resolved",
  "rejected",
] as const
export type DisputeStatus = (typeof DISPUTE_STATUSES)[number]

// Разрешённые переходы статуса диспута (терминальные resolved/rejected —
// без исходящих).
export const DISPUTE_TRANSITIONS: Record<DisputeStatus, DisputeStatus[]> = {
  open: ["in_review", "resolved", "rejected"],
  in_review: ["resolved", "rejected"],
  resolved: [],
  rejected: [],
}

// Чистая проверка перехода статуса диспута — standalone-функция (не метод
// сервиса: правило @medusajs/service-methods-must-be-async требует async у
// публичных методов; чистый валидатор держим функцией, идиома bonus
// assertSpendWithinCap). Переиспользуется сервисом и workflow-шагом (подзадача 2).
export const assertDisputeTransition = (
  from: DisputeStatus,
  to: DisputeStatus
): void => {
  if (!DISPUTE_TRANSITIONS[from].includes(to)) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `Dispute transition ${from} → ${to} is not allowed`
    )
  }
}
