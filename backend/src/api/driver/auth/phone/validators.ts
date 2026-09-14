import { z } from "@medusajs/framework/zod"

// Вход водителя по номеру телефона (T5.1) — тот же контракт, что у покупателя:
// номер принимаем в любой человеческой записи, канон считает роут
// (normalizePhone), здесь только границы длины и формат кода.
export const DriverRequestPhoneOtp = z.object({
  phone: z.string().trim().min(6).max(24),
})
export type DriverRequestPhoneOtpType = z.infer<typeof DriverRequestPhoneOtp>

export const DriverVerifyPhoneOtp = z.object({
  phone: z.string().trim().min(6).max(24),
  code: z.string().trim().regex(/^\d{4,8}$/, "Код — только цифры"),
})
export type DriverVerifyPhoneOtpType = z.infer<typeof DriverVerifyPhoneOtp>
