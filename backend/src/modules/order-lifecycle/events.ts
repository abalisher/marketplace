// Имена событий домена «жизненный цикл заказа». Собственное событие
// перехода статуса — НЕ переиспользуем ядровые order.placed/order.completed/
// order.canceled (их эмитит ядро на completeCart/complete/cancel): они несут
// физику ядра, а нам нужен переход бизнес-статуса ТЗ (from → to) как единый хук
// для уведомлений/документов/бонуса/скоринга. Namespace order_lifecycle.*
// исключает коллизию с ядровыми order.* (см. DECISIONS 2026-07-14).
export const ORDER_STATUS_CHANGED_EVENT = "order_lifecycle.status_changed"
