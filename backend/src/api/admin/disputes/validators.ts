import { z } from "@medusajs/framework/zod"
import {
  DISPUTE_CATEGORIES,
  DISPUTE_OUTCOMES,
  DISPUTE_STATUSES,
} from "../../../modules/reviews/models/constants"

// Фильтр статуса принимает одно значение или несколько (чип «Требуют ответа»
// покрывает open+in_review): список приходит повторяющимся параметром
// (`status=a&status=b`) или через запятую — идиома очереди заказов.
const DisputeStatusFilter = z.preprocess(
  (value) => (typeof value === "string" ? value.split(",") : value),
  z.union([
    z.enum(DISPUTE_STATUSES),
    z.array(z.enum(DISPUTE_STATUSES)).min(1),
  ])
)

// Очередь претензий: фильтр статуса (не задан — активные), поиск и пагинация.
// `q` ищет по номеру заказа, почте покупателя и тексту претензии.
export const AdminGetDisputesParams = z.object({
  status: DisputeStatusFilter.optional(),
  q: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})
export type AdminGetDisputesParamsType = z.infer<typeof AdminGetDisputesParams>

// Регистрация претензии оператором с чужих слов (звонок, самовывоз): заказ
// оператор выбирает поиском, покупателя вычисляет workflow из самого заказа.
export const AdminRegisterDispute = z.object({
  order_id: z.string().min(1),
  category: z.enum(DISPUTE_CATEGORIES),
  description: z.string().trim().min(10).max(1000),
})
export type AdminRegisterDisputeType = z.infer<typeof AdminRegisterDispute>

// Перевод диспута оператором по стейт-машине. Целевой статус — нетерминальный
// in_review или терминальные resolved|rejected (open — только начальный, задать
// его переходом нельзя). Проверку допустимости из ТЕКУЩЕГО статуса делает сервис.
// Последствие решения обязательно при удовлетворении (проверяет сервис), при
// отказе всегда «без компенсации» — присланное значение игнорируется.
export const AdminTransitionDispute = z.object({
  to: z.enum(["in_review", "resolved", "rejected"]),
  resolution: z.string().trim().min(1).max(4000).optional(),
  outcome: z.enum(DISPUTE_OUTCOMES).optional(),
})
export type AdminTransitionDisputeType = z.infer<typeof AdminTransitionDispute>
