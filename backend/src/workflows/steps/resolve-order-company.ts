import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export type ResolveOrderCompanyStepInput = {
  order_id: string
}

// Определяет компанию, от имени которой оформлен заказ: заказ → customer →
// employee (link) → company. Возвращает company_id или null (частное лицо).
// Линковку order ↔ company делает workflow (createRemoteLinkStep) — для лимитов
// и скоринга компании в будущих задачах.
export const resolveOrderCompanyStep = createStep(
  "resolve-order-company",
  async (input: ResolveOrderCompanyStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: orders } = await query.graph({
      entity: "order",
      fields: ["id", "customer.employee.company.id"],
      filters: { id: input.order_id },
    })

    // customer.employee.company — цепочка link-полей (типы в .medusa/types);
    // читаем через явную форму строки, чтобы tsc не зависел от генерации.
    const companyId: string | null =
      (
        orders[0] as {
          customer?: { employee?: { company?: { id?: string } } }
        }
      )?.customer?.employee?.company?.id ?? null

    return new StepResponse({ company_id: companyId })
  }
)
