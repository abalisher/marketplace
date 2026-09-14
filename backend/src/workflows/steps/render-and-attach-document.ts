import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { DOCUMENTS_MODULE } from "../../modules/documents"
import DocumentsModuleService from "../../modules/documents/service"
import { DocumentType } from "../../modules/documents/models/constants"
import { renderDocumentPdf } from "../utils/render-document-pdf"
import { DocumentSnapshot } from "../utils/documents/document-snapshot"

export type RenderAndAttachDocumentStepInput = {
  document_id: string
  type: DocumentType
  number: string
  version: number
  snapshot: DocumentSnapshot
}

// Рендерит PDF (pdfkit + встроенный кириллический шрифт), загружает его в File
// Module ядра и привязывает file_id/file_url к строке документа. Рендер и работа
// с File Module — в workflow-шаге, не в сервисе documents (правило изоляции: File
// — другой модуль). Компенсация удаляет загруженный файл и снимает ссылку —
// строку документа удалит компенсация предыдущего шага (issue-order-document).
export const renderAndAttachDocumentStep = createStep(
  "render-and-attach-document",
  async (input: RenderAndAttachDocumentStepInput, { container }) => {
    const fileService = container.resolve(Modules.FILE)
    const documentsService =
      container.resolve<DocumentsModuleService>(DOCUMENTS_MODULE)

    const buffer = await renderDocumentPdf({
      type: input.type,
      number: input.number,
      version: input.version,
      snapshot: input.snapshot,
    })

    const [file] = await fileService.createFiles([
      {
        filename: `${input.type}-${input.number}-v${input.version}.pdf`,
        mimeType: "application/pdf",
        content: buffer.toString("base64"),
        access: "public",
      },
    ])

    await documentsService.attachRenderedFile({
      document_id: input.document_id,
      file_id: file.id,
      file_url: file.url,
    })

    return new StepResponse(
      { file_id: file.id, file_url: file.url },
      { file_id: file.id, document_id: input.document_id }
    )
  },
  async (attached, { container }) => {
    if (!attached) {
      return
    }
    const fileService = container.resolve(Modules.FILE)
    const documentsService =
      container.resolve<DocumentsModuleService>(DOCUMENTS_MODULE)
    await documentsService.updateDocuments({
      id: attached.document_id,
      file_id: null,
      file_url: null,
    })
    await fileService.deleteFiles(attached.file_id)
  }
)
