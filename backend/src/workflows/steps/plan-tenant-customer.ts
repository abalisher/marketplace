import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  planTenantCustomer,
  TenantCustomerInput,
  TenantCustomerPlan,
} from "../../lib/tenants/tenant-customer"

// Ищет учётку покупателя по номеру (так же, как вход по SMS: phone +
// has_account) и связь с компанией; решение — planTenantCustomer. Только
// чтение, компенсировать нечего.
export const planTenantCustomerStep = createStep(
  "plan-tenant-customer",
  async (input: TenantCustomerInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: customers } = await query.graph({
      entity: "customer",
      fields: ["id", "first_name", "last_name", "addresses.id", "tenants.id"],
      filters: { phone: input.phone, has_account: true },
    })
    const customer = customers[0] as
      | {
          id: string
          first_name?: string | null
          last_name?: string | null
          addresses?: unknown[] | null
          // Связь tenant ↔ customer (links/tenant-customer.ts).
          tenants?: ({ id: string } | null)[] | null
        }
      | undefined
    const linked = !!customer?.tenants?.some(
      (tenant) => tenant?.id === input.tenant_id
    )

    const plan: TenantCustomerPlan = planTenantCustomer(
      input,
      customer
        ? {
            id: customer.id,
            first_name: customer.first_name,
            last_name: customer.last_name,
            address_count: customer.addresses?.length ?? 0,
            linked,
          }
        : null
    )
    return new StepResponse(plan)
  }
)
