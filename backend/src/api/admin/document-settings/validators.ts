import { z } from "@medusajs/framework/zod"

// Zod-схема правки реквизитов продавца. Все поля опциональны (частичное
// обновление); nullable-строки принимают null (сбросить реквизит). seller_name
// нельзя опустошать (используется в шапке документа) — только непустая строка.
export const AdminUpdateDocumentSettings = z.object({
  seller_name: z.string().min(1).optional(),
  seller_bin: z.string().nullable().optional(),
  seller_address: z.string().nullable().optional(),
  seller_phone: z.string().nullable().optional(),
  seller_email: z.string().email().nullable().optional(),
  seller_bank_name: z.string().nullable().optional(),
  seller_bank_bik: z.string().nullable().optional(),
  seller_iban: z.string().nullable().optional(),
  // Кбе и КНП печатаются в рамке платёжного поручения счёта: коды короткие
  // (2 и 3 цифры), пустыми быть не должны — иначе банк вернёт платёж.
  seller_kbe: z.string().min(1).optional(),
  seller_knp: z.string().min(1).optional(),
  director_name: z.string().nullable().optional(),
  footer_note: z.string().nullable().optional(),
})
export type AdminUpdateDocumentSettingsType = z.infer<
  typeof AdminUpdateDocumentSettings
>
