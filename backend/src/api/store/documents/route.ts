import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { DOCUMENTS_MODULE } from "../../../modules/documents"
import DocumentsModuleService from "../../../modules/documents/service"
import { serializeDocumentForBuyer } from "../../utils/serialize-document"

// Строка документа как её отдаёт сервис модуля: поля сериализатора + заказ.
type DocumentRow = Parameters<typeof serializeDocumentForBuyer>[0] & {
  order_id: string
}

// GET /store/documents — все документы покупателя одним списком (кабинет,
// T10.6): счета, накладные и АВР по ВСЕМ его заказам, текущих версий и видимые
// покупателю. Отдельный роут от /store/orders/:id/documents: в кабинете есть
// раздел «Документы», где не надо сначала вспоминать заказ. Каждая строка несёт
// заказ (id + человекочитаемый номер), чтобы из списка можно было уйти в карточку.
// Скачивание — по file_url. Заказы читаем строго по customer_id: чужой документ
// в выборку не попадает.
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "display_id", "order_lifecycle.number"],
    filters: { customer_id: req.auth_context.actor_id },
  })

  if (!orders.length) {
    res.json({ documents: [] })
    return
  }

  const documentsService =
    req.scope.resolve<DocumentsModuleService>(DOCUMENTS_MODULE)
  const documents = (await documentsService.listDocuments(
    {
      order_id: orders.map((order) => order.id),
      is_latest: true,
      visible_to_buyer: true,
    },
    { order: { created_at: "DESC" } }
  )) as DocumentRow[]

  // display_id заказа — число; query.graph типизирует поле широко, поэтому
  // приводим явно: в кабинете это «Заказ №24».
  const displayIds = new Map<string, number | null>(
    orders.map((order) => [
      order.id,
      order.display_id === null || order.display_id === undefined
        ? null
        : Number(order.display_id),
    ])
  )

  const numbers = new Map<string, string | null>(
    orders.map((order) => [
      order.id,
      (order as { order_lifecycle?: { number?: string | null } | null })
        .order_lifecycle?.number ?? null,
    ])
  )

  res.json({
    documents: documents.map((doc) => ({
      ...serializeDocumentForBuyer(doc),
      order: {
        id: doc.order_id,
        display_id: displayIds.get(doc.order_id) ?? null,
        number: numbers.get(doc.order_id) ?? null,
      },
    })),
  })
}
