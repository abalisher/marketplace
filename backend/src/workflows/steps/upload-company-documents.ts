import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import {
  CompanyDocumentMimeType,
  sanitizeDocumentFilename,
} from "../../api/store/companies/document-files"

export type UploadCompanyDocumentsStepInput = {
  files?: {
    name: string
    mime_type: CompanyDocumentMimeType
    content_base64: string
  }[]
}

export type UploadedCompanyDocument = { name: string; url: string }

// Загружает учредительные документы заявки в File Module ядра и возвращает
// список `{ name, url }` для колонки `documents` компании (имя показываем
// покупателю и модератору как есть, ссылку даёт файловый провайдер).
// Работа с File Module — в шаге workflow, а не в сервисе company (правило
// изоляции модулей). Компенсация удаляет загруженные файлы.
export const uploadCompanyDocumentsStep = createStep(
  "upload-company-documents",
  async (input: UploadCompanyDocumentsStepInput, { container }) => {
    const files = input.files ?? []
    if (!files.length) {
      return new StepResponse<UploadedCompanyDocument[], string[]>([], [])
    }

    const fileService = container.resolve(Modules.FILE)

    const uploaded = await fileService.createFiles(
      files.map((file) => ({
        filename: sanitizeDocumentFilename(file.name, file.mime_type),
        mimeType: file.mime_type,
        content: file.content_base64,
        access: "public" as const,
      }))
    )

    const documents = uploaded.map((file, index) => ({
      name: files[index].name,
      url: file.url,
    }))

    return new StepResponse(
      documents,
      uploaded.map((file) => file.id)
    )
  },
  async (fileIds, { container }) => {
    if (!fileIds?.length) {
      return
    }
    const fileService = container.resolve(Modules.FILE)
    await fileService.deleteFiles(fileIds)
  }
)
