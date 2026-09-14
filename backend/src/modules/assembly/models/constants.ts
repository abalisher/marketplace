// Значения статусов сборки заказа (T10.11). Вынесены отдельно от моделей:
// обе модели (AssemblyTask и его позиции) читают эти значения, а держать их
// в одной из моделей нельзя — получилась бы циклическая инициализация
// (идиома order-lifecycle/models/statuses.ts).

// Статус задания сборки (одна категория одного заказа):
// ожидает → собирается → собрано (всё есть) | нехватка (часть не набралась).
// «Нехватка» — не тупик: сборщик возвращается в «собирается», когда позицию
// довезли, поэтому переход shortage → picking разрешён.
export const ASSEMBLY_TASK_STATUSES = [
  "pending",
  "picking",
  "assembled",
  "shortage",
] as const
export type AssemblyTaskStatus = (typeof ASSEMBLY_TASK_STATUSES)[number]

// Задание закрыто (сборщик своё отработал): либо собрано, либо зафиксирована
// нехватка. Решение по нехватке принимает отвечающий за отгрузку — заказ не
// блокируется молча (требование владельца, п. 4).
export const ASSEMBLY_TASK_FINAL_STATUSES: AssemblyTaskStatus[] = [
  "assembled",
  "shortage",
]

// Отметка сборщика по одной позиции задания: не отмечена → набрана целиком |
// набрана частично | в наличии нет.
export const ASSEMBLY_ITEM_STATUSES = [
  "pending",
  "picked",
  "partial",
  "missing",
] as const
export type AssemblyItemStatus = (typeof ASSEMBLY_ITEM_STATUSES)[number]
