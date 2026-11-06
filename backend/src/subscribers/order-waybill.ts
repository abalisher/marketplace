import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ORDER_STATUS_CHANGED_EVENT } from "../modules/order-lifecycle/events"
import { ORDER_LIFECYCLE_MODULE } from "../modules/order-lifecycle"
import OrderLifecycleModuleService from "../modules/order-lifecycle/service"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { DOCUMENTS_MODULE } from "../modules/documents"
import DocumentsModuleService from "../modules/documents/service"
import {
  missingRequisites,
  missingRequisitesMessage,
} from "../modules/documents/requisites"
import { loadSellerSettings } from "../lib/tenants/requisites"
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

  // Как в order-invoice: с неполными реквизитами документ не выпускается (T4.9).
  const { data: orders } = await container
    .resolve(ContainerRegistrationKeys.QUERY)
    .graph({
      entity: "order",
      fields: ["id", "sales_channel_id"],
      filters: { id: data.order_id },
    })
  const missing = missingRequisites(
    await loadSellerSettings(
      container,
      (orders?.[0] as { sales_channel_id?: string | null } | undefined)
        ?.sales_channel_id
    )
  )
  if (missing.length > 0) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    logger.warn(
      `[order-waybill] заказ ${data.order_id}: накладная не выпущена. ${missingRequisitesMessage(missing)}`
    )
    return
  }

  await issueOrderDocumentWorkflow(container).run({
    input: { order_id: data.order_id, type: "waybill" },
  })
}

export const config: SubscriberConfig = {
  event: ORDER_STATUS_CHANGED_EVENT,
}
