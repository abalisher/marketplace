import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { DOCUMENTS_MODULE } from "../../../modules/documents"
import DocumentsModuleService from "../../../modules/documents/service"
import {
  AssistantContext,
  AssistantTool,
  OrderDocumentsAttachment,
} from "../types"

// Инструмент ассистента «документы по заказу» (T2.10, замечание владельца:
// «нажал „Нужны документы“, но не получил накладную/АВР» — ассистент говорил
// «документы сформированы», а файлов в диалоге не было). Отдаёт СПИСОК уже
// выпущенных документов заказа со ссылками на PDF и кладёт вставку в ленту.
//
// Документы выпускаются событиями заказа (счёт — при оформлении, накладная —
// при отгрузке; внутренний акт — юрлицам, пока включён FEATURE_COMPANIES),
// логику выпуска здесь НЕ дублируем:
// инструмент только читает. Если чего-то ещё нет, объясняем когда появится —
// это честнее, чем «сформированы» про несуществующий файл.
//
// БЕЗОПАСНОСТЬ (гостевой флоу, как track_order и request_avr): работаем ТОЛЬКО
// с заказом из context.lastOrderId (капабилити-токен на стороне клиента).
// Произвольный номер заказа не принимаем.

const DOCUMENT_TITLES: Record<string, string> = {
  invoice: "Счёт на оплату",
  waybill: "Накладная",
  internal_avr: "Акт выполненных работ (внутренний)",
}

// Когда появится документ, которого ещё нет, — говорим человеческим языком.
const NOT_YET: Record<string, string> = {
  invoice: "счёт выпускается сразу после оформления заказа",
  waybill: "накладная выпускается, когда заказ передают в доставку",
  internal_avr: "внутренний акт выпускается по заказам юридических лиц",
}

type DocumentRow = {
  type: string
  number: string
  file_url: string | null
}

export const getOrderDocumentsTool: AssistantTool = {
  declaration: {
    name: "get_order_documents",
    description:
      "Показать документы по последнему оформленному заказу: счёт, накладную и " +
      "всё остальное, что по нему выпущено, — с номерами и ссылками на PDF. " +
      "Ссылки показываются покупателю карточкой, повторять их текстом не нужно. " +
      "Вызывай, когда покупатель просит документы, счёт, накладную, акт или " +
      "закрывающие документы. Никогда не утверждай, что документ сформирован, " +
      "без вызова этого инструмента.",
    parameters: { type: "OBJECT", properties: {}, required: [] },
  },
  execute: async (
    container: MedusaContainer,
    _args: Record<string, unknown>,
    context: AssistantContext
  ): Promise<Record<string, unknown>> => {
    if (!context.lastOrderId) {
      return {
        error:
          "Нет недавнего заказа. Документы выпускаются по оформленному заказу — " +
          "сначала оформи заказ.",
      }
    }

    const documentsService =
      container.resolve<DocumentsModuleService>(DOCUMENTS_MODULE)
    const rows = (await documentsService.listDocuments(
      {
        order_id: context.lastOrderId,
        is_latest: true,
        visible_to_buyer: true,
      },
      { order: { created_at: "ASC" } }
    )) as unknown as DocumentRow[]

    const documents = rows.map((row) => ({
      doc_type: row.type,
      title: DOCUMENT_TITLES[row.type] ?? row.type,
      number: row.number,
      url: row.file_url,
    }))

    if (!documents.length) {
      return {
        documents: [],
        note:
          "По этому заказу документов пока нет: " +
          `${NOT_YET.invoice}, ${NOT_YET.waybill}. Скажи это покупателю прямо, ` +
          "не обещай отправку файлов.",
      }
    }

    // Номер заказа в шапке карточки — человекочитаемый (внутренние id
    // покупателю не показываем).
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data } = await query.graph({
      entity: "order",
      fields: ["id", "display_id"],
      filters: { id: context.lastOrderId },
    })
    const displayId =
      (data as { display_id?: number | null }[])[0]?.display_id ?? null

    // Read-only вставка «документы» для ленты чата: покупатель открывает PDF по
    // ссылке из карточки.
    const attachment: OrderDocumentsAttachment = {
      type: "documents",
      display_id: displayId,
      documents,
    }
    context.attachments?.push(attachment)

    const missing = ["invoice", "waybill"].filter(
      (type) => !documents.some((doc) => doc.doc_type === type)
    )

    return {
      documents,
      // Что ещё не выпущено — чтобы модель не выдавала желаемое за факт.
      not_issued_yet: missing.map((type) => NOT_YET[type]),
      note:
        "Документы показаны покупателю карточкой со ссылками. Ссылки текстом не " +
        "повторяй и не обещай отправку на почту — почтовой рассылки у платформы нет.",
    }
  },
}
