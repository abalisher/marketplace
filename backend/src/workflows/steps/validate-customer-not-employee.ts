import { createStep } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

export type ValidateCustomerNotEmployeeStepInput = {
  customer_id: string
}

// Проверяет, что customer существует и ещё не привязан к какой-либо компании
// (link employee ↔ customer — 1:1, один покупатель состоит максимум в одной компании).
export const validateCustomerNotEmployeeStep = createStep(
  "validate-customer-not-employee",
  async (input: ValidateCustomerNotEmployeeStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: customers } = await query.graph({
      entity: "customer",
      fields: ["id", "employee.id"],
      filters: { id: input.customer_id },
    })

    if (!customers.length) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Customer with id ${input.customer_id} not found`
      )
    }

    if (customers[0].employee) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Customer is already an employee of a company"
      )
    }
  }
)
