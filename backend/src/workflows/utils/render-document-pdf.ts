import fs from "fs"
import path from "path"
import PDFDocument from "pdfkit"
import { MedusaError } from "@medusajs/framework/utils"
import { DocumentType } from "../../modules/documents/models/constants"
import { DocumentCanvas } from "./documents/document-canvas"
import { DocumentRenderInput } from "./documents/document-snapshot"
import { renderAct } from "./documents/render-act"
import { renderInvoice } from "./documents/render-invoice"
import { renderWaybill } from "./documents/render-waybill"

// Рендер PDF документа-основания через pdfkit (без Chromium). Кириллица
// стандартными шрифтами PDF невозможна (латиница-only) — встраиваем TTF
// PT Sans (SIL OFL, спроектирован под кириллицу) из assets модуля documents.
// Функция чистая: на вход — снапшот выпуска, на выход — Buffer PDF. Загрузка в
// File Module и привязка к строке документа — в шаге workflow
// (render-and-attach), сам модуль documents рендер/файлы не знает (правило
// изоляции, см. docs/modules/documents.md).
//
// Этот файл — только диспетчер: заводит страницу, шрифты и холст, а разметку
// каждого бланка держит свой шаблон в ./documents. Бланки РАЗНЫЕ: у накладной
// утверждённая форма З-2, счёт физлицу выглядит расчётным документом магазина,
// акт — двусторонним актом. Раньше все три печатались одним макетом и
// отличались одной строкой заголовка — документ читался черновиком.

export type RenderDocumentInput = DocumentRenderInput & {
  type: DocumentType
}

// Шаблон на тип документа. Новый тип = новый файл рядом, без правки диспетчера
// по месту.
const TEMPLATES: Record<
  DocumentType,
  (canvas: DocumentCanvas, input: DocumentRenderInput) => void
> = {
  invoice: renderInvoice,
  waybill: renderWaybill,
  internal_avr: renderAct,
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

export const renderDocumentPdf = (
  input: RenderDocumentInput
): Promise<Buffer> => {
  const { type, number, version, snapshot } = input
  const fontDir = resolveFontDir()

  // Поля бланка уже: первичные формы печатают в 15-20 мм, широкая таблица
  // накладной (9 граф) в 50 pt не помещается.
  const doc = new PDFDocument({ size: "A4", margin: 42 })
  const chunks: Buffer[] = []
  doc.on("data", (chunk: Buffer) => chunks.push(chunk))
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)))
    doc.on("error", reject)
  })

  doc.registerFont("regular", path.join(fontDir, "PTSans-Regular.ttf"))
  doc.registerFont("bold", path.join(fontDir, "PTSans-Bold.ttf"))

  const render = TEMPLATES[type]
  if (!render) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Unknown document type: ${type}`
    )
  }
  render(new DocumentCanvas(doc), { number, version, snapshot })

  doc.end()
  return done
}
