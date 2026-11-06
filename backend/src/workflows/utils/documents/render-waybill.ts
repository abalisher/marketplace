import { orderLabel } from "../../../lib/orders/order-number"
import {
  amountInWords,
  integerInWords,
  pluralForm,
} from "../../../lib/format/amount-in-words"
import { DocumentCanvas } from "./document-canvas"
import {
  DocumentRenderInput,
  itemsVat,
  sellerVatRate,
  vatIncluded,
} from "./document-snapshot"
import {
  currencyLabel,
  formatAmount,
  formatDocumentDate,
  formatQuantity,
  itemUnit,
} from "./document-format"

// Накладная на отпуск запасов на сторону — форма З-2, приложение 26 к приказу
// Министра финансов РК от 20 декабря 2012 года № 562 (с изм. от 19.08.2013).
// В отличие от счёта, у накладной форма УТВЕРЖДЕНА: угловой штамп, набор граф
// и подписи «Отпустил / Получил» — не украшение, а требование к первичному
// документу. Печатаем максимально близко к бланку: те же графы и в том же
// порядке, включая «Количество подлежит отпуску» и «Количество отпущено»
// (у нас они совпадают — частичная отгрузка на MVP не выпускается).
//
// Печать в двух экземплярах (отправителю и получателю) — приписка в подвале:
// покупателю-физлицу накладная и есть подтверждение передачи товара.

const ITEM_FORMS = ["наименование", "наименования", "наименований"] as const

