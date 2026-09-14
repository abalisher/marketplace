import { z } from "@medusajs/framework/zod"
import { RECEIPT_SOURCES } from "../../../modules/procurement/models/constants"
import { MAX_INVOICE_BASE64_CHARS } from "../../../lib/invoice-ai"

// Валидаторы admin API закупа (procurement, подзадача 1b). Продавец работает из
// admin (seller-first); admin-аутентификация — у ядра автоматом. Контракт/Dart
// НЕ трогаем: приход — чисто admin-UI (docs/modules/procurement.md).

// Завести поставщика.
export const AdminCreateSupplier = z.object({
  name: z.string().trim().min(1).max(256),
  bin: z.string().trim().min(1).max(64).nullable().optional(),
  contact_phone: z.string().trim().min(1).max(64).nullable().optional(),
  contact_email: z.string().trim().email().nullable().optional(),
  note: z.string().trim().min(1).max(2000).nullable().optional(),
})
export type AdminCreateSupplierType = z.infer<typeof AdminCreateSupplier>

// Правка/деактивация поставщика (active=false — мягкое «удаление»).
export const AdminUpdateSupplier = z.object({
  name: z.string().trim().min(1).max(256).optional(),
  bin: z.string().trim().min(1).max(64).nullable().optional(),
  contact_phone: z.string().trim().min(1).max(64).nullable().optional(),
  contact_email: z.string().trim().email().nullable().optional(),
  note: z.string().trim().min(1).max(2000).nullable().optional(),
  active: z.boolean().optional(),
})
export type AdminUpdateSupplierType = z.infer<typeof AdminUpdateSupplier>

// Строка прихода: variant_id опционален (ИИ-черновик до сопоставления с SKU —
// подзадача 2; проводка требует сопоставления). Кол-во дробное (>0), цена в
// минорных единицах (тиын, ≥0).
const AdminReceiptLine = z.object({
  variant_id: z.string().trim().min(1).nullable().optional(),
  recognized_title: z.string().trim().min(1).max(512).nullable().optional(),
  material_kind: z.string().trim().min(1).max(128).nullable().optional(),
  quantity: z.number().positive(),
  unit: z.string().trim().min(1).max(32),
  unit_cost: z.number().min(0),
  expires_at: z.coerce.date().nullable().optional(),
})

// Разбор накладной ИИ (подзадача 2): файл приходит как base64 в JSON (без multer/
// персистенса — это распознавание, не хранение файла). Тип — только читаемые
// Gemini форматы. Размер — MAX_INVOICE_BYTES (8 МБ файла) в символах base64;
// лимит тела запроса в middlewares взят с запасом над ним, иначе крупный файл
// отваливается 413 до валидатора.
export const AdminParseInvoice = z.object({
  mime_type: z.enum([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ]),
  data: z
    .string()
    .min(1)
    .max(MAX_INVOICE_BASE64_CHARS),
})
export type AdminParseInvoiceType = z.infer<typeof AdminParseInvoice>

// Создать черновик прихода со строками (минимум одна).
export const AdminCreateReceipt = z.object({
  location_id: z.string().trim().min(1),
  supplier_id: z.string().trim().min(1).nullable().optional(),
  reference: z.string().trim().min(1).max(128).nullable().optional(),
  source: z.enum(RECEIPT_SOURCES).optional(),
  note: z.string().trim().min(1).max(2000).nullable().optional(),
  received_at: z.coerce.date().nullable().optional(),
  lines: z.array(AdminReceiptLine).min(1),
})
export type AdminCreateReceiptType = z.infer<typeof AdminCreateReceipt>

// Себестоимость и наценка товара (T4.9a): свод считается по всем вариантам
// товара сразу — карточка открыта на товаре. history_limit режет историю
// приходов: карточке нужны последние, а не весь журнал закупа по позиции.
export const AdminGetProductCostsParams = z.object({
  product_id: z.string().trim().min(1),
  history_limit: z.coerce.number().int().min(1).max(50).default(10),
})
export type AdminGetProductCostsParamsType = z.infer<
  typeof AdminGetProductCostsParams
>
