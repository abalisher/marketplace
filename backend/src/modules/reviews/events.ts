// Имена событий домена отзывов/диспутов (namespace review.*/dispute.* — не
// пересекаются с ядровыми). Эмитятся из workflows (подзадача 2); подписчики-
// уведомления (продавцу о новом отзыве/диспуте, покупателю о решении) — заглушки
// до notification-провайдера (идиома order-lifecycle/bonus).
export const REVIEW_CREATED_EVENT = "review.created"
export const DISPUTE_OPENED_EVENT = "dispute.opened"
export const DISPUTE_STATUS_CHANGED_EVENT = "dispute.status_changed"
