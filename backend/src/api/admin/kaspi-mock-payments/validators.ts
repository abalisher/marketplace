import { z } from "@medusajs/framework/zod"

// Тело подтверждения мок-оплаты Kaspi из панели. Без поля — «оплатить самый
// свежий неоплаченный счёт» (так же ведёт себя `npm run kaspi:pay` без
// аргумента).
export const AdminKaspiMockPay = z.object({
  payment_session_id: z.string().min(1).optional(),
})
export type AdminKaspiMockPayType = z.infer<typeof AdminKaspiMockPay>