export const renderWaybill = (
  canvas: DocumentCanvas,
  input: DocumentRenderInput
): void => {
  const { snapshot, number, version } = input
  const currency = snapshot.totals.currency_code || snapshot.order.currency_code

  canvas.cornerStamp([
    "Форма З-2",
    "Приложение 26 к приказу Министра финансов",
    "Республики Казахстан от 20 декабря 2012 года № 562",
  ])
  canvas.moveDown(0.5)

  canvas.labeledLine(
    "Организация (индивидуальный предприниматель):",
    `${snapshot.seller.name}${
      snapshot.seller.bin ? `, БИН/ИИН ${snapshot.seller.bin}` : ""
    }`,
    { labelWidth: 200, hint: "наименование, БИН/ИИН" }
  )
  canvas.moveDown(0.5)

  canvas.title("НАКЛАДНАЯ НА ОТПУСК ЗАПАСОВ НА СТОРОНУ", 12)
  canvas.moveDown(0.4)
  canvas.miniTable(
    ["Номер документа", "Дата составления"],
    [number, formatDocumentDate(snapshot.issued_at)],
    0.52
  )
  canvas.moveDown(0.4)

  canvas.labeledLine("Организация-отправитель:", senderLine(snapshot), {
    labelWidth: 150,
  })
  canvas.labeledLine("Организация-получатель:", receiverLine(snapshot), {
    labelWidth: 150,
  })
  canvas.labeledLine(
    "Ответственный за поставку:",
    snapshot.seller.director_name ?? "",
    { labelWidth: 150, hint: "Ф.И.О." }
  )
  canvas.labeledLine("Основание отпуска:", orderBasis(snapshot), {
    labelWidth: 150,
  })
  canvas.labeledLine("Транспортная организация:", "", {
    labelWidth: 150,
    hint: "наименование, при доставке силами продавца — не заполняется",
  })
  canvas.labeledLine("Через кого, доверенность №:", "", {
    labelWidth: 150,
    hint: "Ф.И.О. получателя, номер и дата доверенности",
  })
  canvas.moveDown(0.5)

  // Графы бланка З-2 в утверждённом порядке. НДС у продавца-неплательщика —
  // нули; у плательщика — выделенный из суммы позиции (цены с НДС).
  const vatRate = sellerVatRate(snapshot.seller)
  const itemVat = (total: number) => (vatRate ? vatIncluded(total, vatRate) : 0)
  const vatTotal = vatRate ? itemsVat(snapshot.items, vatRate) : 0
  const rows = snapshot.items.map((item, i) => [
    String(i + 1),
    item.title,
    item.sku ?? "—",
    itemUnit(item.unit),
    formatQuantity(item.quantity),
    formatQuantity(item.quantity),
    formatAmount(item.unit_price),
    formatAmount(item.total),
    formatAmount(itemVat(item.total)),
  ])
  const itemsTotal = snapshot.items.reduce((sum, item) => sum + item.total, 0)

  canvas.table({
    fontSize: 7.5,
    columns: [
      { title: "№", width: 0.04, align: "center" },
      { title: "Наименование, характеристика", width: 0.25 },
      { title: "Номенклатурный номер", width: 0.13 },
      { title: "Ед. изм.", width: 0.09, align: "center" },
      // В бланке эти две графы стоят под общей шапкой «Количество»; общей шапки
      // у нашей таблицы нет, а «Количество» в колонку 0.08 не влезает и рвётся
      // внутри слова — пишем «Кол-во».
      { title: "Кол-во подлежит отпуску", width: 0.085, align: "right" },
      { title: "Кол-во отпущено", width: 0.085, align: "right" },
      { title: `Цена за единицу, ${currencyLabel(currency)}`, width: 0.1, align: "right" },
      { title: `Сумма с НДС, ${currencyLabel(currency)}`, width: 0.12, align: "right" },
      { title: `Сумма НДС, ${currencyLabel(currency)}`, width: 0.1, align: "right" },
    ],
    rows,
    totalRow: [
      "",
      "Итого",
      "х",
      "х",
      "х",
      "х",
      "х",
      formatAmount(itemsTotal),
      formatAmount(vatTotal),
    ],
  })

  const count = snapshot.items.length
  canvas.labeledLine(
    "Всего отпущено количество запасов (прописью):",
    `${count} (${integerInWords(count)}) ${pluralForm(count, ITEM_FORMS)}`,
    { labelWidth: 230 }
  )
  canvas.labeledLine(
    "на сумму (прописью):",
    `${amountInWords(itemsTotal, currency)}`,
    { labelWidth: 230 }
  )
  if (snapshot.totals.bonus > 0) {
    canvas.paragraph(
      `В том числе оплачено бонусами: ${formatAmount(
        snapshot.totals.bonus
      )} ${currencyLabel(currency)}.`,
      { size: 8 }
    )
  }
  canvas.paragraph(
    vatRate
      ? `В том числе НДС ${vatRate}%: ${formatAmount(vatTotal)} ${currencyLabel(currency)}.`
      : "Без НДС.",
    { size: 8 }
  )
  canvas.moveDown(1.2)

  canvas.signatures([
    {
      label: "Отпустил",
      hint: "должность, подпись, расшифровка подписи",
      width: 0.34,
    },
    {
      label: "Главный бухгалтер",
      hint: "подпись, расшифровка подписи",
      width: 0.33,
    },
    {
      label: "Получил",
      hint: "подпись, расшифровка подписи, дата",
      width: 0.33,
    },
  ])
  canvas.moveDown(0.4)
  canvas.paragraph(
    "Составлена в двух экземплярах: первый — отправителю, второй — получателю." +
      (version > 1 ? ` Версия документа: ${version}.` : ""),
    { size: 7.5, muted: true }
  )

  if (snapshot.footer_note) {
    canvas.moveDown(0.4)
    canvas.footer(snapshot.footer_note)
  }
}

const senderLine = (snapshot: DocumentRenderInput["snapshot"]): string =>
  [snapshot.seller.name, snapshot.seller.address].filter(Boolean).join(", ")

// Получателем в бланке стоит покупатель: у юрлица — название и БИН, у физлица —
// Ф.И.О. и адрес доставки (накладная физлицу подтверждает передачу товара).
const receiverLine = (snapshot: DocumentRenderInput["snapshot"]): string =>
  [
    snapshot.buyer.name,
    snapshot.buyer.bin ? `БИН/ИИН ${snapshot.buyer.bin}` : null,
    snapshot.buyer.address,
    snapshot.buyer.phone,
  ]
    .filter(Boolean)
    .join(", ") || "—"

const orderBasis = (snapshot: DocumentRenderInput["snapshot"]): string =>
  orderLabel(snapshot.order.number, snapshot.order.display_id)
    ? `Заказ ${orderLabel(snapshot.order.number, snapshot.order.display_id)} от ${formatDocumentDate(
        snapshot.order.created_at
      )}`
    : "Заказ маркетплейса"
