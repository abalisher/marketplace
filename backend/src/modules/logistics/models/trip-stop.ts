import { model } from "@medusajs/framework/utils"
import Trip from "./trip"
import { TRIP_STOP_STATUSES, TRIP_STOP_TYPES } from "./constants"

// Точка рейса: выдача заказа или забор возврата. order_id — опазная ссылка-
// колонка (модуль order не импортируем). Отметка «выдано» (status=done) на точке
// delivery ТРИГГЕРИТ существующий deliver-order через workflow (подзадача 2) —
// код получения уже есть в order-lifecycle. `proof` (фото/подпись выдачи) и
// `checklist` (осмотр при возврате) — json-снапшоты. address_snapshot — адрес на
// момент планирования (не тянем из заказа при каждом чтении).
const TripStop = model
  .define("trip_stop", {
    id: model.id({ prefix: "tstop" }).primaryKey(),
    order_id: model.text(),
    type: model.enum([...TRIP_STOP_TYPES]).default("delivery"),
    // Порядок точки в рейсе (ручной в MVP; оптимизация маршрута отложена).
    sequence: model.number().default(0),
    status: model.enum([...TRIP_STOP_STATUSES]).default("pending"),
    address_snapshot: model.json().nullable(),
    proof: model.json().nullable(),
    checklist: model.json().nullable(),
    note: model.text().nullable(),
    trip: model.belongsTo(() => Trip, { mappedBy: "stops" }),
  })
  // Один заказ — одна точка своего типа (выдача и забор возврата не мешают
  // друг другу). С gig-моделью (T5.2a) «взять заказ» это гонка: два водителя
  // жмут кнопку одновременно, обе проверки «заказ ещё свободен» проходят, и
  // заказ уезжает дважды. Проверки в коде тут мало — уникальность держит БД;
  // живые записи, без учёта мягко удалённых (диспетчер освобождает заказ,
  // снимая точку).
  .indexes([
    {
      on: ["order_id", "type"],
      unique: true,
      where: "deleted_at IS NULL",
    },
  ])

export default TripStop
