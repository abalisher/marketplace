import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { DOCUMENTS_MODULE } from "../../modules/documents"
import DocumentsModuleService from "../../modules/documents/service"
import { DocumentType } from "../../modules/documents/models/constants"
import { DocumentSnapshot } from "../utils/render-document-pdf"

export type BuildOrderDocumentSnapshotStepInput = {
  order_id: string
  type: DocumentType
}

// Собирает замороженный снапшот заказа для выпуска документа: реквизиты продавца
// (singleton documents) + позиции и суммы заказа (сервис order — query.graph не
// отдаёт BigNumber-количества/цены надёжно, см. get-order-items). Суммы деньгами
// и бонусами — раздельно (ТЗ 4.10): total_money = order.total (уже за вычетом
// бонусных кредитных линий), total_bonus = сумма кредитных линий бонуса.
export const buildOrderDocumentSnapshotStep = createStep(
  "build-order-document-snapshot",
  async (input: BuildOrderDocumentSnapshotStepInput, { container }) => {
    const orderService = container.resolve(Modules.ORDER)
    const documentsService =
      container.resolve<DocumentsModuleService>(DOCUMENTS_MODULE)

    const order = await orderService.retrieveOrder(input.order_id, {
      relations: ["items", "credit_lines"],
    })
    const settings = await documentsService.getOrCreateSettings()

    const items = (order.items ?? []).map((item) => {
      const quantity = Number(item.quantity)
      const unitPrice = Number(item.unit_price)
      const total =
        item.total != null ? Number(item.total) : unitPrice * quantity
      return {
        title: item.title ?? item.product_title ?? "—",
        quantity,
        unit_price: unitPrice,
        total,
      }
    })

    const currency_code = order.currency_code ?? "kzt"
    // Бонусные кредитные линии заказа (модуль bonus добавляет reference
    // "bonus_account"); сумма — абсолютная (линия уменьшает total).
    const total_bonus = (order.credit_lines ?? []).reduce(
      (sum, cl) => sum + Math.abs(Number(cl.amount ?? 0)),
      0
    )
    const total_money =
      order.total != null
        ? Number(order.total)
        : items.reduce((sum, i) => sum + i.total, 0)

    const snapshot: DocumentSnapshot = {
      issued_at: new Date().toISOString(),
      seller: {
        name: settings.seller_name,
        bin: settings.seller_bin,
        address: settings.seller_address,
        phone: settings.seller_phone,
        email: settings.seller_email,
        bank_name: settings.seller_bank_name,
        bank_bik: settings.seller_bank_bik,
        iban: settings.seller_iban,
      },
      footer_note: settings.footer_note,
      buyer: { email: order.email ?? null },
      order: {
        display_id: order.display_id ?? null,
        currency_code,
        created_at: order.created_at
          ? new Date(order.created_at).toISOString()
          : null,
      },
      items,
      totals: { money: total_money, bonus: total_bonus, currency_code },
    }

    return new StepResponse({
      snapshot,
      total_money,
      total_bonus,
      currency_code,
    })
  }
)
