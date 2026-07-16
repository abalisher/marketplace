// Имена событий бонусного домена (namespace bonus.* — не пересекается с
// ядровыми). Эмитятся из workflows/джоб; подписчики-уведомления — заглушки до
// notification-провайдера (идиома order-lifecycle). События списания и
// сгорания (bonus.spent / bonus.expiring_soon / bonus.expired) добавятся в
// подзадачах 3–4 — константы заводим по мере появления эмиттеров.
export const BONUS_ACCRUED_EVENT = "bonus.accrued"
