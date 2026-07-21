import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { DOCUMENTS_MODULE } from "../modules/documents"
import DocumentsModuleService from "../modules/documents/service"
import { DocumentType } from "../modules/documents/models/constants"
import { issueOrderDocumentWorkflow } from "../workflows/issue-order-document"

// Автовыпуск счёта на оплату сразу после оформления заказа (ТЗ 4.10). Ядро
// эмитит order.placed из completeCartWorkflow — покрывает и обычное оформление
// (place-order), и продажу у окна (place-counter-order). Для заказов юрлиц
// дополнительно выпускается внутренний АВР (информационный документ платформы).
// Документы — вторичный артефакт: их выпуск в подписчике, а не в workflow заказа,
// чтобы сбой рендера не откатывал заказ. Идемпотентность: пропускаем, если
// текущая версия документа этого типа по заказу уже есть (повторная доставка
// события / ретрай).
export default async function issueOrderInvoice({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const order_id = data.id
  const documentsService =
    container.resolve<DocumentsModuleService>(DOCUMENTS_MODULE)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const hasLatest = async (type: DocumentType) => {
    const [existing] = await documentsService.listDocuments(
      { order_id, type, is_latest: true },
      { take: 1 }
    )
    return !!existing
  }

  if (!(await hasLatest("invoice"))) {
    await issueOrderDocumentWorkflow(container).run({
      input: { order_id, type: "invoice" },
    })
  }

  // Заказ юрлица (link company ↔ order) — внутренний АВР платформы.
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "company.id"],
    filters: { id: order_id },
  })
  const companyId = (orders?.[0] as { company?: { id?: string } })?.company?.id
  if (companyId && !(await hasLatest("internal_avr"))) {
    await issueOrderDocumentWorkflow(container).run({
      input: { order_id, type: "internal_avr" },
    })
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
