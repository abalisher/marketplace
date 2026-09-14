// Примитивы бумажного бланка поверх pdfkit: линованные поля, таблица со
// сплошной сеткой, блоки подписей, угловой штамп. Вынесены отдельно, потому что
// «настоящесть» документа делает именно разметка: типографский бланк — это
// сетка и подписи, а не текст абзацами (сравнение с формой З-2 —
// docs/modules/documents.md).
//
// Класс держит только координаты и рисование. Что печатать — решают шаблоны
// (render-invoice / render-waybill / render-act). Тип PDFKit.PDFDocument —
// глобальный из @types/pdfkit, импорт не нужен.

export type TableColumn = {
  title: string
  // Доля ширины полосы набора (сумма долей всех колонок = 1).
  width: number
  align?: "left" | "right" | "center"
}

export type TableOptions = {
  columns: TableColumn[]
  rows: string[][]
  // Строка «Итого» — жирная, с заливкой (последняя строка таблицы).
  totalRow?: string[]
  fontSize?: number
}

export type SignatureField = {
  label: string
  // Подпись под линией: «(должность, подпись)» или расшифровка.
  hint?: string
  value?: string | null
  width?: number
}

export type RequisitesRow = {
  label: string
  value: string
  // Правая клетка строки — код платёжного поручения (ИИК, Кбе, БИК, КНП).
  boxLabel?: string
  boxValue?: string
}

const INK = "#111111"
const GRID = "#555555"
const MUTED = "#666666"
const HEADER_FILL = "#eeeeee"

export class DocumentCanvas {
  readonly doc: PDFKit.PDFDocument

  constructor(doc: PDFKit.PDFDocument) {
    this.doc = doc
  }

  get left(): number {
    return this.doc.page.margins.left
  }

  get right(): number {
    return this.doc.page.width - this.doc.page.margins.right
  }

  get bottom(): number {
    return this.doc.page.height - this.doc.page.margins.bottom
  }

  get width(): number {
    return this.right - this.left
  }

  get y(): number {
    return this.doc.y
  }

  set y(value: number) {
    this.doc.y = value
  }

  moveDown(lines = 1): void {
    this.doc.moveDown(lines)
  }

  // Угловой штамп бланка («Форма З-2 · Приложение 26 к приказу…») — мелким
  // кеглем по правому краю, как на типографской форме.
  cornerStamp(lines: string[]): void {
    const boxWidth = this.width * 0.45
    const x = this.right - boxWidth
    const startY = this.doc.y
    this.doc.font("regular").fontSize(6.5).fillColor(MUTED)
    this.doc.text(lines.join("\n"), x, startY, {
      width: boxWidth,
      align: "right",
    })
    this.doc.fillColor(INK)
    this.doc.x = this.left
  }

  title(text: string, size = 13): void {
    this.doc.font("bold").fontSize(size).fillColor(INK)
    this.doc.text(text, this.left, this.doc.y, {
      width: this.width,
      align: "center",
    })
    this.doc.x = this.left
  }

  paragraph(
    text: string,
    opts?: {
      size?: number
      muted?: boolean
      bold?: boolean
      align?: "left" | "right" | "center"
    }
  ): void {
    this.doc
      .font(opts?.bold ? "bold" : "regular")
      .fontSize(opts?.size ?? 9)
      .fillColor(opts?.muted ? MUTED : INK)
    this.doc.text(text, this.left, this.doc.y, {
      width: this.width,
      align: opts?.align ?? "left",
    })
    this.doc.fillColor(INK)
    this.doc.x = this.left
  }

  // Горизонтальная черта во всю ширину (разделитель шапки бланка).
  rule(thickness = 1, color = INK): void {
    const y = this.doc.y
    this.doc
      .moveTo(this.left, y)
      .lineTo(this.right, y)
      .lineWidth(thickness)
      .strokeColor(color)
      .stroke()
    this.doc.y = y + 4
    this.doc.x = this.left
  }

  // Линованное поле бланка: «Поставщик: ——— значение ———» с пояснением под
  // линией. Так устроены все первичные формы — без линий документ читается
  // черновиком.
  labeledLine(
    label: string,
    value: string | null | undefined,
    opts?: { hint?: string; labelWidth?: number }
  ): void {
    const labelWidth = opts?.labelWidth ?? 96
    const startY = this.doc.y
    this.doc.font("regular").fontSize(9).fillColor(INK)
    this.doc.text(label, this.left, startY, { width: labelWidth })
    const labelBottom = this.doc.y
    // Зазор между подписью и значением: без него «Организация:ТОО …»
    // слипается в одно слово.
    const valueX = this.left + labelWidth + 4
    const valueWidth = this.right - valueX
    const text = (value ?? "").trim()
    this.doc.font("bold").fontSize(9)
    this.doc.text(text === "" ? " " : text, valueX, startY, {
      width: valueWidth,
    })
    const lineY = Math.max(this.doc.y, labelBottom, startY + 11)
    this.doc
      .moveTo(valueX, lineY)
      .lineTo(this.right, lineY)
      .lineWidth(0.5)
      .strokeColor(GRID)
      .stroke()
    this.doc.y = lineY + 1
    if (opts?.hint) {
      this.doc.font("regular").fontSize(6).fillColor(MUTED)
      this.doc.text(opts.hint, valueX, this.doc.y, {
        width: valueWidth,
        align: "center",
      })
    }
    this.doc.fillColor(INK)
    this.doc.y += 3
    this.doc.x = this.left
  }

