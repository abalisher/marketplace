import { z } from "@medusajs/framework/zod"

// Движение денег по заказу, отмеченное продавцом. Канал — как фактически
// пришли (ушли) деньги: долг гасят наличными или переводом.
export const AdminRecordOrderPayment = z.object({
  amount: z.number().positive().max(1_000_000_000),
  channel: z.enum(["kaspi_qr", "kaspi_transfer", "cash", "card", "other"]),
  note: z.string().trim().max(500).nullable().optional(),
  // Когда деньги пришли на самом деле (продавец отмечает задним числом).
  occurred_at: z.coerce.date().nullable().optional(),
})
export type AdminRecordOrderPaymentType = z.infer<typeof AdminRecordOrderPayment>

// Решение по чеку покупателя: засчитать (сумму можно поправить) или отклонить
// (причина обязательна — её увидит покупатель).
export const AdminAcceptPaymentReceipt = z.object({
  amount: z.number().positive().max(1_000_000_000).nullable().optional(),
  note: z.string().trim().max(500).nullable().optional(),
})
export type AdminAcceptPaymentReceiptType = z.infer<typeof AdminAcceptPaymentReceipt>

export const AdminRejectPaymentReceipt = z.object({
  note: z.string().trim().min(1).max(500),
})
export type AdminRejectPaymentReceiptType = z.infer<typeof AdminRejectPaymentReceipt>
