import { z } from "@medusajs/framework/zod"
import { DOCUMENT_TYPES } from "../../../modules/documents/models/constants"

// Реестр документов (T4.9): фильтр по типу, признаку отправки покупателю и
// поиску (номер документа или номер заказа), пагинация. Реестр показывает
// ТЕКУЩИЕ версии документов — история версий видна на экране заказа.
export const AdminGetDocumentsParams = z.object({
  // Список типов через запятую — чипы-фильтры экрана (идиома order-lifecycles).
  type: z
    .string()
    .trim()
    .min(1)
    .transform((value) => value.split(",").map((part) => part.trim()))
    .pipe(z.array(z.enum(DOCUMENT_TYPES)).min(1))
    .optional(),
  sent: z.enum(["sent", "unsent"]).optional(),
  q: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})
export type AdminGetDocumentsParamsType = z.infer<typeof AdminGetDocumentsParams>

// Ручной выпуск документа по заказу с экрана заказа.
export const AdminIssueOrderDocument = z.object({
  type: z.enum(DOCUMENT_TYPES),
})
export type AdminIssueOrderDocumentType = z.infer<
  typeof AdminIssueOrderDocument
>
