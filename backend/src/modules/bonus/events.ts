// Имена событий бонусного домена (namespace bonus.* — не пересекается с
// ядровыми). Эмитятся из workflows/джоб; подписчики-уведомления — заглушки до
// notification-провайдера (идиома order-lifecycle).
export const BONUS_ACCRUED_EVENT = "bonus.accrued"
export const BONUS_SPENT_EVENT = "bonus.spent"
// Сгорание (джоба expire-bonuses): предупреждение за expiry_notice_days до
// срока и факт сгорания несписанного остатка.
export const BONUS_EXPIRING_SOON_EVENT = "bonus.expiring_soon"
export const BONUS_EXPIRED_EVENT = "bonus.expired"
