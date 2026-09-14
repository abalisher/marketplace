import { MedusaResponse } from "@medusajs/framework/http"
import { DeliveryRejection } from "../../../lib/logistics/driver-trips"

// Отказы на поверхности рейсов водителя (T5.2b) — в одном месте на все роуты
// рейса: приложение разбирает `reason`, а `message` показывает человеку
// (идиома роутов входа водителя и «взять заказ»).
export type TripRejection =
  | "trip_not_found"
  | "stop_not_found"
  | "invalid_transition"
  | "stops_open"
  | DeliveryRejection

// 404 — чужой рейс и чужая точка: для водителя они не существуют.
// 409 — состояние на сервере разошлось с экраном (рейс уже закрыт, заказ ещё
// не отгрузили): приложению надо перечитать рейс, а не повторить запрос.
// 400 — неверный код получения: это ошибка ввода, повторять запрос можно.
const STATUS: Record<TripRejection, number> = {
  trip_not_found: 404,
  stop_not_found: 404,
  invalid_transition: 409,
  stops_open: 409,
  order_not_shipped: 409,
  no_fulfillment: 409,
  invalid_delivery_code: 400,
}

const MESSAGE: Record<TripRejection, string> = {
  trip_not_found: "Рейс не найден",
  stop_not_found: "Точка не найдена в этом рейсе",
  invalid_transition: "Шаг уже сделан — обновите рейс",
  stops_open: "В рейсе остались необслуженные точки",
  order_not_shipped: "Заказ ещё не отгружен со склада — получите груз у продавца",
  no_fulfillment: "По заказу нечего вручать — обратитесь к продавцу",
  invalid_delivery_code: "Неверный код получения — попросите покупателя назвать код из приложения",
}

export const rejectTrip = (res: MedusaResponse, reason: TripRejection): void => {
  res.status(STATUS[reason]).json({ reason, message: MESSAGE[reason] })
}
