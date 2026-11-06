// Значения домена оплат заказа. Отдельно от моделей: их импортируют обе модели
// (оплата заказа и запись журнала), правила в lib/payments и клиенты.

// Способ оплаты, который покупатель выбрал при оформлении:
// - kaspi_qr — счёт Kaspi (QR или ссылка), оплата подтверждается банком;
// - kaspi_transfer — перевод на номер Kaspi продавца, поступление отмечает
//   продавец;
// - debt — «в долг»: покупатель просит отсрочку, продавец решает при
//   подтверждении заказа и потом отмечает погашения;
// - bonus — заказ целиком оплачен бонусами (платёжной сессии нет).
export const PAYMENT_METHODS = [
  "kaspi_qr",
  "kaspi_transfer",
  "debt",
  "bonus",
] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

// Способы, которые покупатель выбирает сам (bonus получается сам собой).
export const SELECTABLE_PAYMENT_METHODS = [
  "kaspi_qr",
  "kaspi_transfer",
  "debt",
] as const
export type SelectablePaymentMethod = (typeof SELECTABLE_PAYMENT_METHODS)[number]

// Состояние оплаты заказа:
// - awaiting — ждём перевод;
// - debt_requested — покупатель просит в долг, продавец ещё не решил;
// - debt — долг одобрен и погашен не полностью (частичное погашение видно по
//   paid_amount);
// - paid — получено всё;
// - canceled — заказ отменён, денег не было;
// - refund_due — заказ отменён, а деньги получены: продавец должен вернуть;
// - refunded — возвращено всё полученное.
export const ORDER_PAYMENT_STATUSES = [
  "awaiting",
  "debt_requested",
  "debt",
  "paid",
  "canceled",
  "refund_due",
  "refunded",
] as const
export type OrderPaymentStatus = (typeof ORDER_PAYMENT_STATUSES)[number]

// Запись журнала — движение денег: поступление или возврат покупателю.
export const PAYMENT_ENTRY_KINDS = ["payment", "refund"] as const
export type PaymentEntryKind = (typeof PAYMENT_ENTRY_KINDS)[number]

// Как фактически пришли (ушли) деньги. Отличается от способа оплаты заказа:
// долг гасят наличными или переводом, а возврат по переводу делают переводом.
export const PAYMENT_CHANNELS = [
  "kaspi_qr",
  "kaspi_transfer",
  "cash",
  "card",
  "other",
] as const
export type PaymentChannel = (typeof PAYMENT_CHANNELS)[number]

// Кто записал движение: система (оплата Kaspi QR, авто-возврат), продавец или
// сотрудник площадки.
export const PAYMENT_ACTOR_TYPES = ["system", "seller", "admin"] as const
export type PaymentActorType = (typeof PAYMENT_ACTOR_TYPES)[number]

// Режим Kaspi QR у продавца: тестовый (без денег, кнопка «оплатить» на стенде)
// или рабочий (ключи от Kaspi).
export const KASPI_MODES = ["mock", "live"] as const
export type KaspiMode = (typeof KASPI_MODES)[number]

// Чек Kaspi, присланный покупателем (перевод, погашение долга):
// - pending — распознан, замечаний нет или они мягкие: ждёт решения продавца;
// - flagged — проверка нашла нарушение (чужой получатель, чек раньше заказа,
//   уже использованный номер…): продавец решает, но по умолчанию — не верить;
// - accepted — продавец засчитал (по чеку есть запись журнала);
// - rejected — продавец отклонил.
export const RECEIPT_STATUSES = ["pending", "flagged", "accepted", "rejected"] as const
export type ReceiptStatus = (typeof RECEIPT_STATUSES)[number]

// Итог автоматической проверки чека: ok — всё сошлось, warning — есть что
// проверить глазами, fail — нарушение.
export const RECEIPT_VERDICTS = ["ok", "warning", "fail"] as const
export type ReceiptVerdict = (typeof RECEIPT_VERDICTS)[number]
