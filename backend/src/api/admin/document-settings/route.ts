import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { DOCUMENTS_MODULE } from "../../../modules/documents"
import DocumentsModuleService from "../../../modules/documents/service"
import { updateDocumentSettingsWorkflow } from "../../../workflows/update-document-settings"
import { AdminUpdateDocumentSettingsType } from "./validators"

// Единый вид реквизитов наружу (без служебных полей mikro-orm).
const serializeSettings = (settings: {
  id: string
  seller_name: string
  seller_bin: string | null
  seller_address: string | null
  seller_phone: string | null
  seller_email: string | null
  seller_bank_name: string | null
  seller_bank_bik: string | null
  seller_iban: string | null
  footer_note: string | null
}) => ({
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
})

// GET /admin/document-settings — реквизиты продавца (singleton, создаётся лениво
// с дефолтами). Admin-конфиг только для веб-админки — контракт/Dart не трогаем
// (прецедент bonus-config).
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const documentsService =
    req.scope.resolve<DocumentsModuleService>(DOCUMENTS_MODULE)
  const settings = await documentsService.getOrCreateSettings()
  res.json({ document_settings: serializeSettings(settings) })
}

// POST /admin/document-settings — частичная правка реквизитов.
export async function POST(
  req: AuthenticatedMedusaRequest<AdminUpdateDocumentSettingsType>,
  res: MedusaResponse
) {
  const { result } = await updateDocumentSettingsWorkflow(req.scope).run({
    input: req.validatedBody,
    throwOnError: true,
  })
  res.json({ document_settings: serializeSettings(result) })
}
