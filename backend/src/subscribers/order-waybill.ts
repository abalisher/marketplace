import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ORDER_STATUS_CHANGED_EVENT } from "../modules/order-lifecycle/events"
import { ORDER_LIFECYCLE_MODULE } from "../modules/order-lifecycle"
import OrderLifecycleModuleService from "../modules/order-lifecycle/service"
import { DOCUMENTS_MODULE } from "../modules/documents"
import DocumentsModuleService from "../modules/documents/service"
import { issueOrderDocumentWorkflow } from "../workflows/issue-order-document"

type StatusChangedPayload = {
  order_id: string
  order_lifecycle_id: string
  from: string
  to: string
  actor_type: string
}

// Автовыпуск накладной по факту передачи товара (ТЗ 4.10): для доставки — при
// входе в доставку (in_delivery, отгрузка); для самовывоза и продажи у окна —
// при выдаче (delivered). Способ получения берём из жизненного цикла заказа.
// Идемпотентность: одна накладная на заказ (текущая версия) — частичные отгрузки
// с отдельной накладной на часть отложены (MVP). Выпуск в подписчике, чтобы сбой
// рендера не откатывал переход статуса.
export default async function issueOrderWaybill({
  event: { data },
  container,
}: SubscriberArgs<StatusChangedPayload>) {
  if (data.to !== "in_delivery" && data.to !== "delivered") {
    return
  }

  const lifecycleService =
    container.resolve<OrderLifecycleModuleService>(ORDER_LIFECYCLE_MODULE)
  const lifecycle = await lifecycleService.retrieveOrderLifecycle(
    data.order_lifecycle_id
  )
  const method = lifecycle.delivery_method

  const shouldIssue =
    (method === "delivery" && data.to === "in_delivery") ||
    (method !== "delivery" && data.to === "delivered")
  if (!shouldIssue) {
    return
  }

  const documentsService =
    container.resolve<DocumentsModuleService>(DOCUMENTS_MODULE)
  const [existing] = await documentsService.listDocuments(
    { order_id: data.order_id, type: "waybill", is_latest: true },
    { take: 1 }
  )
  if (existing) {
    return
  }

  await issueOrderDocumentWorkflow(container).run({
    input: { order_id: data.order_id, type: "waybill" },
  })
}

export const config: SubscriberConfig = {
  event: ORDER_STATUS_CHANGED_EVENT,
}
