// Имена событий бонусного домена (namespace bonus.* — не пересекается с
// ядровыми). Эмитятся из workflows/джоб; подписчики-уведомления — заглушки до
// notification-провайдера (идиома order-lifecycle). События сгорания
// (bonus.expiring_soon / bonus.expired) добавятся в подзадаче 4 — константы
// заводим по мере появления эмиттеров.
export const BONUS_ACCRUED_EVENT = "bonus.accrued"
export const BONUS_SPENT_EVENT = "bonus.spent"
