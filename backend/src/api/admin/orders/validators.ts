import { z } from "@medusajs/framework/zod"
import {
  DELIVERY_METHODS,
  DELIVERY_WINDOWS,
  ORDER_STATUSES,
} from "../../../modules/order-lifecycle/models/statuses"

// Zod-схемы admin-роутов заказа: очередь жизненного цикла + переходы статуса.
// Подключаются в src/api/middlewares.ts; роуты читают req.validatedQuery/Body.

// Поля сортировки очереди (префикс «-» — по убыванию, конвенция Medusa).
export const ORDER_LIFECYCLE_ORDER_FIELDS = [
  "created_at",
  "-created_at",
  "updated_at",
  "-updated_at",
] as const

// Фильтр статуса принимает одно значение или несколько: чип «Сборка» на экране
// заказов покрывает сразу `assembling` и `partially_assembled`. Список приходит
// повторяющимся параметром (`status=a&status=b`) или через запятую.
const OrderStatusFilter = z.preprocess(
  (value) => (typeof value === "string" ? value.split(",") : value),
  z.union([z.enum(ORDER_STATUSES), z.array(z.enum(ORDER_STATUSES)).min(1)])
)

// Фильтры очереди заказов по бизнес-статусу + способу получения + поиск +
// сортировка + пагинация. Дефолт — НОВЫЕ СВЕРХУ (`-created_at`): правка
// владельца 2026-09-06. Раньше стоял FIFO («старые сверху, как очередь на
// обработку»), но на живой очереди из 38 заказов свежий уезжал на последнюю
// страницу, и оператор его не находил. `q` ищет по номеру заказа (display_id)
// и email покупателя.
export const AdminGetOrderLifecyclesParams = z.object({
  status: OrderStatusFilter.optional(),
  delivery_method: z.enum(DELIVERY_METHODS).optional(),
  q: z.string().trim().min(1).optional(),
  order: z.enum(ORDER_LIFECYCLE_ORDER_FIELDS).default("-created_at"),
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

// Вручение: конкретный fulfillment помечается доставленным. Код получения
// обязателен (проверяет workflow — «передан по коду»).
export const AdminDeliverOrder = z.object({
  fulfillment_id: z.string().min(1),
  delivery_code: z.string().trim().min(1).optional(),
})
export type AdminDeliverOrderType = z.infer<typeof AdminDeliverOrder>

// Перенос доставки на другое окно (T5.6b): новый слот + ОБЯЗАТЕЛЬНАЯ причина —
// лог заказа должен отвечать, кто и почему подвинул доставку (по звонку
// покупателя, из-за сдвига сборки). Доступность окна проверяет домен слота в
// шаге workflow, здесь — только форма значений.
export const AdminRescheduleOrder = z.object({
  slot_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slot_window: z.enum(DELIVERY_WINDOWS),
  reason: z.string().trim().min(1),
})
export type AdminRescheduleOrderType = z.infer<typeof AdminRescheduleOrder>

// Отмена заказа админом — причина опциональна (логируется в note/лог переходов).
// Подтверждение заказа (new → confirmed). Заказ «в долг» подтверждением
// одобряется: срок возврата — дата `YYYY-MM-DD` (нет — по умолчанию из
// настроек продавца).
export const AdminConfirmOrder = z.object({
  debt_due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Срок долга — дата в формате ГГГГ-ММ-ДД")
    .nullable()
    .optional(),
})
export type AdminConfirmOrderType = z.infer<typeof AdminConfirmOrder>

export const AdminCancelOrder = z.object({
  reason: z.string().trim().min(1).optional(),
})
export type AdminCancelOrderType = z.infer<typeof AdminCancelOrder>
