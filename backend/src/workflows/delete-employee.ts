import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { removeRemoteLinkStep } from "@medusajs/medusa/core-flows"
import { COMPANY_MODULE } from "../modules/company"
import {
  deleteEmployeeStep,
  DeleteEmployeeStepInput,
} from "./steps/delete-employee"

// Удаление сотрудника из компании: снимаются все его links (в т.ч. с customer),
// сотрудник и его лимиты мягко удаляются. Сам customer ядра не трогаем.
export const deleteEmployeeWorkflow = createWorkflow(
  "delete-employee",
  (input: WorkflowData<DeleteEmployeeStepInput>) => {
    removeRemoteLinkStep({
      [COMPANY_MODULE]: { employee_id: input.id },
    })

    deleteEmployeeStep(input)

    return new WorkflowResponse(input.id)
  }
)
