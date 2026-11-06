import { amountInWords, pluralForm } from "../../../lib/format/amount-in-words"
import { orderLabel } from "../../../lib/orders/order-number"
import { DocumentCanvas } from "./document-canvas"
import {
  DocumentRenderInput,
  itemsVat,
  sellerVatRate,
} from "./document-snapshot"
import {
  formatAmount,
  formatDocumentDate,
  formatMoney,
  formatQuantity,
  formatShortDate,
  itemUnit,
  paymentProviderLabel,
} from "./document-format"

// Счёт на оплату. У счёта, в отличие от накладной, утверждённой формы в РК нет —
// требование одно: набор реквизитов, по которым банк проведёт платёж. Поэтому
// бланк у нас двуликий:
//
// • ФИЗЛИЦУ (MVP-покупатель) счёт по сути чек: он приходит ПОСЛЕ оплаты Kaspi,
//   платить по нему уже не надо. Печатаем как расчётный документ магазина —
//   что купили, почём, отметка «Оплачено», без банковской рамки и печати.
//   Так это делают строительные ритейлеры: покупателю нужен состав заказа и
//   подтверждение оплаты, а не платёжное поручение.
// • ЮРЛИЦУ — классический казахстанский счёт: сверху рамка «образец платёжного
//   поручения» (Бенефициар, БИН, ИИК, Кбе, Банк, БИК, КНП), снизу подписи
//   исполнителя и руководителя с местом печати. Без Кбе и КНП банк платёж не
//   проведёт. Юрлица на MVP заморожены (FEATURE_COMPANIES), но бланк готов.

// Срок, в течение которого счёт юрлицу считается действительным.
const INVOICE_VALID_BANK_DAYS = 3

const ITEM_FORMS = ["наименование", "наименования", "наименований"] as const

