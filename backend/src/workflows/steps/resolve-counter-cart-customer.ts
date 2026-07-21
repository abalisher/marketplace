import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export type ResolveCounterCartCustomerStepInput = {
  phone?: string | null
  email?: string | null
}

type ResolvedCustomer = { customer_id: string | null; email: string | null }
type Compensation = { created_customer_id: string | null }

// Привязка покупателя к POS-заказу по телефону (гэп 3 сверки partner-раунда):
// продавец у окна вводит телефон → находим существующего покупателя по phone
// (query.graph — сервисный фильтр customer по phone недоступен) либо заводим
// гостевого (без аккаунта). Так POS-заказ перестаёт быть анонимным. Без телефона
// — гостевая продажа (customer_id null). Medusa требует email у customer — при
// отсутствии синтезируем плейсхолдер от телефона (уникален на телефон; повторная
// продажа тому же телефону находит того же покупателя). Компенсация удаляет
// ТОЛЬКО заведённого здесь покупателя.
export const resolveCounterCartCustomerStep = createStep(
  "resolve-counter-cart-customer",
  async (input: ResolveCounterCartCustomerStepInput, { container }) => {
    const phone = input.phone?.trim()
    if (!phone) {
      return new StepResponse<ResolvedCustomer, Compensation>(
        { customer_id: null, email: input.email ?? null },
        { created_customer_id: null }
      )
    }

    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: customers } = await query.graph({
      entity: "customer",
      fields: ["id", "email"],
      filters: { phone },
    })
    const existing = customers?.[0] as
      | { id: string; email?: string | null }
      | undefined
    if (existing) {
      return new StepResponse<ResolvedCustomer, Compensation>(
        { customer_id: existing.id, email: existing.email ?? input.email ?? null },
        { created_customer_id: null }
      )
    }

    const digits = phone.replace(/\D/g, "")
    const email = input.email ?? `pos+${digits}@marketplace.local`
    const customerService = container.resolve(Modules.CUSTOMER)
    const created = await customerService.createCustomers({
      phone,
      email,
      has_account: false,
    })
    return new StepResponse<ResolvedCustomer, Compensation>(
      { customer_id: created.id, email: created.email ?? email },
      { created_customer_id: created.id }
    )
  },
  async (comp, { container }) => {
    if (!comp?.created_customer_id) {
      return
    }
    const customerService = container.resolve(Modules.CUSTOMER)
    await customerService.deleteCustomers(comp.created_customer_id)
  }
)
