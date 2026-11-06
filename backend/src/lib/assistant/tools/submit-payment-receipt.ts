import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { loadBuyerOrderPayment } from "../../payments/order-payment-buyer-view"
import { submitPaymentReceiptWorkflow } from "../../../workflows/payments/submit-payment-receipt"
import { AssistantContext, AssistantTool } from "../types"
import { requireLogin } from "./buyer-identity"

// Инструмент ассистента «чек об оплате»: покупатель прислал в чат снимок или PDF
// чека Kaspi по переводу или погашению долга — чек уходит в проверку
// (submit-payment-receipt: распознавание, сверка суммы, получателя, даты,
// номера квитанции, повторов) и ждёт решения продавца.
//
// Заказ — ТОЛЬКО context.lastOrderId (как у track_order: номер заказа
// угадываем, внутренний id — нет) и только свой: чек к чужому заказу не
// прикладывается. Файл — первое вложение этого хода.

const RECEIPT_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
])

export const submitPaymentReceiptTool: AssistantTool = {
  declaration: {
    name: "submit_payment_receipt",
    description:
      "Прикрепить чек об оплате к заказу покупателя: вызывай, когда покупатель " +
      "прислал в этом сообщении снимок или PDF чека Kaspi за перевод или " +
      "погашение долга. Чек проверяется сразу (сумма, получатель, дата, номер " +
      "квитанции, повторы) и уходит продавцу на подтверждение. Возвращает, " +
      "принят ли чек на проверку или почему его не примут.",
    parameters: { type: "OBJECT", properties: {}, required: [] },
  },
  execute: async (
    container: MedusaContainer,
    _args: Record<string, unknown>,
    context: AssistantContext
  ): Promise<Record<string, unknown>> => {
    if (!context.customerId) {
      return requireLogin(
        context,
        "Чек прикладывается к заказу вошедшего покупателя. Кнопка входа уже " +
          "показана в чате — попроси его войти."
      )
    }
    const file = (context.files ?? []).find((f) => RECEIPT_MIME.has(f.mimeType))
    if (!file) {
      return {
        error:
          "В этом сообщении нет чека. Попроси прислать снимок экрана или PDF " +
          "чека из приложения Kaspi сюда, в чат.",
      }
    }
    if (!context.lastOrderId) {
      return { error: "Не нашёл заказа, к которому приложить чек." }
    }

    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data } = await query.graph({
      entity: "order",
      fields: ["id", "customer_id", "display_id", "order_lifecycle.number"],
      filters: { id: context.lastOrderId },
    })
    const order = data[0] as unknown as
      | {
          id: string
          customer_id?: string | null
          display_id?: number
          order_lifecycle?: { number?: string | null } | null
        }
      | undefined
    if (!order || order.customer_id !== context.customerId) {
      return { error: "Не нашёл заказа, к которому приложить чек." }
    }

    try {
      const { result } = await submitPaymentReceiptWorkflow(container).run({
        input: {
          order_id: order.id,
          file: { name: null, mime_type: file.mimeType, data: file.data },
        },
        throwOnError: true,
      })
      // Под ответом — карточка оплаты заказа: статус чека и дальше будет виден.
      context.attachments?.push({
        type: "order_payment",
        order_id: order.id,
        display_id: order.display_id ?? null,
        order_number: order.order_lifecycle?.number ?? null,
      })
      const payment = await loadBuyerOrderPayment(container, order.id)
      const receipt = payment?.receipts.find((r) => r.id === result.receipt_id)
      return {
        order_number: order.order_lifecycle?.number ?? null,
        order_display_id: order.display_id ?? null,
        receipt: receipt
          ? {
              accepted_for_review: receipt.status === "pending",
              problems: receipt.problems,
              amount: receipt.amount,
            }
          : null,
        note:
          "Чек ждёт подтверждения продавцом: «оплачено» не говори, пока продавец " +
          "не засчитал. Есть problems — назови их и попроси проверить перевод.",
      }
    } catch (e) {
      if (e instanceof MedusaError && e.type === MedusaError.Types.NOT_ALLOWED) {
        return { error: e.message }
      }
      throw e
    }
  },
}
