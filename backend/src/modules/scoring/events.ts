// Имена событий домена скоринга (namespace scoring.*). Эмитятся из workflow/джобы
// пересчёта (подзадача 2); подписчик — уведомление продавца об изменении рейтинга/
// лимита (заглушка до notification-провайдера, идиома order-lifecycle/bonus).
export const SCORE_RECOMPUTED_EVENT = "scoring.recomputed"
export const CREDIT_LIMIT_CHANGED_EVENT = "scoring.limit_changed"
