import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  updateDriverProfileStep,
  UpdateDriverProfileStepInput,
} from "./steps/update-driver-profile"

export type UpdateDriverProfileWorkflowInput = UpdateDriverProfileStepInput

// Водитель заполняет/правит профиль о себе. Один шаг с компенсацией —
// workflow ради единообразия «роут → workflow».
export const updateDriverProfileWorkflow = createWorkflow(
  "update-driver-profile",
  (input: WorkflowData<UpdateDriverProfileWorkflowInput>) => {
    const driver = updateDriverProfileStep(input)
    return new WorkflowResponse(driver)
  }
)
