import { model } from "@medusajs/framework/utils"
import TripStop from "./trip-stop"
import { TRIP_STATUSES } from "./constants"

// Рейс водителя — исполнительный слой доставки ПОД жизненным циклом заказа (не
// дублирует ядровые fulfillment/shipment; см. docs/modules/logistics.md).
// driver_id/location_id — опазные ссылки-колонки (не FK: водитель — ядровый
// user/сотрудник, склад — stock location; модули не импортируем, идиома
// reviews.order_id). Стейт-машина статуса — в сервисе (assertTripTransition).
const Trip = model.define("trip", {
  id: model.id({ prefix: "trip" }).primaryKey(),
  driver_id: model.text(),
  location_id: model.text(),
  status: model.enum([...TRIP_STATUSES]).default("planned"),
  started_at: model.dateTime().nullable(),
  finished_at: model.dateTime().nullable(),
  note: model.text().nullable(),
  stops: model.hasMany(() => TripStop, { mappedBy: "trip" }),
})

export default Trip
