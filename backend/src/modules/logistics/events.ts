// Имена событий домена логистики (namespace trip.*/gps.* — не пересекаются с
// ядровыми). Эмитятся из workflows (подзадача 2); подписчики (уведомление
// покупателю о выезде/прибытии, триггер deliver-order на выдаче) — заглушки до
// notification-провайдера (идиома order-lifecycle/reviews).
export const TRIP_STATUS_CHANGED_EVENT = "trip.status_changed"
export const TRIP_STOP_STATUS_CHANGED_EVENT = "trip_stop.status_changed"
// Водитель-gig взял заказ из пула (T5.2a): заказ ушёл конкретному человеку, и
// продавцу это надо знать без опроса экрана — назначение больше не идёт через
// диспетчера.
export const TRIP_CLAIMED_EVENT = "trip.claimed"
