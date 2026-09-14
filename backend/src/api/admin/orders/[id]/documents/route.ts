import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { DOCUMENTS_MODULE } from "../../../../../modules/documents"
import DocumentsModuleService from "../../../../../modules/documents/service"
import { issueOrderDocumentWorkflow } from "../../../../../workflows/issue-order-document"
import { serializeDocumentForAdmin } from "../../../../utils/serialize-document"
import { AdminIssueOrderDocumentType } from "../../../documents/validators"

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

// POST /admin/orders/:id/documents — выпустить документ руками (T4.9). До этого
// таска документы выпускались ТОЛЬКО подписчиками на события заказа, и по
// заказу, где событие не сработало (или реквизиты были пусты), продавец ничего
// не мог сделать — блокер 19 фокус-группы T4.6 («счёт не выпущен, кнопки нет»).
// Повторный выпуск = новая ВЕРСИЯ того же документа (номер сохраняется, см.
// issueDocument) — переиздание после правки реквизитов не плодит номера.
// Внутренний АВР — только для заказов юрлиц (для физлица акт не предусмотрен,
// та же логика, что в инструменте ассистента request_avr).
export async function POST(
  req: AuthenticatedMedusaRequest<AdminIssueOrderDocumentType>,
  res: MedusaResponse
) {
  const order_id = req.params.id
  const { type } = req.validatedBody

  if (type === "internal_avr") {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const { data } = await query.graph({
      entity: "order",
      fields: ["id", "company.id"],
      filters: { id: order_id },
    })
    const order = (data as { id: string; company?: { id?: string } | null }[])[0]
    if (!order) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, "Заказ не найден")
    }
    if (!order.company?.id) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Внутренний акт выпускается только по заказам юридических лиц."
      )
    }
  }

  await issueOrderDocumentWorkflow(req.scope).run({
    input: { order_id, type },
    throwOnError: true,
  })

  const documentsService =
    req.scope.resolve<DocumentsModuleService>(DOCUMENTS_MODULE)
  const [document] = await documentsService.listDocuments(
    { order_id, type, is_latest: true },
    { take: 1 }
  )

  res.status(201).json({ document: serializeDocumentForAdmin(document) })
}
