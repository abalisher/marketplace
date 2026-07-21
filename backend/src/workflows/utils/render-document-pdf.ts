import fs from "fs"
import path from "path"
import PDFDocument from "pdfkit"
import { MedusaError } from "@medusajs/framework/utils"
import { DocumentType } from "../../modules/documents/models/constants"

// Чистый рендер PDF документа-основания через pdfkit (без Chromium). Кириллица
// стандартными шрифтами PDF невозможна (латиница-only) — встраиваем TTF PT Sans
// (SIL OFL, спроектирован под кириллицу), лежащий в assets модуля documents.
// Функция чистая: на вход — снапшот выпуска, на выход — Buffer PDF. Загрузка в
// File Module и привязка к строке документа — в шаге workflow (render-and-attach),
// сам модуль documents рендер/файлы не знает (правило изоляции, см.
// docs/modules/documents.md).

export type DocumentSnapshotItem = {
  title: string
  quantity: number
  unit_price: number
  total: number
}

export type DocumentSnapshot = {
  // ISO-строка момента выпуска (снапшоты сериализуются в json).
  issued_at: string
  seller: {
    name: string
    bin?: string | null
    address?: string | null
    phone?: string | null
    email?: string | null
    bank_name?: string | null
    bank_bik?: string | null
    iban?: string | null
  }
  footer_note?: string | null
  buyer: { email?: string | null }
  order: {
    display_id?: number | null
    currency_code: string
    created_at?: string | null
  }
  items: DocumentSnapshotItem[]
  totals: { money: number; bonus: number; currency_code: string }
}

export type RenderDocumentInput = {
  type: DocumentType
  number: string
  version: number
  snapshot: DocumentSnapshot
}

// Заголовки документов (текст — русский, ТЗ 4.10). Код — английский.
const DOCUMENT_TITLES: Record<DocumentType, string> = {
  invoice: "Счёт на оплату",
  waybill: "Накладная",
  internal_avr: "Акт выполненных работ (внутренний)",
}

// Шрифты лежат в assets модуля documents. Путь резолвится относительно этого
// файла (dev/тесты — из src) с запасным вариантом от cwd — на случай иной
// компоновки. Прод-сборка (.medusa/server) ассеты tsc не копирует — при
// прод-развёртывании шрифты нужно доставить рядом (см. docs/modules/documents.md).
const FONT_DIR_CANDIDATES = [
  path.join(__dirname, "..", "..", "modules", "documents", "assets", "fonts"),
  path.join(process.cwd(), "src", "modules", "documents", "assets", "fonts"),
]

const resolveFontDir = (): string => {
  for (const dir of FONT_DIR_CANDIDATES) {
    if (fs.existsSync(path.join(dir, "PTSans-Regular.ttf"))) {
      return dir
    }
  }
  throw new MedusaError(
    MedusaError.Types.UNEXPECTED_STATE,
    "Cyrillic font (PTSans-Regular.ttf) not found in documents assets"
  )
}

// Сумма с разбивкой разрядов пробелом и кодом валюты в верхнем регистре
// (1234567 kzt → «1 234 567 KZT»). Bonus/деньги — целые тиыны? нет: суммы уже в
// основной единице (тенге), форматируем как целые.
const formatMoney = (amount: number, currency: string): string => {
  const rounded = Math.round(amount)
  const grouped = rounded
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  return `${grouped} ${currency.toUpperCase()}`
}

