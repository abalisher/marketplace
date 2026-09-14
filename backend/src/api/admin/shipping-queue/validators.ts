import { z } from "@medusajs/framework/zod"
import { SHIPPING_STAGES } from "./rows"

// Очередь экрана отгрузки: фильтр стадии (собирается / готов / нехватка) и
// пагинация. Стадия — одно значение: чипы экрана взаимоисключающие, а «Все» —
// это отсутствие фильтра.
export const AdminGetShippingQueueParams = z.object({
  stage: z.enum(SHIPPING_STAGES).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})
export type AdminGetShippingQueueParamsType = z.infer<
  typeof AdminGetShippingQueueParams
>