export const renderInvoice = (
  canvas: DocumentCanvas,
  input: DocumentRenderInput
): void => {
  const { snapshot, number, version } = input
  const currency = snapshot.totals.currency_code || snapshot.order.currency_code
  const isCompany = !!snapshot.buyer.is_company

  if (isCompany) {
    renderPaymentOrderSample(canvas, input)
  } else {
    renderShopHeader(canvas, input)
  }

  canvas.title(
    `Счёт на оплату № ${number} от ${formatDocumentDate(snapshot.issued_at)}`
  )
  canvas.moveDown(0.2)
  const orderLine =
    orderLabel(snapshot.order.number, snapshot.order.display_id)
      ? `Заказ ${orderLabel(snapshot.order.number, snapshot.order.display_id)} от ${formatDocumentDate(
          snapshot.order.created_at
        )}`
      : "Заказ оформлен на маркетплейсе"
  canvas.paragraph(
    version > 1 ? `${orderLine} · Версия ${version}` : orderLine,
    { align: "center", muted: true, size: 8 }
  )
  canvas.moveDown(0.6)

  if (isCompany) {
    canvas.labeledLine("Поставщик:", sellerLine(snapshot))
    canvas.labeledLine("Покупатель:", buyerLine(snapshot))
    canvas.labeledLine("Договор:", "Без договора (оплата по счёту)")
  } else {
    canvas.labeledLine("Покупатель:", snapshot.buyer.name || "—")
    canvas.labeledLine(
      "Телефон:",
      snapshot.buyer.phone || snapshot.buyer.email || "—"
    )
    canvas.labeledLine("Адрес доставки:", snapshot.buyer.address || "—")
  }
  canvas.moveDown(0.6)

  // Таблица позиций: у чека физлицу колонок ровно столько, сколько человек
  // читает; счёт юрлицу дополнительно несёт артикул для сверки с накладной.
  const columns = isCompany
    ? [
        { title: "№", width: 0.05, align: "center" as const },
        { title: "Наименование", width: 0.4 },
        { title: "Артикул", width: 0.13 },
        { title: "Ед.", width: 0.07, align: "center" as const },
        { title: "Кол-во", width: 0.09, align: "right" as const },
        { title: "Цена", width: 0.12, align: "right" as const },
        { title: "Сумма", width: 0.14, align: "right" as const },
      ]
    : [
        { title: "№", width: 0.06, align: "center" as const },
        { title: "Наименование", width: 0.48 },
        { title: "Ед.", width: 0.08, align: "center" as const },
        { title: "Кол-во", width: 0.1, align: "right" as const },
        { title: "Цена", width: 0.13, align: "right" as const },
        { title: "Сумма", width: 0.15, align: "right" as const },
      ]

  const itemsTotal = snapshot.items.reduce((sum, item) => sum + item.total, 0)
  const rows = snapshot.items.map((item, i) => {
    const base = [
      String(i + 1),
      item.title,
      itemUnit(item.unit),
      formatQuantity(item.quantity),
      formatAmount(item.unit_price),
      formatAmount(item.total),
    ]
    return isCompany
      ? [base[0], base[1], item.sku ?? "—", base[2], base[3], base[4], base[5]]
      : base
  })

  canvas.table({
    columns,
    rows,
    totalRow: isCompany
      ? ["", "Итого", "", "", "", "", formatAmount(itemsTotal)]
      : ["", "Итого", "", "", "", formatAmount(itemsTotal)],
  })

  // Бонусы — отдельной строкой: покупатель должен видеть, почему к оплате
  // меньше суммы позиций (ТЗ 4.10 требует деньги и бонусы раздельно).
  if (snapshot.totals.bonus > 0) {
    canvas.totalsLine(
      "Оплачено бонусами:",
      `− ${formatMoney(snapshot.totals.bonus, currency)}`
    )
  }
  // Цены продавца — с НДС: плательщику документ выделяет НДС из суммы позиций.
  const vatRate = sellerVatRate(snapshot.seller)
  canvas.totalsLine(
    vatRate ? `В т.ч. НДС ${vatRate}%:` : "НДС:",
    vatRate ? formatMoney(itemsVat(snapshot.items, vatRate), currency) : "не облагается"
  )
  canvas.totalsLine(
    isCompany ? "Всего к оплате:" : "Итого к оплате:",
    formatMoney(snapshot.totals.money, currency),
    { strong: true }
  )
  canvas.moveDown(0.4)

  const count = snapshot.items.length
  canvas.paragraph(
    `Всего ${count} ${pluralForm(count, ITEM_FORMS)} на сумму ${formatMoney(
      snapshot.totals.money,
      currency
    )}.`,
    { size: 8.5 }
  )
  canvas.paragraph(
    `Сумма прописью: ${amountInWords(snapshot.totals.money, currency)}.`,
    { size: 8.5, bold: true }
  )
  canvas.moveDown(0.6)

  if (isCompany) {
    canvas.paragraph(
      `Оплата настоящего счёта означает согласие с условиями поставки. ` +
        `Счёт действителен ${INVOICE_VALID_BANK_DAYS} банковских дня; после его ` +
        `истечения цена и наличие подтверждаются заново. Товар отпускается по ` +
        `факту поступления оплаты на счёт получателя.`,
      { size: 7.5, muted: true }
    )
    canvas.moveDown(1)
    canvas.signatures([
      {
        label: "Исполнитель",
        hint: "подпись",
        width: 0.5,
      },
      {
        label: "Руководитель",
        value: snapshot.seller.director_name ?? null,
        hint: "подпись, Ф.И.О.",
        width: 0.5,
      },
    ])
    canvas.stampPlace()
  } else {
    renderPaymentMark(canvas, input)
  }

  if (snapshot.footer_note) {
    canvas.moveDown(0.5)
    canvas.footer(snapshot.footer_note)
  }
}

// Шапка чека физлицу: магазин крупно, реквизиты одной серой строкой — так
// выглядит верх расчётного документа в рознице.
const renderShopHeader = (
  canvas: DocumentCanvas,
  input: DocumentRenderInput
): void => {
  const { seller } = input.snapshot
  canvas.paragraph(seller.name, { size: 14, bold: true })
  const contacts = [
    seller.bin ? `БИН/ИИН ${seller.bin}` : null,
    seller.address,
    seller.phone,
    seller.email,
  ].filter(Boolean)
  canvas.paragraph(contacts.join(" · "), { size: 7.5, muted: true })
  canvas.moveDown(0.4)
  canvas.rule(1.2)
  canvas.moveDown(0.5)
}

