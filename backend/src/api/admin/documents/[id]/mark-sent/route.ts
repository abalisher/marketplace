import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { markDocumentSentWorkflow } from "../../../../../workflows/mark-document-sent"
import { serializeDocumentForAdmin } from "../../../../utils/serialize-document"

// POST /admin/documents/:id/mark-sent — отметить документ отправленным
// покупателю (T4.9). Канал отправки не выбран (развилка №0: push/email/SMS),
// поэтому отметку ставит человек: управляющему нужно видеть, ушёл ли счёт
// клиенту, а покупателю документ и так виден в ЛК и в чате.
export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { result } = await markDocumentSentWorkflow(req.scope).run({
    input: { document_id: req.params.id },
    throwOnError: true,
  })

  res.json({
    document: serializeDocumentForAdmin(
      result as unknown as Parameters<typeof serializeDocumentForAdmin>[0]
    ),
  })
}
