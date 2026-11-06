import { model } from "@medusajs/framework/utils"
import OrderPayment from "./order-payment"
import {
  PAYMENT_ACTOR_TYPES,
  PAYMENT_CHANNELS,
  PAYMENT_ENTRY_KINDS,
} from "./values"

// Журнал оплат: каждое движение денег по заказу — поступление (оплата Kaspi QR,
// полученный перевод, погашение долга) или возврат покупателю. Записи не
// правятся и не удаляются: ошибку исправляют встречной записью, чтобы отчёт
// сходился с тем, что было на самом деле.
const PaymentEntry = model
  .define("payment_entry", {
    id: model.id({ prefix: "payent" }).primaryKey(),
    kind: model.enum([...PAYMENT_ENTRY_KINDS]),
    channel: model.enum([...PAYMENT_CHANNELS]),
    amount: model.bigNumber(),
    // Канал продаж — копия из оплаты заказа: отчёт фильтрует журнал продавца
    // компании одним условием.
    sales_channel_id: model.text().nullable(),
    actor_type: model.enum([...PAYMENT_ACTOR_TYPES]),
    actor_id: model.text().nullable(),
    note: model.text().nullable(),
    occurred_at: model.dateTime(),
    order_payment: model.belongsTo(() => OrderPayment, {
      mappedBy: "entries",
    }),
  })
  .indexes([
    { on: ["sales_channel_id", "occurred_at"], where: "deleted_at IS NULL" },
  ])

export default PaymentEntry
