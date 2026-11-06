import { z } from "@medusajs/framework/zod"

// Продавец запроса: пользователю компании он известен по входу (канал из тела и
// query игнорируется), сотрудник площадки называет канал явно.
const salesChannelId = z.string().min(1).optional()

export const AdminGetPaymentSettingsParams = z.object({
  sales_channel_id: salesChannelId,
})
export type AdminGetPaymentSettingsParamsType = z.infer<
  typeof AdminGetPaymentSettingsParams
>

// Частичная правка. Ключи Kaspi: строка — новый ключ, "" или null — стереть,
// поля нет — оставить сохранённый.
export const AdminUpsertPaymentSettings = z.object({
  sales_channel_id: salesChannelId,
  kaspi_qr_enabled: z.boolean().optional(),
  kaspi_mode: z.enum(["mock", "live"]).optional(),
  kaspi_merchant_id: z.string().max(200).nullable().optional(),
  kaspi_api_key: z.string().max(2000).nullable().optional(),
  kaspi_webhook_secret: z.string().max(2000).nullable().optional(),
  // Ссылка из постоянного Kaspi QR магазина ("" или null — убрать).
  kaspi_static_qr_url: z.string().max(500).nullable().optional(),
  transfer_enabled: z.boolean().optional(),
  transfer_phone: z.string().max(40).nullable().optional(),
  transfer_recipient: z.string().max(120).nullable().optional(),
  transfer_note: z.string().max(500).nullable().optional(),
  debt_enabled: z.boolean().optional(),
  debt_max_amount: z.number().positive().max(1_000_000_000).nullable().optional(),
  debt_term_days: z.number().int().min(1).max(365).optional(),
})
export type AdminUpsertPaymentSettingsType = z.infer<
  typeof AdminUpsertPaymentSettings
>
