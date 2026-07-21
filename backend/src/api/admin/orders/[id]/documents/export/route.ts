import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { DOCUMENTS_MODULE } from "../../../../../../modules/documents"
import DocumentsModuleService from "../../../../../../modules/documents/service"

// GET /admin/orders/:id/documents/export — выгрузка исходных данных заказа для
// 1С/бухгалтерии (ТЗ 4.10: платформа даёт экспорт исходных данных, официальные
// ЭСФ/АВР бухгалтер оформляет вручную). Отдаёт снапшоты текущих версий документов
// заказа — они замораживают реквизиты продавца, позиции и суммы (деньгами/
// бонусами раздельно) на момент выпуска. Формат — JSON (1С импортирует JSON/CSV);
// PDF отдаётся отдельно по file_url.
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const documentsService =
    req.scope.resolve<DocumentsModuleService>(DOCUMENTS_MODULE)
  const documents = await documentsService.listDocuments(
    { order_id: req.params.id, is_latest: true },
    { order: { created_at: "ASC" } }
  )

  res.json({
    order_id: req.params.id,
    documents: documents.map((doc) => ({
      type: doc.type,
      number: doc.number,
      version: doc.version,
      total_money: Number(doc.total_money),
      total_bonus: Number(doc.total_bonus),
      currency_code: doc.currency_code,
      snapshot: doc.snapshot,
    })),
  })
}
