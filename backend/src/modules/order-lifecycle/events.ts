// Имена событий домена «жизненный цикл заказа». Собственное событие
// перехода статуса — НЕ переиспользуем ядровые order.placed/order.completed/
// order.canceled (их эмитит ядро на completeCart/complete/cancel): они несут
// физику ядра, а нам нужен переход бизнес-статуса ТЗ (from → to) как единый хук
// для уведомлений/документов/бонуса/скоринга. Namespace order_lifecycle.*
// исключает коллизию с ядровыми order.* (см. DECISIONS 2026-07-14).
export const ORDER_STATUS_CHANGED_EVENT = "order_lifecycle.status_changed"

// Перенос слота доставки (T5.6b) — отдельное событие, а не status_changed:
// статус заказа при переносе не меняется, а уведомить покупателя нужно именно
// о новом окне («привезём не в среду днём, а в четверг утром»). Подписчики
// уведомлений различают два события, а не разбирают одно по полям.
export const ORDER_SLOT_CHANGED_EVENT = "order_lifecycle.slot_changed"
