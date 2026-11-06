import { z } from "@medusajs/framework/zod"

// Компания запроса: продавцу компании она известна по входу (tenant_id из тела
// и query игнорируется), сотрудник площадки называет её явно.
const tenantId = z.string().min(1).optional()

const serviceUrl = z
  .string()
  .trim()
  .refine(
    (value) => /^https?:\/\/[^\s/]+\/\S*$/i.test(value),
    "Нужна полная ссылка на HTTP-сервис 1С (https://…/hs/…)"
  )

export const AdminGetOnecParams = z.object({
  tenant_id: tenantId,
})
export type AdminGetOnecParamsType = z.infer<typeof AdminGetOnecParams>

// Частичная правка подключения. Пустой пароль — оставить сохранённый (экран
// пароль не получает и поле показывает пустым).
export const AdminUpsertOnecConnection = z.object({
  tenant_id: tenantId,
  // Источник каталога: HTTP-сервис 1С или Excel-файл.
  source: z.enum(["http", "file"]).optional(),
  base_url: serviceUrl.optional(),
  // Пустая строка/null — второго сервиса нет.
  stock_url: serviceUrl.nullable().optional().or(z.literal("")),
  login: z.string().trim().min(1).optional(),
  password: z.string().optional().nullable(),
  enabled: z.boolean().optional(),
  interval_minutes: z.number().int().min(5).max(24 * 60).optional(),
  exclusive_catalog: z.boolean().optional(),
  stock_location_id: z.string().min(1).nullable().optional(),
})
export type AdminUpsertOnecConnectionType = z.infer<
  typeof AdminUpsertOnecConnection
>

// Проверка подключения: можно проверить ещё не сохранённые адрес и логин
// (пароль не передан — берётся сохранённый).
export const AdminTestOnecConnection = z.object({
  tenant_id: tenantId,
  base_url: serviceUrl.optional(),
  stock_url: serviceUrl.nullable().optional().or(z.literal("")),
  login: z.string().trim().min(1).optional(),
  password: z.string().optional().nullable(),
})
export type AdminTestOnecConnectionType = z.infer<typeof AdminTestOnecConnection>

export const AdminSyncOnec = z.object({
  tenant_id: tenantId,
})
export type AdminSyncOnecType = z.infer<typeof AdminSyncOnec>

// Excel-файл каталога компании: содержимое base64 в JSON (та же идиома, что у
// импорта «Цен и остатков»). 10 МБ файла ≈ 13,4 млн знаков base64.
// apply = false — только разобрать и показать, что понято; true — загрузить в
// каталог (прогон в фоне, итог — в журнале).
export const ONEC_FILE_MAX_BASE64 = 14_000_000
export const AdminUploadOnecFile = z.object({
  tenant_id: tenantId,
  file_name: z.string().trim().min(1).max(255),
  content_base64: z.string().min(1).max(ONEC_FILE_MAX_BASE64),
  apply: z.boolean().optional().default(false),
})
export type AdminUploadOnecFileType = z.infer<typeof AdminUploadOnecFile>
