import { z } from "@medusajs/framework/zod"
import { ORDER_STATUSES } from "../../../modules/order-lifecycle/models/statuses"

// Zod-схемы admin-роутов заказа: очередь жизненного цикла + переходы статуса.
// Подключаются в src/api/middlewares.ts; роуты читают req.validatedQuery/Body.

// Поля сортировки очереди (префикс «-» — по убыванию, конвенция Medusa).
export const ORDER_LIFECYCLE_ORDER_FIELDS = [
  "created_at",
  "-created_at",
  "updated_at",
  "-updated_at",
] as const

// Фильтры очереди заказов по бизнес-статусу + сортировка + пагинация.
// Дефолт — FIFO по created_at (старые сверху, как очередь на обработку).
export const AdminGetOrderLifecyclesParams = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  order: z.enum(ORDER_LIFECYCLE_ORDER_FIELDS).default("created_at"),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})
export type AdminGetOrderLifecyclesParamsType = z.infer<
  typeof AdminGetOrderLifecyclesParams
>

// Позиция к сборке/отгрузке (id позиции заказа + количество).
const OrderLineInput = z.object({
  id: z.string().min(1),
  quantity: z.number().int().positive(),
})

// Сборка (в т.ч. частичная): полная — все позиции заказа, частичная —
// подмножество. Ядровый createOrderFulfillment требует список позиций явно.
export const AdminCompleteAssembly = z.object({
  items: z.array(OrderLineInput).min(1),
  location_id: z.string().min(1).optional(),
})
export type AdminCompleteAssemblyType = z.infer<typeof AdminCompleteAssembly>

// Отгрузка: конкретный fulfillment + отгружаемые позиции.
export const AdminShipOrder = z.object({
  fulfillment_id: z.string().min(1),
  items: z.array(OrderLineInput),
})
export type AdminShipOrderType = z.infer<typeof AdminShipOrder>

// Доставка: конкретный fulfillment помечается доставленным.
export const AdminDeliverOrder = z.object({
  fulfillment_id: z.string().min(1),
})
export type AdminDeliverOrderType = z.infer<typeof AdminDeliverOrder>

// Отмена заказа админом — причина опциональна (логируется в note/лог переходов).
export const AdminCancelOrder = z.object({
  reason: z.string().trim().min(1).optional(),
})
export type AdminCancelOrderType = z.infer<typeof AdminCancelOrder>
