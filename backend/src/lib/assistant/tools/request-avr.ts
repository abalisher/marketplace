import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { DOCUMENTS_MODULE } from "../../../modules/documents"
import DocumentsModuleService from "../../../modules/documents/service"
import { issueOrderDocumentWorkflow } from "../../../workflows/issue-order-document"
import { AssistantContext, AssistantTool } from "../types"

// Инструмент ассистента «запросить АВР» (Юр-ветка пути покупателя). Внутренний
// АВР — информационный документ платформы для заказов юрлиц (ТЗ 4.10, НЕ
// официальный: официальный АВР/ЭСФ бухгалтер формирует на kgd.gov.kz). Для
// заказов юрлица АВР выпускается автоматически подписчиком order-invoice на
// order.placed; этот инструмент ДОСТАЁТ его и отдаёт ссылку на PDF. Если подписчик
// ещё не успел (ретрай/задержка шины) — выпускает идемпотентно тем же workflow
// (логику НЕ дублируем; тот же guard hasLatest, что в подписчике, чтобы не
// плодить лишнюю версию). Для заказа физлица АВР не предусмотрен — понятная
// подсказка.
//
// БЕЗОПАСНОСТЬ (гостевой флоу, как track_order): работаем ТОЛЬКО с заказом из
// context.lastOrderId (его проставил place_order, клиент держит и шлёт обратно,
// как cart_id — капабилити-токен). Произвольный номер заказа НЕ принимаем.

type OrderCompanyRow = {
  id: string
  company?: { id?: string | null } | null
}

type AvrRow = {
  number: string
  file_url: string | null
  total_money: unknown
  currency_code: string
}

export const requestAvrTool: AssistantTool = {
  declaration: {
    name: "request_avr",
    description:
      "Запросить внутренний АВР (акт) по последнему оформленному заказу. Доступен " +
      "только для заказов юридического лица — информационный документ платформы " +
      "(не официальный акт для бухгалтерии). Возвращает номер документа и ссылку на " +
      "PDF. Вызывай, когда покупатель-юрлицо просит акт по заказу.",
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
          "Нет недавнего заказа. Сначала оформи заказ через place_order, затем запрашивай акт.",
      }
    }

    const orderId = context.lastOrderId
    const documentsService =
      container.resolve<DocumentsModuleService>(DOCUMENTS_MODULE)

    const readAvr = async (): Promise<AvrRow | undefined> => {
      const [doc] = await documentsService.listDocuments(
        { order_id: orderId, type: "internal_avr", is_latest: true },
        { take: 1 }
      )
      return doc as AvrRow | undefined
    }

    let avr = await readAvr()

    if (!avr) {
      // АВР ещё нет: убеждаемся, что заказ юрлица (link company ↔ order), и только
      // тогда выпускаем — для физлица АВР не предусмотрен.
      const query = container.resolve(ContainerRegistrationKeys.QUERY)
      const { data } = await query.graph({
        entity: "order",
        fields: ["id", "company.id"],
        filters: { id: orderId },
      })
      const order = (data as OrderCompanyRow[])[0]

      if (!order) {
        return { error: "Заказ не найден." }
      }
      if (!order.company?.id) {
        return {
          error:
            "Внутренний АВР доступен только для заказов юридического лица. Этот " +
            "заказ оформлен на физлицо — по нему выпускается счёт, акт не требуется.",
        }
      }

      // Юрлицо, но документ ещё не выпущен (подписчик не успел) — выпускаем тем же
      // workflow. Заходим сюда только когда АВР отсутствует, поэтому дубля версии нет.
      await issueOrderDocumentWorkflow(container).run({
        input: { order_id: orderId, type: "internal_avr" },
      })
      avr = await readAvr()
    }

    if (!avr) {
      return {
        error: "Не удалось подготовить акт. Попробуй ещё раз чуть позже.",
      }
    }

    return {
      document: {
        type: "internal_avr",
        number: avr.number,
        file_url: avr.file_url,
        total_money: Number(avr.total_money),
        currency: avr.currency_code,
      },
      note:
        "Это внутренний информационный акт платформы. Официальный АВР для " +
        "бухгалтерии формируется отдельно.",
    }
  },
}
