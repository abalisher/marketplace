import { z } from "@medusajs/framework/zod"

// Вход покупателя по номеру телефона (T10.7). Номер принимаем в любом виде,
// который человек набирает («8 701…», «+7 (701)…»), канон считает роут —
// normalizePhone; здесь только границы длины и наличие.
export const StoreRequestPhoneOtp = z.object({
  phone: z.string().trim().min(6).max(24),
})
export type StoreRequestPhoneOtpType = z.infer<typeof StoreRequestPhoneOtp>

export const StoreVerifyPhoneOtp = z.object({
  phone: z.string().trim().min(6).max(24),
  code: z.string().trim().regex(/^\d{4,8}$/, "Код — только цифры"),
})
export type StoreVerifyPhoneOtpType = z.infer<typeof StoreVerifyPhoneOtp>
