import { CustomerDTO } from "@medusajs/framework/types"

export type AuthCustomerResponse = {
  id: string
  phone: string | null
  first_name: string | null
  last_name: string | null
  email: string | null
}

// Профиль покупателя в ответе входа: ровно то, что нужно клиенту сразу после
// авторизации (телефон + ФИО). Полный профиль клиент берёт из /store/customers/me.
export const toAuthCustomer = (customer: CustomerDTO): AuthCustomerResponse => ({
  id: customer.id,
  phone: customer.phone ?? null,
  first_name: customer.first_name ?? null,
  last_name: customer.last_name ?? null,
  email: customer.email ?? null,
})
