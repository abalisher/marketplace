import { model } from "@medusajs/framework/utils"
import OrderPayment from "./order-payment"
import { RECEIPT_STATUSES, RECEIPT_VERDICTS } from "./values"

// Чек Kaspi, который покупатель прислал по переводу или погашению долга:
// файл, что из него прочитано, итог автоматической проверки и решение
// продавца. Чек — не деньги: в журнал оплат он попадает, только когда продавец
// его засчитал (entry_id). Подделку скриншота распознавание не исключает,
// поэтому последнее слово — за продавцом и его приложением Kaspi.
const PaymentReceipt = model
  .define("payment_receipt", {
    id: model.id({ prefix: "payrcpt" }).primaryKey(),
    sales_channel_id: model.text().nullable(),
    file_id: model.text().nullable(),
    file_url: model.text().nullable(),
    file_name: model.text().nullable(),
    mime_type: model.text(),
    // sha256 содержимого: тот же файл второй раз — повтор.
    file_hash: model.text(),
    // Прочитано из чека (null — не видно).
    amount: model.bigNumber().nullable(),
    paid_at: model.dateTime().nullable(),
    receipt_number: model.text().nullable(),
    recipient_name: model.text().nullable(),
    recipient_phone: model.text().nullable(),
    sender_name: model.text().nullable(),
    comment: model.text().nullable(),
    // Весь разбор модели и список проверок [{code, level, ok}] — для экрана.
    parsed: model.json().nullable(),
    checks: model.json().nullable(),
    verdict: model.enum([...RECEIPT_VERDICTS]),
    status: model.enum([...RECEIPT_STATUSES]),
    reviewed_by: model.text().nullable(),
    reviewed_at: model.dateTime().nullable(),
    review_note: model.text().nullable(),
    entry_id: model.text().nullable(),
    order_payment: model.belongsTo(() => OrderPayment, {
      mappedBy: "receipts",
    }),
  })
  .indexes([
    { on: ["receipt_number"], where: "deleted_at IS NULL" },
    { on: ["file_hash"], where: "deleted_at IS NULL" },
    { on: ["sales_channel_id", "status"], where: "deleted_at IS NULL" },
  ])

export default PaymentReceipt
