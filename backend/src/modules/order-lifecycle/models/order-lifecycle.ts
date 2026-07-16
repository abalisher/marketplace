import { model } from "@medusajs/framework/utils"
import OrderLifecycleEvent from "./order-lifecycle-event"
import { DELIVERY_METHODS, ORDER_STATUSES } from "./statuses"

// Кастомный жизненный цикл заказа из ТЗ (source of truth для клиентов и
// уведомлений). Привязка к order ядра — через module link (см.
// docs/modules/order.md); прямого FK на order здесь нет намеренно.
// Ядровые status/fulfillment_status/payment_status не покрывают этапы
// «Подтверждён»/«В сборке» — потому статус кастомный.
// Имя сущности — OrderLifecycle, НЕ OrderStatus: тип OrderStatus занят
// ядровым enum модуля order, совпадение ломает GraphQL-схему линков.
const OrderLifecycle = model.define("order_lifecycle", {
  id: model.id({ prefix: "ordlc" }).primaryKey(),
  // Спред — копия readonly-кортежа: model.enum не принимает readonly-массив.
  status: model.enum([...ORDER_STATUSES]).default("new"),
  // Предыдущий статус — для удобства уведомлений (не читать лог ради «откуда»).
  previous_status: model.enum([...ORDER_STATUSES]).nullable(),
  // Последняя причина/комментарий перехода (например причина отмены).
  note: model.text().nullable(),
  // Способ получения — задаётся при оформлении и не меняется; выбирает карту
  // разрешённых переходов стейт-машины (см. сервис) и механизм приёмки.
  delivery_method: model.enum([...DELIVERY_METHODS]).default("delivery"),
  // Код получения (только delivery): выдаётся при переходе в in_delivery,
  // переход в delivered валиден только с верным кодом. Код знает покупатель
  // (ЛК + SMS позже); в admin-ответы не отдаём.
  delivery_code: model.text().nullable(),
  events: model.hasMany(() => OrderLifecycleEvent, {
    mappedBy: "order_lifecycle",
  }),
})

export default OrderLifecycle
