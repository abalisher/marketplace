import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { DOCUMENTS_MODULE } from "../../../../../modules/documents"
import DocumentsModuleService from "../../../../../modules/documents/service"
import { serializeDocumentForAdmin } from "../../../../utils/serialize-document"

// GET /admin/orders/:id/documents — все документы заказа для админа/продавца
// (страница заказа, подзадача 4): все типы и ВСЕ версии (история), новые
// сверху. Namespace /documents под ядровым :id не конфликтует с ядровыми
// :id/{cancel,complete} (как и /lifecycle). Экспорт исходных данных для 1С —
// отдельный роут /documents/export.
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const documentsService =
    req.scope.resolve<DocumentsModuleService>(DOCUMENTS_MODULE)
  const documents = await documentsService.listDocuments(
    { order_id: req.params.id },
    { order: { created_at: "DESC" } }
  )

  res.json({ documents: documents.map(serializeDocumentForAdmin) })
}