  // Рамка реквизитов в две колонки — шапка счёта «образец платёжного
  // поручения»: слева бенефициар и банк, справа клетки ИИК / Кбе / БИК / КНП.
  requisitesBox(rows: RequisitesRow[]): void {
    const boxLabelWidth = 32
    const boxValueWidth = 124
    const leftWidth = this.width - boxLabelWidth - boxValueWidth
    const padding = 4
    const labelWidth = 92
    let y = this.doc.y

    for (const row of rows) {
      const valueWidth = leftWidth - labelWidth - padding * 3
      this.doc.font("regular").fontSize(8)
      const labelHeight = this.doc.heightOfString(row.label, {
        width: labelWidth,
      })
      this.doc.font("bold").fontSize(9)
      const valueHeight = this.doc.heightOfString(row.value || " ", {
        width: valueWidth,
      })
      const rowHeight = Math.max(labelHeight, valueHeight, 13) + padding * 2

      this.doc
        .rect(this.left, y, leftWidth, rowHeight)
        .lineWidth(0.5)
        .strokeColor(GRID)
        .stroke()
      this.doc.font("regular").fontSize(8).fillColor(MUTED)
      this.doc.text(row.label, this.left + padding, y + padding, {
        width: labelWidth,
      })
      this.doc.font("bold").fontSize(9).fillColor(INK)
      this.doc.text(
        row.value || "—",
        this.left + padding * 2 + labelWidth,
        y + padding,
        { width: valueWidth }
      )

      const boxX = this.left + leftWidth
      this.doc
        .rect(boxX, y, boxLabelWidth, rowHeight)
        .lineWidth(0.5)
        .strokeColor(GRID)
        .stroke()
      this.doc
        .rect(boxX + boxLabelWidth, y, boxValueWidth, rowHeight)
        .lineWidth(0.5)
        .strokeColor(GRID)
        .stroke()
      this.doc.font("regular").fontSize(8).fillColor(MUTED)
      this.doc.text(row.boxLabel ?? "", boxX + 3, y + padding, {
        width: boxLabelWidth - 6,
      })
      this.doc.font("bold").fontSize(9).fillColor(INK)
      this.doc.text(row.boxValue ?? "", boxX + boxLabelWidth + 4, y + padding, {
        width: boxValueWidth - 8,
      })

      y += rowHeight
    }

    this.doc.y = y + 6
    this.doc.x = this.left
    this.doc.fillColor(INK)
  }

  // Таблица позиций со сплошной сеткой; при переносе на новую страницу шапка
  // повторяется (иначе вторая страница накладной нечитаема).
  table(options: TableOptions): void {
    const fontSize = options.fontSize ?? 8
    const padding = 3
    const widths = options.columns.map((col) => col.width * this.width)
    const xs: number[] = []
    let acc = this.left
    for (const w of widths) {
      xs.push(acc)
      acc += w
    }

    const drawRow = (
      cells: string[],
      font: "regular" | "bold",
      fill?: string
    ): void => {
      this.doc.font(font).fontSize(fontSize)
      let height = 0
      cells.forEach((cell, i) => {
        height = Math.max(
          height,
          this.doc.heightOfString(cell || " ", {
            width: widths[i] - padding * 2,
          })
        )
      })
      const rowHeight = height + padding * 2

      if (this.doc.y + rowHeight > this.bottom) {
        this.doc.addPage()
        this.doc.y = this.doc.page.margins.top
        drawRow(
          options.columns.map((col) => col.title),
          "bold",
          HEADER_FILL
        )
      }

      const y = this.doc.y
      cells.forEach((cell, i) => {
        if (fill) {
          this.doc.rect(xs[i], y, widths[i], rowHeight).fillColor(fill).fill()
        }
        this.doc
          .rect(xs[i], y, widths[i], rowHeight)
          .lineWidth(0.5)
          .strokeColor(GRID)
          .stroke()
        this.doc.font(font).fontSize(fontSize).fillColor(INK)
        this.doc.text(cell, xs[i] + padding, y + padding, {
          width: widths[i] - padding * 2,
          align: options.columns[i].align ?? "left",
        })
      })
      this.doc.y = y + rowHeight
      this.doc.x = this.left
    }

    drawRow(
      options.columns.map((col) => col.title),
      "bold",
      HEADER_FILL
    )
    options.rows.forEach((row) => drawRow(row, "regular"))
    if (options.totalRow) {
      drawRow(options.totalRow, "bold", HEADER_FILL)
    }
    this.doc.y += 6
  }

