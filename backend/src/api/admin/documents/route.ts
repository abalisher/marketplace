import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { DOCUMENTS_MODULE } from "../../../modules/documents"
import DocumentsModuleService from "../../../modules/documents/service"
import { missingRequisites } from "../../../modules/documents/requisites"
import { serializeDocumentForAdmin } from "../../utils/serialize-document"
import { AdminGetDocumentsParamsType } from "./validators"
import { countByType, findOrderIdsBySearch, loadRegistryOrders } from "./rows"

// Строка документа как её отдаёт сервис модуля (нужны только поля сериализатора
// плюс заказ, к которому документ относится).
type DocumentRow = Parameters<typeof serializeDocumentForAdmin>[0] & {
  order_id: string
}

// GET /admin/documents — реестр документов платформы (T4.9, блокер контроля из
// фокус-группы T4.6: «реестра документов нет»). Отдаёт ТЕКУЩИЕ версии со всем,
// что рисует строка экрана: тип, номер, заказ с номером и плательщиком, сумма,
// ссылка на PDF, отметка об отправке покупателю. Плюс счётчики по типам для
// чипов-фильтров и список незаполненных реквизитов — с ними выпуск запрещён, и
// экран должен назвать причину, а не молчать.
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { type, sent, q, limit, offset } =
    req.validatedQuery as unknown as AdminGetDocumentsParamsType

  const documentsService =
    req.scope.resolve<DocumentsModuleService>(DOCUMENTS_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const settings = await documentsService.getOrCreateSettings()

  // База для счётчиков чипов — все фильтры, кроме самого типа.
  const baseFilters: Record<string, unknown> = { is_latest: true }
  if (sent === "sent") {
    baseFilters.sent_to_buyer_at = { $ne: null }
  } else if (sent === "unsent") {
    baseFilters.sent_to_buyer_at = null
  }

  if (q) {
    // Человек ищет и «INV-2026-000001», и «#24»: номера заказов живут в другом
    // модуле (link'а у документа нет), поэтому дочитываем их id отдельно.
    const orderIds = await findOrderIdsBySearch(query, q)
    const or: Record<string, unknown>[] = [{ number: { $ilike: `%${q}%` } }]
    if (orderIds.length) {
      or.push({ order_id: orderIds })
    }
    baseFilters.$or = or
  }

  const filters: Record<string, unknown> = { ...baseFilters }
  if (type?.length) {
    filters.type = type
  }

  const [[documents, count], counts] = await Promise.all([
    documentsService.listAndCountDocuments(filters, {
      skip: offset,
      take: limit,
      order: { created_at: "DESC" },
    }) as Promise<[DocumentRow[], number]>,
    countByType(documentsService, baseFilters),
  ])

  const orders = await loadRegistryOrders(
    query,
    documents.map((doc) => doc.order_id)
  )

  res.json({
    documents: documents.map((doc) => ({
      ...serializeDocumentForAdmin(doc),
      order: orders.get(doc.order_id) ?? null,
    })),
    counts,
    requisites_missing: missingRequisites(settings),
    count,
    offset,
    limit,
  })
}
