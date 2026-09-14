import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import { DOCUMENTS_MODULE } from "../../modules/documents"
import DocumentsModuleService from "../../modules/documents/service"
import {
  missingRequisites,
  missingRequisitesMessage,
} from "../../modules/documents/requisites"
import { DocumentType } from "../../modules/documents/models/constants"
import { DocumentSnapshot } from "../utils/documents/document-snapshot"

export type BuildOrderDocumentSnapshotStepInput = {
  order_id: string
  type: DocumentType
}

type OrderGraphRow = {
  id: string
  company?: { id?: string | null; name?: string | null; bin?: string | null } | null
  payment_collections?: {
    status?: string | null
    payments?: {
      provider_id?: string | null
      captured_at?: string | Date | null
    }[]
  }[]
}

type ProductCardRow = {
  id: string
  product_card?: { unit?: string | null } | null
}

// Собирает замороженный снапшот заказа для выпуска документа: реквизиты продавца
// (singleton documents) + реквизиты покупателя + позиции и суммы заказа (сервис
// order — query.graph не отдаёт BigNumber-количества/цены надёжно, см.
// get-order-items). Суммы деньгами и бонусами — раздельно (ТЗ 4.10):
// total_money = order.total (уже за вычетом бонусных кредитных линий),
// total_bonus = сумма кредитных линий бонуса.
export const buildOrderDocumentSnapshotStep = createStep(
  "build-order-document-snapshot",
  async (input: BuildOrderDocumentSnapshotStepInput, { container }) => {
    const orderService = container.resolve(Modules.ORDER)
    const documentsService =
      container.resolve<DocumentsModuleService>(DOCUMENTS_MODULE)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const order = await orderService.retrieveOrder(input.order_id, {
      relations: [
        "items",
        "credit_lines",
        "shipping_methods",
        "billing_address",
        "shipping_address",
      ],
    })
    const settings = await documentsService.getOrCreateSettings()

    // Документ с пустыми реквизитами продавца не выпускается вовсе (T4.9,
    // блокер 20 фокус-группы T4.6): счёт без БИН, адреса и банка бухгалтерия
    // покупателя не примет. Проверка живёт здесь, а не отдельным шагом: шаг без
    // связи по данным движок волен выполнить параллельно, и его отказ не
    // останавливал бы выпуск. Подписчики автовыпуска проверяют то же самое ДО
    // запуска workflow и тихо пропускают заказ с предупреждением в лог.
    const missing = missingRequisites(settings)
    if (missing.length > 0) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        missingRequisitesMessage(missing)
      )
    }

    // Покупатель: для заказа юрлица в документе должны стоять название и БИН
    // компании (без них счёт не примет бухгалтерия — блокер 20 T4.6), для
    // физлица — имя из адреса. Компания привязана к заказу module link'ом.
    // Тем же запросом берём оплату: счёт физлицу выпускается ПОСЛЕ оплаты
    // Kaspi, и без отметки «Оплачено» покупатель получает счёт на уже
    // оплаченное. Платёж живёт в другом модуле — только через graph.
    const { data: orderRows } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "company.id",
        "company.name",
        "company.bin",
        "payment_collections.status",
        "payment_collections.payments.provider_id",
        "payment_collections.payments.captured_at",
      ],
      filters: { id: input.order_id },
    })
    const orderRow = (orderRows as OrderGraphRow[])[0] ?? null
    const company = orderRow?.company ?? null
    const address = order.billing_address ?? order.shipping_address ?? null
    const personName = [address?.first_name, address?.last_name]
      .filter((part) => !!part && `${part}`.trim() !== "")
      .join(" ")
    const buyer = {
      name: company?.name ?? (personName !== "" ? personName : null),
      bin: company?.bin ?? null,
      is_company: !!company?.id,
      address: address
        ? [address.address_1, address.city].filter(Boolean).join(", ") || null
        : null,
      phone: address?.phone ?? null,
      email: order.email ?? null,
    }

    // Единица измерения («мешок», «м³», «тонна») лежит в карточке каталога,
    // связанной с товаром ядра link'ом: без неё в форме З-2 остаётся пустая
    // графа «Ед. изм.», а «3,5» без единицы в накладной ничего не значит.
    const productIds = Array.from(
      new Set(
        (order.items ?? [])
          .map((item) => item.product_id)
          .filter((id): id is string => !!id)
      )
    )
    const unitByProduct = new Map<string, string>()
    if (productIds.length > 0) {
      const { data: productRows } = await query.graph({
        entity: "product",
        fields: ["id", "product_card.unit"],
        filters: { id: productIds },
      })
      for (const row of productRows as ProductCardRow[]) {
        const unit = row.product_card?.unit
        if (unit) {
          unitByProduct.set(row.id, unit)
        }
      }
    }

    const items = (order.items ?? []).map((item) => {
      const quantity = Number(item.quantity)
      const unitPrice = Number(item.unit_price)
      const total =
        item.total != null ? Number(item.total) : unitPrice * quantity
      // Название с вариантом: в заказе позиции одного товара различаются только
      // вариантом («Профиль для гипсокартона» ПН 28×27 и ПС 60×27), и без него
      // в документе стоят две одинаковые строки.
      const productTitle = item.title ?? item.product_title ?? "—"
      const variantTitle = (item.variant_title ?? "").trim()
      return {
        title:
          variantTitle !== "" && variantTitle !== productTitle
            ? `${productTitle}, ${variantTitle}`
            : productTitle,
        quantity,
        unit_price: unitPrice,
        total,
        unit: item.product_id ? unitByProduct.get(item.product_id) ?? null : null,
        // Артикул варианта — «номенклатурный номер» графы 3 формы З-2.
        sku: item.variant_sku ?? null,
      }
    })

    // Доставка — отдельной строкой документа: без неё сумма позиций не сходится
    // с итогом (у заказа №24 счёт показывал 240 000 ₸ при итоге 242 000 ₸), а
    // счёт с несходящейся арифметикой бухгалтерия не примет.
    for (const method of order.shipping_methods ?? []) {
      const amount = Number(method.total ?? method.amount ?? 0)
      if (!amount) {
        continue
      }
      items.push({
        title: method.name ?? "Доставка",
        quantity: 1,
        unit_price: amount,
        total: amount,
        unit: "услуга",
        sku: null,
      })
    }

    const currency_code = order.currency_code ?? "kzt"
    // Бонусные кредитные линии заказа (модуль bonus добавляет reference
    // "bonus_account"); сумма — абсолютная (линия уменьшает total).
    const total_bonus = (order.credit_lines ?? []).reduce(
      (sum, cl) => sum + Math.abs(Number(cl.amount ?? 0)),
      0
    )
    // Итог берём выборкой сервиса, а НЕ полем retrieveOrder: с явным списком
    // relations ядро считает total без доставки (тот же класс дефекта, что в
    // T4.2a с query.graph). Запасной вариант — сумма строк документа.
    const [totalsRow] = await orderService.listOrders(
      { id: input.order_id },
      { select: ["id", "total"] }
    )
    const serviceTotal =
      totalsRow?.total != null ? Number(totalsRow.total) : Number.NaN
    const total_money = Number.isFinite(serviceTotal)
      ? serviceTotal
      : items.reduce((sum, i) => sum + i.total, 0)

    // Оплата считается прошедшей, когда у платежа есть отметка захвата: у
    // Kaspi это момент подтверждения, у наличных — приём денег кассиром.
    const payments = (orderRow?.payment_collections ?? []).flatMap(
      (collection) => collection.payments ?? []
    )
    const captured = payments.find((item) => !!item.captured_at) ?? null
    const payment = {
      paid: !!captured,
      provider: captured?.provider_id ?? payments[0]?.provider_id ?? null,
      captured_at: captured?.captured_at
        ? new Date(captured.captured_at).toISOString()
        : null,
    }

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
        kbe: settings.seller_kbe,
        knp: settings.seller_knp,
        director_name: settings.director_name,
      },
      footer_note: settings.footer_note,
      buyer,
      order: {
        display_id: order.display_id ?? null,
        currency_code,
        created_at: order.created_at
          ? new Date(order.created_at).toISOString()
          : null,
      },
      payment,
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
