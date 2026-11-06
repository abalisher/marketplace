import { z } from "@medusajs/framework/zod"

// Новый клиент компании: телефон (ключ входа по SMS, нормализуется в роуте),
// ФИО и необязательный адрес доставки.
export const AdminCreateTenantCustomer = z.object({
  phone: z.string().trim().min(5).max(32),
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().max(100).optional(),
  address_1: z.string().trim().max(300).optional(),
  city: z.string().trim().max(100).optional(),
})

export type AdminCreateTenantCustomerType = z.infer<
  typeof AdminCreateTenantCustomer
>
