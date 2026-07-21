import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { DOCUMENTS_MODULE } from "../../../../../modules/documents"
import DocumentsModuleService from "../../../../../modules/documents/service"
import { requireOwnOrder } from "../../helpers"
import { serializeDocumentForBuyer } from "../../../../utils/serialize-document"

// GET /store/orders/:id/documents — документы-основания заказа для покупателя
// в ЛК (ТЗ 4.10): счёт/накладная/АВР текущих версий, видимые покупателю.
// Скачивание — по возвращаемому file_url (PDF в File Module). Чужой заказ —
// 404 (requireOwnOrder). Выборка — прямым запросом по order_id (link не нужен).
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  await requireOwnOrder(req.scope, req.params.id, req.auth_context.actor_id)

  const documentsService =
    req.scope.resolve<DocumentsModuleService>(DOCUMENTS_MODULE)
  const documents = await documentsService.listDocuments(
    { order_id: req.params.id, is_latest: true, visible_to_buyer: true },
    { order: { created_at: "ASC" } }
  )

  res.json({ documents: documents.map(serializeDocumentForBuyer) })
}
