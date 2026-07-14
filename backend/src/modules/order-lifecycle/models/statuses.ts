// Значения статусов жизненного цикла заказа (ТЗ) и типы актора перехода.
// Вынесены отдельно от моделей: обе модели (OrderLifecycle и лог событий)
// импортируют эти значения, а держать их в одной из моделей нельзя —
// получилась бы циклическая инициализация значений между файлами моделей.

// Жизненный цикл заказа из ТЗ:
// Новый → Подтверждён → В сборке → Частично/Полностью собран → В доставке →
// Доставлен → Закрыт (+ Отменён, Возврат). Переходы — в сервисе модуля.
export const ORDER_STATUSES = [
  "new",
  "confirmed",
  "assembling",
  "partially_assembled",
  "assembled",
  "in_delivery",
  "delivered",
  "closed",
  "canceled",
  "returned",
] as const
export type OrderStatusValue = (typeof ORDER_STATUSES)[number]

// Кто инициировал переход (для лога и уведомлений): покупатель, продавец,
// админ платформы или система (джобы — например авто-закрытие после окна возврата).
export const STATUS_ACTOR_TYPES = ["buyer", "seller", "admin", "system"] as const
export type StatusActorType = (typeof STATUS_ACTOR_TYPES)[number]