// Шапка счёта юрлицу — рамка «образец платёжного поручения»: без Кбе и КНП банк
// покупателя платёж не проведёт.
const renderPaymentOrderSample = (
  canvas: DocumentCanvas,
  input: DocumentRenderInput
): void => {
  const { seller } = input.snapshot
  canvas.paragraph("Образец платёжного поручения", {
    size: 8,
    muted: true,
    align: "center",
  })
  canvas.moveDown(0.2)
  canvas.requisitesBox([
    {
      label: "Бенефициар:",
      value: seller.name,
      boxLabel: "ИИК",
      boxValue: seller.iban ?? "",
    },
    {
      label: "БИН/ИИН:",
      value: seller.bin ?? "—",
      boxLabel: "Кбе",
      boxValue: seller.kbe ?? "",
    },
    {
      label: "Банк бенефициара:",
      value: seller.bank_name ?? "—",
      boxLabel: "БИК",
      boxValue: seller.bank_bik ?? "",
    },
    {
      label: "Назначение платежа:",
      value: paymentPurpose(input),
      boxLabel: "КНП",
      boxValue: seller.knp ?? "",
    },
  ])
  canvas.moveDown(0.3)
}

// Назначение платежа для рамки платёжного поручения: банк требует, чтобы в
// платёжке стоял номер счёта — иначе оплату не сопоставить с заказом.
const paymentPurpose = (input: DocumentRenderInput): string =>
  `Оплата по счёту № ${input.number} за строительные материалы`

