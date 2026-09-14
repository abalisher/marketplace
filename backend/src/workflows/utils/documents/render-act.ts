import { amountInWords } from "../../../lib/format/amount-in-words"
import { DocumentCanvas } from "./document-canvas"
import { DocumentRenderInput } from "./document-snapshot"
import {
  currencyLabel,
  formatAmount,
  formatDocumentDate,
  formatMoney,
  formatQuantity,
  itemUnit,
} from "./document-format"

// Внутренний акт выполненных работ (оказанных услуг) — информационный документ
// платформы для юрлиц, НЕ официальный АВР и не ЭСФ (официальные бухгалтер
// выписывает на kgd.gov.kz). Форма акта в РК не утверждена, но у бланка есть
// узнаваемый вид: две стороны, таблица работ, фраза о принятии без претензий и
// подписи обеих сторон с местами печатей — этим он отличается от накладной
// (там подписи «отпустил/получил») и от счёта (там реквизиты банка).
//
// На MVP не выпускается: юрлица закрыты флагом FEATURE_COMPANIES.

export const renderAct = (
  canvas: DocumentCanvas,
  input: DocumentRenderInput
): void => {
  const { snapshot, number, version } = input
  const currency = snapshot.totals.currency_code || snapshot.order.currency_code

  canvas.title(
    `Акт выполненных работ (оказанных услуг) № ${number}`,
    12
  )
  canvas.moveDown(0.2)
  canvas.paragraph(
    `от ${formatDocumentDate(snapshot.issued_at)}${
      version > 1 ? ` · версия ${version}` : ""
    }`,
    { align: "center", size: 9 }
  )
  canvas.moveDown(0.2)
  canvas.paragraph(
    "Внутренний документ платформы. Не является официальным АВР или ЭСФ.",
    { align: "center", size: 7.5, muted: true }
  )
  canvas.moveDown(0.7)

  canvas.labeledLine(
    "Исполнитель:",
    [
      snapshot.seller.name,
      snapshot.seller.bin ? `БИН/ИИН ${snapshot.seller.bin}` : null,
      snapshot.seller.address,
    ]
      .filter(Boolean)
      .join(", ")
  )
  canvas.labeledLine(
    "Заказчик:",
    [
      snapshot.buyer.name,
      snapshot.buyer.bin ? `БИН/ИИН ${snapshot.buyer.bin}` : null,
      snapshot.buyer.address,
    ]
      .filter(Boolean)
      .join(", ") || "—"
  )
  canvas.labeledLine(
    "Основание:",
    snapshot.order.display_id != null
      ? `Заказ № ${snapshot.order.display_id} от ${formatDocumentDate(
          snapshot.order.created_at
        )}`
      : "Заказ маркетплейса"
  )
  canvas.moveDown(0.7)

  const itemsTotal = snapshot.items.reduce((sum, item) => sum + item.total, 0)
  canvas.table({
    columns: [
      { title: "№", width: 0.05, align: "center" },
      { title: "Наименование работ (услуг)", width: 0.47 },
      { title: "Ед.", width: 0.08, align: "center" },
      { title: "Кол-во", width: 0.1, align: "right" },
      { title: `Цена, ${currencyLabel(currency)}`, width: 0.14, align: "right" },
      { title: `Сумма, ${currencyLabel(currency)}`, width: 0.16, align: "right" },
    ],
    rows: snapshot.items.map((item, i) => [
      String(i + 1),
      item.title,
      itemUnit(item.unit),
      formatQuantity(item.quantity),
      formatAmount(item.unit_price),
      formatAmount(item.total),
    ]),
    totalRow: ["", "Итого", "", "", "", formatAmount(itemsTotal)],
  })

  if (snapshot.totals.bonus > 0) {
    canvas.totalsLine(
      "Оплачено бонусами:",
      `− ${formatMoney(snapshot.totals.bonus, currency)}`
    )
  }
  canvas.totalsLine("НДС:", "не облагается")
  canvas.totalsLine(
    "Всего оказано услуг на сумму:",
    formatMoney(snapshot.totals.money, currency),
    { strong: true }
  )
  canvas.moveDown(0.4)
  canvas.paragraph(
    `Сумма прописью: ${amountInWords(snapshot.totals.money, currency)}.`,
    { size: 8.5, bold: true }
  )
  canvas.moveDown(0.5)
  canvas.paragraph(
    "Вышеперечисленные работы (услуги) выполнены полностью и в срок. " +
      "Заказчик претензий по объёму, качеству и срокам оказания услуг не имеет.",
    { size: 8 }
  )
  canvas.moveDown(1.2)

  canvas.signatures([
    {
      label: "Исполнитель",
      value: snapshot.seller.director_name ?? null,
      hint: "подпись, Ф.И.О., М.П.",
      width: 0.5,
    },
    {
      label: "Заказчик",
      hint: "подпись, Ф.И.О., М.П.",
      width: 0.5,
    },
  ])

  if (snapshot.footer_note) {
    canvas.moveDown(0.6)
    canvas.footer(snapshot.footer_note)
  }
}
