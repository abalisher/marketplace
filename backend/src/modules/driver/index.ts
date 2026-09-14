import { Module } from "@medusajs/framework/utils"
import DriverModuleService from "./service"

// Ключ — driver: профиль водителя-gig и его допуск к работе (T5.1). Водитель
// НЕ сотрудник продавца (решение владельца 2026-08-25, п. 5): он сам
// регистрируется по номеру телефона и получает свой actor-тип `/driver/*`.
// Исполнительный слой доставки (рейсы, точки, GPS) живёт в `logistics` и
// ссылается на водителя опазной колонкой `driver_id` — модули не импортируем.
export const DRIVER_MODULE = "driver"

export default Module(DRIVER_MODULE, {
  service: DriverModuleService,
})
