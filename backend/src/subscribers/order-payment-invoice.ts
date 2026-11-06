import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { DOCUMENTS_MODULE } from "../modules/documents"
import DocumentsModuleService from "../modules/documents/service"
import { issueOrderDocumentWorkflow } from "../workflows/issue-order-document"
import {
  ORDER_PAYMENT_DEBT_APPROVED_EVENT,
  ORDER_PAYMENT_METHOD_CHANGED_EVENT,
  ORDER_PAYMENT_PAID_EVENT,
} from "../lib/payments/events"

const REASON: Record<string, string> = {
  [ORDER_PAYMENT_METHOD_CHANGED_EVENT]: "Покупатель сменил способ оплаты",
  [ORDER_PAYMENT_DEBT_APPROVED_EVENT]: "Продавец одобрил оплату в долг",
  [ORDER_PAYMENT_PAID_EVENT]: "Заказ оплачен",
}

// Счёт перевыпускается новой версией (тот же номер, version+1), когда
// напечатанное в нём устарело: покупатель сменил способ (как платить), продавец
// одобрил долг (срок возврата), заказ оплачен целиком (штамп «Оплачено»).
// Счёта ещё не было (реквизиты продавца не заполнены) — нечего перевыпускать.
export default async function reissueInvoiceOnPaymentChange({
  event: { data, name },
  container,
}: SubscriberArgs<{ order_id: string }>) {
  const documents = container.resolve<DocumentsModuleService>(DOCUMENTS_MODULE)
  const [latest] = await documents.listDocuments(
    { order_id: data.order_id, type: "invoice", is_latest: true },
    { take: 1 }
  )
  if (!latest) {
    return
  }
  try {
    await issueOrderDocumentWorkflow(container).run({
      input: {
        order_id: data.order_id,
        type: "invoice",
        note: REASON[name] ?? null,
      },
    })
  } catch (e) {
    container
      .resolve(ContainerRegistrationKeys.LOGGER)
      .error(`[payments] invoice reissue for order ${data.order_id} failed: ${(e as Error).message}`)
  }
}

export const config: SubscriberConfig = {
  event: [
    ORDER_PAYMENT_METHOD_CHANGED_EVENT,
    ORDER_PAYMENT_DEBT_APPROVED_EVENT,
    ORDER_PAYMENT_PAID_EVENT,
  ],
}
