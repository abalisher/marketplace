import { model } from "@medusajs/framework/utils"
import AssemblyTaskItem from "./assembly-task-item"
import { ASSEMBLY_TASK_STATUSES } from "./constants"

// Задание сборки — одна КАТЕГОРИЯ одного заказа (решение владельца 2026-08-25,
// п. 4: оплаченный заказ распадается по категориям, каждую собирает своя
// группа). order_id — опазная ссылка-колонка, не FK: модуль order ядра не
// импортируем (идиома logistics.trip_stop.order_id).
// category_handle — стабильный ключ категории каталога (см.
// src/lib/catalog/categories.ts) и одновременно ГРУППА-исполнитель: сборщик
// видит только задания своей группы. category_name — снапшот имени на момент
// распада: владелец вправе переименовать категорию, а история сборки не должна
// меняться задним числом.
const AssemblyTask = model
  .define("assembly_task", {
  id: model.id({ prefix: "astsk" }).primaryKey(),
  order_id: model.text(),
  category_handle: model.text(),
  category_name: model.text(),
  status: model.enum([...ASSEMBLY_TASK_STATUSES]).default("pending"),
  // Кто взял задание (user_id сборщика) — проставляется на переходе в picking.
  assignee_id: model.text().nullable(),
  started_at: model.dateTime().nullable(),
  completed_at: model.dateTime().nullable(),
  // Кто закрыл задание (user_id) — «кто отметил» из требования таска.
  completed_by: model.text().nullable(),
  // Комментарий сборщика (обычно причина нехватки).
  note: model.text().nullable(),
  items: model.hasMany(() => AssemblyTaskItem, { mappedBy: "task" }),
  })
  // На категорию заказа — ровно одно задание. Проверки «задания уже есть» в
  // сервисе мало: подписчик на order.placed может сработать дважды почти
  // одновременно (повторная доставка события, ретрай) — тогда обе проверки
  // проходят, и заказ получает по два задания на категорию. Уникальность
  // держим в БД, живые записи — без учёта мягко удалённых.
  .indexes([
    {
      on: ["order_id", "category_handle"],
      unique: true,
      where: "deleted_at IS NULL",
    },
  ])

export default AssemblyTask
