import {
  createWorkflow,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "@medusajs/medusa/core-flows"
import { DOCUMENT_ISSUED_EVENT } from "../modules/documents/events"
import { DocumentType } from "../modules/documents/models/constants"
import { buildOrderDocumentSnapshotStep } from "./steps/build-order-document-snapshot"
import { issueOrderDocumentStep } from "./steps/issue-order-document"
import { renderAndAttachDocumentStep } from "./steps/render-and-attach-document"

export type IssueOrderDocumentWorkflowInput = {
  order_id: string
  type: DocumentType
  visible_to_buyer?: boolean
  visible_to_seller?: boolean
  note?: string | null
}

// Выпуск документа-основания по заказу (счёт/накладная/внутренний АВР):
// снапшот заказа → строка документа с номером и версией → рендер PDF +
// загрузка в File Module + привязка → событие document.issued. Вызывается из
// подписчиков на события заказа (order.placed → счёт; order_lifecycle.status_
// changed → накладная), а не внутри place-order/ship-order — сбой рендера НЕ
// должен откатывать заказ (документ — вторичный артефакт). См.
// docs/modules/documents.md.
export const issueOrderDocumentWorkflow = createWorkflow(
  "issue-order-document",
  (input: WorkflowData<IssueOrderDocumentWorkflowInput>) => {
    // Полнота реквизитов продавца проверяется В ШАГЕ снапшота (он и так читает
    // реквизиты): отдельный шаг-guard без связи по данным движок волен
    // выполнить параллельно, и его отказ не останавливал выпуск (T4.9).
    const built = buildOrderDocumentSnapshotStep({
      order_id: input.order_id,
      type: input.type,
    })

    const document = issueOrderDocumentStep(
      transform({ input, built }, (d) => ({
        order_id: d.input.order_id,
        type: d.input.type,
        snapshot: d.built.snapshot as unknown as Record<string, unknown>,
        total_money: d.built.total_money,
        total_bonus: d.built.total_bonus,
        currency_code: d.built.currency_code,
        visible_to_buyer: d.input.visible_to_buyer,
        visible_to_seller: d.input.visible_to_seller,
        note: d.input.note,
      }))
    )

    const file = renderAndAttachDocumentStep(
      transform({ document, built }, (d) => ({
        document_id: d.document.document_id,
        type: d.document.type,
        number: d.document.number,
        version: d.document.version,
        snapshot: d.built.snapshot,
      }))
    )

    emitEventStep({
      eventName: DOCUMENT_ISSUED_EVENT,
      data: transform({ input, document }, (d) => ({
        document_id: d.document.document_id,
        order_id: d.input.order_id,
        type: d.document.type,
        number: d.document.number,
        version: d.document.version,
      })),
    })

    return new WorkflowResponse({ document, file })
  }
)
