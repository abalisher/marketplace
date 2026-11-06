import { z } from "@medusajs/framework/zod"

const salesChannelId = z.string().min(1).optional()

// Журнал оплат: период (ISO-время границ считает клиент в поясе магазина),
// вид движения, канал денег, продавец (только сотруднику площадки).
export const AdminGetPaymentEntriesParams = z.object({
  sales_channel_id: salesChannelId,
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  kind: z.enum(["payment", "refund"]).optional(),
  channel: z.enum(["kaspi_qr", "kaspi_transfer", "cash", "card", "other"]).optional(),
  q: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})
export type AdminGetPaymentEntriesParamsType = z.infer<
  typeof AdminGetPaymentEntriesParams
>

// Долги: open — одобрены и не погашены, requested — ждут решения продавца,
// closed — погашены, all — все заказы «в долг».
export const AdminGetDebtsParams = z.object({
  sales_channel_id: salesChannelId,
  state: z.enum(["open", "requested", "closed", "all"]).default("open"),
  q: z.string().trim().max(100).optional(),
})
export type AdminGetDebtsParamsType = z.infer<typeof AdminGetDebtsParams>

export const AdminExportPaymentReportParams = z.object({
  view: z.enum(["entries", "debts"]),
  sales_channel_id: salesChannelId,
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  kind: z.enum(["payment", "refund"]).optional(),
  channel: z.enum(["kaspi_qr", "kaspi_transfer", "cash", "card", "other"]).optional(),
  state: z.enum(["open", "requested", "closed", "all"]).default("open"),
  q: z.string().trim().max(100).optional(),
})
export type AdminExportPaymentReportParamsType = z.infer<
  typeof AdminExportPaymentReportParams
>

// Чеки покупателей: waiting — ждут решения продавца, all — все.
export const AdminGetReceiptsParams = z.object({
  sales_channel_id: salesChannelId,
  state: z.enum(["waiting", "all"]).default("waiting"),
})
export type AdminGetReceiptsParamsType = z.infer<typeof AdminGetReceiptsParams>
