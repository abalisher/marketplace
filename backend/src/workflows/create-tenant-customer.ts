import {
  createWorkflow,
  transform,
  when,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import {
  createCustomerAddressesWorkflow,
  createCustomersStep,
  createRemoteLinkStep,
  updateCustomersStep,
} from "@medusajs/medusa/core-flows"
import { DEFAULT_CITY } from "../lib/assistant/tools/buyer-identity"
import { TenantCustomerInput } from "../lib/tenants/tenant-customer"
import { TENANT_MODULE } from "../modules/tenant"
import { planTenantCustomerStep } from "./steps/plan-tenant-customer"

export type CreateTenantCustomerWorkflowInput = TenantCustomerInput

// Менеджер компании заводит клиента: учётка покупателя по номеру телефона
// (новая или существующая — правила в lib/tenants/tenant-customer.ts) и связь
// tenant ↔ customer. Клиент потом входит на витрину по SMS на этот номер и
// попадает в эту же учётку с уже заполненными ФИО и адресом.
export const createTenantCustomerWorkflow = createWorkflow(
  "create-tenant-customer",
  (input: WorkflowData<CreateTenantCustomerWorkflowInput>) => {
    const plan = planTenantCustomerStep(input)

    const created = when(
      "tenant-customer-is-new",
      { plan },
      ({ plan }) => !plan.customer_id
    ).then(() => {
      const customers = createCustomersStep(
        transform({ input }, ({ input }) => [
          {
            phone: input.phone,
            first_name: input.first_name.trim(),
            last_name: input.last_name?.trim() || null,
            has_account: true,
          },
        ])
      )
      return transform({ customers }, ({ customers }) => customers[0])
    })

    const customerId = transform(
      { plan, created },
      ({ plan, created }) => (plan.customer_id ?? created?.id) as string
    )

    when(
      "tenant-customer-fill-name",
      { plan },
      ({ plan }) => !!plan.update
    ).then(() => {
      updateCustomersStep(
        transform({ plan }, ({ plan }) => ({
          selector: { id: plan.customer_id as string },
          update: plan.update!,
        }))
      )
    })

    when(
      "tenant-customer-add-address",
      { plan },
      ({ plan }) => plan.add_address
    ).then(() => {
      createCustomerAddressesWorkflow.runAsStep({
        input: transform({ input, customerId }, ({ input, customerId }) => ({
          addresses: [
            {
              customer_id: customerId,
              first_name: input.first_name.trim(),
              last_name: input.last_name?.trim() ?? "",
              phone: input.phone,
              address_1: input.address_1!.trim(),
              city: input.city?.trim() || DEFAULT_CITY,
              country_code: "kz",
              is_default_shipping: true,
            },
          ],
        })),
      })
    })

    when("tenant-customer-link", { plan }, ({ plan }) => plan.link).then(() => {
      createRemoteLinkStep(
        transform({ input, customerId }, ({ input, customerId }) => [
          {
            [TENANT_MODULE]: { tenant_id: input.tenant_id },
            [Modules.CUSTOMER]: { customer_id: customerId },
          },
        ])
      )
    })

    return new WorkflowResponse(
      transform({ customerId }, ({ customerId }) => ({ id: customerId }))
    )
  }
)
