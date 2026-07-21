import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  updateDocumentSettingsStep,
  UpdateDocumentSettingsStepInput,
} from "./steps/update-document-settings"

export type UpdateDocumentSettingsWorkflowInput =
  UpdateDocumentSettingsStepInput

// Правка реквизитов продавца из админки (Settings → Document requisites).
// Один шаг с компенсацией — workflow ради единообразия «роут → workflow»
// (бизнес-логики в роутах нет), идиома update-bonus-config.
export const updateDocumentSettingsWorkflow = createWorkflow(
  "update-document-settings",
  (input: WorkflowData<UpdateDocumentSettingsWorkflowInput>) => {
    const settings = updateDocumentSettingsStep(input)
    return new WorkflowResponse(settings)
  }
)