export const renderDocumentPdf = (
  input: RenderDocumentInput
): Promise<Buffer> => {
  const { type, number, version, snapshot } = input
  const fontDir = resolveFontDir()

  const doc = new PDFDocument({ size: "A4", margin: 50 })
  const chunks: Buffer[] = []
  doc.on("data", (chunk: Buffer) => chunks.push(chunk))
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)))
    doc.on("error", reject)
  })

  doc.registerFont("regular", path.join(fontDir, "PTSans-Regular.ttf"))
  doc.registerFont("bold", path.join(fontDir, "PTSans-Bold.ttf"))

  const currency = snapshot.totals.currency_code || snapshot.order.currency_code
  const issuedAt = new Date(snapshot.issued_at)
  const issuedLabel = Number.isNaN(issuedAt.getTime())
    ? snapshot.issued_at
    : issuedAt.toISOString().slice(0, 10)

  // Шапка: продавец + название документа с номером.
  doc.font("bold").fontSize(18).text(snapshot.seller.name)
  doc.moveDown(0.3)
  doc
    .font("bold")
    .fontSize(14)
    .text(`${DOCUMENT_TITLES[type]} № ${number}`)
  doc
    .font("regular")
    .fontSize(10)
    .text(`Версия ${version} · Дата выпуска: ${issuedLabel}`)
  if (snapshot.order.display_id != null) {
    doc.text(`Заказ № ${snapshot.order.display_id}`)
  }
  doc.moveDown(1)

  // Реквизиты продавца.
  doc.font("bold").fontSize(11).text("Реквизиты продавца")
  doc.font("regular").fontSize(10)
  const sellerLines: string[] = []
  if (snapshot.seller.bin) sellerLines.push(`БИН/ИИН: ${snapshot.seller.bin}`)
  if (snapshot.seller.address)
    sellerLines.push(`Адрес: ${snapshot.seller.address}`)
  if (snapshot.seller.phone) sellerLines.push(`Телефон: ${snapshot.seller.phone}`)
  if (snapshot.seller.email) sellerLines.push(`Email: ${snapshot.seller.email}`)
  if (snapshot.seller.bank_name)
    sellerLines.push(`Банк: ${snapshot.seller.bank_name}`)
  if (snapshot.seller.bank_bik) sellerLines.push(`БИК: ${snapshot.seller.bank_bik}`)
  if (snapshot.seller.iban) sellerLines.push(`IBAN: ${snapshot.seller.iban}`)
  if (sellerLines.length === 0) sellerLines.push("—")
  sellerLines.forEach((line) => doc.text(line))
  doc.moveDown(0.7)

  // Покупатель.
  doc.font("bold").fontSize(11).text("Покупатель")
  doc
    .font("regular")
    .fontSize(10)
    .text(snapshot.buyer.email ?? "—")
  doc.moveDown(1)

  // Таблица позиций (простая: № · наименование · кол-во · цена · сумма).
  doc.font("bold").fontSize(11).text("Позиции")
  doc.moveDown(0.3)
  const startX = doc.page.margins.left
  const rightX = doc.page.width - doc.page.margins.right
  const cols = {
    idx: startX,
    title: startX + 25,
    qty: rightX - 200,
    price: rightX - 130,
    sum: rightX - 60,
  }

  const drawRow = (
    cells: { idx: string; title: string; qty: string; price: string; sum: string },
    font: "regular" | "bold"
  ) => {
    const y = doc.y
    doc.font(font).fontSize(9)
    doc.text(cells.idx, cols.idx, y, { width: 20 })
    doc.text(cells.title, cols.title, y, { width: cols.qty - cols.title - 5 })
    const rowY = doc.y
    doc.text(cells.qty, cols.qty, y, { width: 60, align: "right" })
    doc.text(cells.price, cols.price, y, { width: 60, align: "right" })
    doc.text(cells.sum, cols.sum, y, { width: 55, align: "right" })
    doc.y = Math.max(rowY, y) + 4
  }

  drawRow(
    { idx: "№", title: "Наименование", qty: "Кол-во", price: "Цена", sum: "Сумма" },
    "bold"
  )
  doc
    .moveTo(startX, doc.y)
    .lineTo(rightX, doc.y)
    .strokeColor("#cccccc")
    .stroke()
  doc.moveDown(0.3)

  snapshot.items.forEach((item, i) => {
    drawRow(
      {
        idx: String(i + 1),
        title: item.title,
        qty: String(item.quantity),
        price: formatMoney(item.unit_price, currency),
        sum: formatMoney(item.total, currency),
      },
      "regular"
    )
  })
  doc.moveDown(0.7)

  // Итоги: деньгами и бонусами раздельно (ТЗ 4.10).
  doc
    .moveTo(startX, doc.y)
    .lineTo(rightX, doc.y)
    .strokeColor("#cccccc")
    .stroke()
  doc.moveDown(0.4)
  doc.font("bold").fontSize(11)
  doc.text(
    `Итого к оплате деньгами: ${formatMoney(snapshot.totals.money, currency)}`,
    { align: "right" }
  )
  if (snapshot.totals.bonus > 0) {
    doc
      .font("regular")
      .fontSize(10)
      .text(
        `Оплачено бонусами: ${formatMoney(snapshot.totals.bonus, currency)}`,
        { align: "right" }
      )
  }

  // Подвал (например, «не является официальным ЭСФ»).
  if (snapshot.footer_note) {
    doc.moveDown(2)
    doc
      .font("regular")
      .fontSize(8)
      .fillColor("#666666")
      .text(snapshot.footer_note, { align: "center" })
  }

  doc.end()
  return done
}
