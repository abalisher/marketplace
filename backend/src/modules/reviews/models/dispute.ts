import { model } from "@medusajs/framework/utils"
import {
  DISPUTE_CATEGORIES,
  DISPUTE_OUTCOMES,
  DISPUTE_SOURCES,
  DISPUTE_STATUSES,
} from "./constants"

// Диспут «проблема с заказом»: покупатель заявляет проблему по заказу, оператор
// платформы ведёт его по стейт-машине open → in_review → resolved|rejected.
// order_id/customer_id — опазные ссылки-колонки (как в review): сервис группирует
// по заказу и покупателю сам. Решение (resolution) заполняется при закрытии.
const Dispute = model.define("dispute", {
  id: model.id({ prefix: "dsp" }).primaryKey(),
  order_id: model.text(),
  customer_id: model.text(),
  category: model.enum([...DISPUTE_CATEGORIES]),
  description: model.text(),
  status: model.enum([...DISPUTE_STATUSES]).default("open"),
  // Текст решения/резолюции оператора; заполняется при resolved/rejected.
  resolution: model.text().nullable(),
  // Последствие решения (возврат/довоз/замена/бонусы/без компенсации):
  // заполняется вместе с резолюцией при закрытии, до него — null.
  outcome: model.enum([...DISPUTE_OUTCOMES]).nullable(),
  // Кто завёл: покупатель через чат или оператор с его слов (звонок).
  source: model.enum([...DISPUTE_SOURCES]).default("buyer"),
})

export default Dispute
