import { model } from "@medusajs/framework/utils"
import PaymentEntry from "./payment-entry"
import PaymentReceipt from "./payment-receipt"
import { ORDER_PAYMENT_STATUSES, PAYMENT_METHODS } from "./values"

// Оплата заказа: способ, сумма к оплате, сколько получено и возвращено, и
// состояние — одна строка на заказ. Деньги в ядре (payment collection) остаются
// как есть, а здесь — то, чего в ядре нет: способ («перевод», «в долг»), срок
// долга, кто одобрил и журнал движений денег (entries).
//
// order_id — внешний id ядра (как у остальных модулей, без FK). Канал и
// покупатель скопированы на момент оформления: по ним отчёт режет выборку
// продавцу компании и группирует долги по покупателю без похода в заказы.
const OrderPayment = model
  .define("order_payment", {
    id: model.id({ prefix: "ordpay" }).primaryKey(),
    order_id: model.text().unique(),
    order_display_id: model.number().nullable(),
  // Номер заказа для людей (ORG-26-0007); у старых строк — пусто.
  order_number: model.text().nullable(),
    sales_channel_id: model.text().nullable(),
    customer_id: model.text().nullable(),
    customer_name: model.text().nullable(),
    customer_phone: model.text().nullable(),
    method: model.enum([...PAYMENT_METHODS]),
    status: model.enum([...ORDER_PAYMENT_STATUSES]),
    currency_code: model.text().default("kzt"),
    // Сумма к оплате — итог заказа за вычетом бонусов.
    amount: model.bigNumber(),
    paid_amount: model.bigNumber().default(0),
    refunded_amount: model.bigNumber().default(0),
    // Долг: срок погашения и кто его одобрил.
    due_date: model.dateTime().nullable(),
    approved_at: model.dateTime().nullable(),
    approved_by: model.text().nullable(),
    canceled_at: model.dateTime().nullable(),
    // Есть чек покупателя, который ждёт решения продавца: очередь заказов
    // показывает «Чек на проверке» одним полем, без похода по чекам.
    receipt_pending: model.boolean().default(false),
    // Покупатель менял способ оплаты: [{from, to, at}] — продавец видит, почему
    // заказ вдруг «в долг» или ждёт Kaspi.
    method_history: model.json().nullable(),
    entries: model.hasMany(() => PaymentEntry, {
      mappedBy: "order_payment",
    }),
    receipts: model.hasMany(() => PaymentReceipt, {
      mappedBy: "order_payment",
    }),
  })
  .indexes([
    { on: ["sales_channel_id"], where: "deleted_at IS NULL" },
    { on: ["customer_id"], where: "deleted_at IS NULL" },
    { on: ["method", "status"], where: "deleted_at IS NULL" },
  ])

export default OrderPayment
