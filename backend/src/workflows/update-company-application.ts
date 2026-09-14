import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  UploadCompanyDocumentsStepInput,
  uploadCompanyDocumentsStep,
} from "./steps/upload-company-documents"
import { updateCompanyApplicationStep } from "./steps/update-company-application"

export type UpdateCompanyApplicationWorkflowInput = {
  company_id: string
  name?: string
  bin?: string
  files?: UploadCompanyDocumentsStepInput["files"]
}

// Правка заявки юрлица её админом: исправить реквизиты и/или догрузить
// учредительные документы. Отклонённая заявка возвращается в очередь модерации
// (см. шаг update-company-application). Файлы грузит тот же шаг, что и при
// первой подаче; его компенсация удаляет их, если правка не прошла проверки.
export const updateCompanyApplicationWorkflow = createWorkflow(
  "update-company-application",
  (input: WorkflowData<UpdateCompanyApplicationWorkflowInput>) => {
    const uploaded = uploadCompanyDocumentsStep({ files: input.files })

    const company = updateCompanyApplicationStep({
      company_id: input.company_id,
      name: input.name,
      bin: input.bin,
      documents: uploaded,
    })

    return new WorkflowResponse(company)
  }
)
