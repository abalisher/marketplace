import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { DOCUMENT_ISSUED_EVENT } from "../modules/documents/events"

type DocumentIssuedPayload = {
  document_id: string
  order_id: string
  type: string
  number: string
  version: number
}

// Уведомление покупателя о новом документе по заказу (ТЗ 4.10: документы видны
// в ЛК обеих сторон). Пока notification-провайдера (push/email) нет — заглушка
// логирует событие (идиома order-status-changed/bonus-accrued). Событийный
// контракт document.issued (document/order/type/number/version) останется
// прежним при появлении реальных уведомлений.
export default async function notifyDocumentIssued({
  event: { data },
  container,
}: SubscriberArgs<DocumentIssuedPayload>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  logger.info(
    `[document-notification stub] order ${data.order_id}: issued ${data.type} ` +
      `${data.number} v${data.version} (${data.document_id}) — notify buyer & seller`
  )
}

export const config: SubscriberConfig = {
  event: DOCUMENT_ISSUED_EVENT,
}
