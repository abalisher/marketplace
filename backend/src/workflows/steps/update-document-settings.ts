import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { DOCUMENTS_MODULE } from "../../modules/documents"
import DocumentsModuleService from "../../modules/documents/service"

export type UpdateDocumentSettingsStepInput = {
  seller_name?: string
  seller_bin?: string | null
  seller_address?: string | null
  seller_phone?: string | null
  seller_email?: string | null
  seller_bank_name?: string | null
  seller_bank_bik?: string | null
  seller_iban?: string | null
  footer_note?: string | null
}

// Правка singleton-реквизитов продавца для рендера документов (строка создаётся
// лениво с дефолтами через getOrCreateSettings). Компенсация — откат изменённых
// полей к значениям на момент шага (идиома update-bonus-config).
export const updateDocumentSettingsStep = createStep(
  "update-document-settings",
  async (input: UpdateDocumentSettingsStepInput, { container }) => {
    const documentsService =
      container.resolve<DocumentsModuleService>(DOCUMENTS_MODULE)
    const settings = await documentsService.getOrCreateSettings()

    const previous = {
      id: settings.id,
      seller_name: settings.seller_name,
      seller_bin: settings.seller_bin,
      seller_address: settings.seller_address,
      seller_phone: settings.seller_phone,
      seller_email: settings.seller_email,
      seller_bank_name: settings.seller_bank_name,
      seller_bank_bik: settings.seller_bank_bik,
      seller_iban: settings.seller_iban,
      footer_note: settings.footer_note,
    }
    const updated = await documentsService.updateDocumentSettings({
      id: settings.id,
      ...input,
    })

    return new StepResponse(updated, previous)
  },
  async (previous, { container }) => {
    if (!previous) {
      return
    }
    const documentsService =
      container.resolve<DocumentsModuleService>(DOCUMENTS_MODULE)
    await documentsService.updateDocumentSettings(previous)
  }
)