// Отметка об оплате у чека физлицу. Счёт выпускается после оплаты Kaspi,
// поэтому по умолчанию печатаем «Оплачено»; если оплата не прошла — реквизиты,
// по которым можно оплатить, и срок действия счёта.
const renderPaymentMark = (
  canvas: DocumentCanvas,
  input: DocumentRenderInput
): void => {
  const { snapshot } = input
  const payment = snapshot.payment
  const doc = canvas.doc

  if (payment?.paid) {
    const height = 30
    const width = 250
    const y = doc.y
    doc
      .rect(canvas.left, y, width, height)
      .lineWidth(1)
      .strokeColor("#111111")
      .stroke()
    doc.font("bold").fontSize(11).fillColor("#111111")
    doc.text("ОПЛАЧЕНО", canvas.left + 10, y + 5, { width: width - 20 })
    doc.font("regular").fontSize(7.5).fillColor("#666666")
    doc.text(
      `${paymentProviderLabel(payment.provider)} · ${formatShortDate(
        payment.captured_at ?? snapshot.issued_at
      )}`,
      canvas.left + 10,
      y + 18,
      { width: width - 20 }
    )
    doc.fillColor("#111111")
    doc.y = y + height + 8
    doc.x = canvas.left
    canvas.paragraph(
      "Фискальный чек на оплату приходит в приложении банка. " +
        "Настоящий документ подтверждает состав и стоимость заказа.",
      { size: 7.5, muted: true }
    )
  } else if (payment?.method === "kaspi_transfer" && payment.transfer_phone) {
    // Перевод на номер Kaspi продавца: номер, получатель и что написать в
    // комментарии, чтобы продавец сопоставил перевод с заказом.
    canvas.paragraph("Оплата переводом Kaspi", { size: 9, bold: true })
    canvas.moveDown(0.2)
    if (payment.paid_amount && payment.outstanding != null) {
      canvas.paragraph(
        `Оплачено ${formatMoney(payment.paid_amount, snapshot.order.currency_code)}, осталось оплатить ${formatMoney(payment.outstanding, snapshot.order.currency_code)}.`,
        { size: 8 }
      )
      canvas.moveDown(0.2)
    }
    canvas.paragraph(
      [
        `Номер Kaspi: ${payment.transfer_phone}`,
        payment.transfer_recipient ? `получатель: ${payment.transfer_recipient}` : null,
        orderLabel(snapshot.order.number, snapshot.order.display_id)
          ? `комментарий к переводу: «Заказ ${orderLabel(snapshot.order.number, snapshot.order.display_id)}»`
          : null,
      ]
        .filter(Boolean)
        .join(" · "),
      { size: 8 }
    )
    canvas.moveDown(0.3)
    canvas.paragraph(
      "Заказ передаётся в работу после того, как продавец получит перевод.",
      { size: 7.5, muted: true }
    )
  } else if (payment?.method === "kaspi_qr") {
    // Kaspi QR, выставленный уже после оформления (покупатель сменил способ):
    // счёт Kaspi — на странице заказа, реквизиты для банковского платежа не нужны.
    canvas.paragraph("Оплата: Kaspi QR", { size: 9, bold: true })
    canvas.moveDown(0.2)
    canvas.paragraph(
      "Счёт Kaspi с QR-кодом — на странице заказа и в чате магазина. После оплаты заказ " +
        "отмечается оплаченным автоматически.",
      { size: 8 }
    )
  } else if (payment?.method === "debt") {
    // В долг: срок и порядок возврата согласует продавец при подтверждении;
    // после одобрения в счёте — срок, после частичного погашения — остаток.
    canvas.paragraph(
      payment.due_date
        ? `Оплата: в долг до ${formatShortDate(payment.due_date)}`
        : "Оплата: в долг",
      { size: 9, bold: true }
    )
    canvas.moveDown(0.2)
    if (payment.paid_amount && payment.outstanding != null) {
      canvas.paragraph(
        `Оплачено ${formatMoney(payment.paid_amount, snapshot.order.currency_code)}, осталось оплатить ${formatMoney(payment.outstanding, snapshot.order.currency_code)}.`,
        { size: 8 }
      )
      canvas.moveDown(0.2)
    }
    canvas.paragraph(
      (payment.due_date
        ? "Отсрочка одобрена продавцом."
        : "Отсрочку оплаты одобряет продавец при подтверждении заказа и назначает срок возврата.") +
        (payment.transfer_phone
          ? ` Вернуть долг можно переводом на Kaspi ${payment.transfer_phone}` +
            (orderLabel(snapshot.order.number, snapshot.order.display_id)
              ? ` с комментарием «Заказ ${orderLabel(snapshot.order.number, snapshot.order.display_id)}».`
              : ".")
          : ""),
      { size: 8 }
    )
  } else {
    canvas.paragraph("Реквизиты для оплаты", { size: 9, bold: true })
    canvas.moveDown(0.2)
    const seller = snapshot.seller
    canvas.paragraph(
      [
        seller.bank_name ? `Банк: ${seller.bank_name}` : null,
        seller.bank_bik ? `БИК: ${seller.bank_bik}` : null,
        seller.iban ? `ИИК: ${seller.iban}` : null,
        seller.kbe ? `Кбе: ${seller.kbe}` : null,
        seller.knp ? `КНП: ${seller.knp}` : null,
      ]
        .filter(Boolean)
        .join(" · "),
      { size: 8 }
    )
    canvas.moveDown(0.3)
    canvas.paragraph(
      `Счёт действителен ${INVOICE_VALID_BANK_DAYS} банковских дня. ` +
        `В назначении платежа укажите номер заказа.`,
      { size: 7.5, muted: true }
    )
  }

  canvas.moveDown(0.6)
  canvas.paragraph(
    "Документ сформирован автоматически и действителен без подписи и печати.",
    { size: 7.5, muted: true }
  )
}

// Однострочные реквизиты сторон для счёта юрлицу (как в типовом бланке: всё
// одной строкой через запятую).
const sellerLine = (snapshot: DocumentRenderInput["snapshot"]): string => {
  const { seller } = snapshot
  return [
    seller.bin ? `БИН/ИИН ${seller.bin}` : null,
    seller.name,
    seller.address,
    seller.phone,
  ]
    .filter(Boolean)
    .join(", ")
}

const buyerLine = (snapshot: DocumentRenderInput["snapshot"]): string => {
  const { buyer } = snapshot
  return (
    [
      buyer.bin ? `БИН/ИИН ${buyer.bin}` : null,
      buyer.name,
      buyer.address,
      buyer.phone,
    ]
      .filter(Boolean)
      .join(", ") || "—"
  )
}