  // Узкая таблица по центру полосы — «Номер документа | Дата составления»
  // формы З-2 (в бланке она стоит отдельным блоком под названием документа).
  miniTable(headers: string[], values: string[], widthRatio = 0.5): void {
    const tableWidth = this.width * widthRatio
    const cellWidth = tableWidth / headers.length
    const x0 = this.left + (this.width - tableWidth) / 2
    const padding = 3
    const headerHeight = 14
    const valueHeight = 16
    const y = this.doc.y

    headers.forEach((header, i) => {
      const x = x0 + cellWidth * i
      this.doc
        .rect(x, y, cellWidth, headerHeight)
        .fillColor(HEADER_FILL)
        .fill()
        .rect(x, y, cellWidth, headerHeight)
        .lineWidth(0.5)
        .strokeColor(GRID)
        .stroke()
      this.doc.font("regular").fontSize(7.5).fillColor(INK)
      this.doc.text(header, x + padding, y + 4, {
        width: cellWidth - padding * 2,
        align: "center",
      })
      this.doc
        .rect(x, y + headerHeight, cellWidth, valueHeight)
        .lineWidth(0.5)
        .strokeColor(GRID)
        .stroke()
      this.doc.font("bold").fontSize(9)
      this.doc.text(values[i] ?? "", x + padding, y + headerHeight + 4, {
        width: cellWidth - padding * 2,
        align: "center",
      })
    })

    this.doc.y = y + headerHeight + valueHeight + 6
    this.doc.x = this.left
    this.doc.fillColor(INK)
  }

  // Итоговая строка справа под таблицей («Итого», «К оплате» — крупнее).
  totalsLine(
    label: string,
    value: string,
    opts?: { strong?: boolean; size?: number }
  ): void {
    const size = opts?.size ?? (opts?.strong ? 12 : 9)
    const y = this.doc.y
    this.doc
      .font(opts?.strong ? "bold" : "regular")
      .fontSize(size)
      .fillColor(INK)
    const valueWidth = 160
    this.doc.text(label, this.left, y, {
      width: this.width - valueWidth - 6,
      align: "right",
    })
    const labelBottom = this.doc.y
    this.doc.text(value, this.right - valueWidth, y, {
      width: valueWidth,
      align: "right",
    })
    this.doc.y = Math.max(labelBottom, this.doc.y) + 2
    this.doc.x = this.left
  }

  // Блок подписей: линия, над ней — расшифровка (если известна), под ней —
  // пояснение мелким кеглем. Ряд делится между полями.
  signatures(fields: SignatureField[]): void {
    const gap = 18
    const totalWidth = this.width - gap * (fields.length - 1)
    const startY = this.doc.y
    let x = this.left
    let maxBottom = startY

    for (const field of fields) {
      const width = (field.width ?? 1 / fields.length) * totalWidth
      this.doc.font("regular").fontSize(8).fillColor(INK)
      this.doc.text(field.label, x, startY, { width })
      const labelBottom = this.doc.y
      const lineY = labelBottom + 12
      if (field.value) {
        this.doc.font("bold").fontSize(8)
        this.doc.text(field.value, x, lineY - 10, { width, align: "center" })
      }
      this.doc
        .moveTo(x, lineY)
        .lineTo(x + width, lineY)
        .lineWidth(0.5)
        .strokeColor(GRID)
        .stroke()
      this.doc.y = lineY + 2
      if (field.hint) {
        this.doc.font("regular").fontSize(6).fillColor(MUTED)
        this.doc.text(field.hint, x, this.doc.y, { width, align: "center" })
      }
      maxBottom = Math.max(maxBottom, this.doc.y)
      x += width + gap
    }

    this.doc.fillColor(INK)
    this.doc.y = maxBottom + 6
    this.doc.x = this.left
  }

  // Место печати — рамка-пунктир справа от подписей.
  stampPlace(label = "М.П."): void {
    const size = 62
    const x = this.left
    const y = this.doc.y
    this.doc
      .rect(x, y, size, size)
      .lineWidth(0.5)
      .dash(2, { space: 2 })
      .strokeColor(GRID)
      .stroke()
      .undash()
    this.doc.font("regular").fontSize(7).fillColor(MUTED)
    this.doc.text(label, x, y + size / 2 - 4, { width: size, align: "center" })
    this.doc.fillColor(INK)
    this.doc.y = y + size + 6
    this.doc.x = this.left
  }

  // Приписка в подвале (мелкая, серая).
  footer(text: string): void {
    this.doc.font("regular").fontSize(7).fillColor(MUTED)
    this.doc.text(text, this.left, this.doc.y, {
      width: this.width,
      align: "center",
    })
    this.doc.fillColor(INK)
    this.doc.x = this.left
  }
}
