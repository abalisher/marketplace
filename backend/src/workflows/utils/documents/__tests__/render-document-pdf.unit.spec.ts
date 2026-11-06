import fs from "fs"
import path from "path"
import { renderDocumentPdf } from "../../render-document-pdf"
import { DocumentSnapshot, itemsVat, sellerVatRate, vatIncluded } from "../document-snapshot"

const OUT = process.env.DOC_PREVIEW_DIR

const seller = {
  name: "ТОО «СтройМаркет»",
  bin: "180540021764",
  address: "г. Астана, ул. Кабанбай батыра, 53, офис 12",
  phone: "+7 7172 55-11-22",
  email: "docs@stroymarket.kz",
  bank_name: "АО «Kaspi Bank»",
  bank_bik: "CASPKZKA",
  iban: "KZ12 3456 7890 1234 5678",
  kbe: "17",
  knp: "710",
  director_name: "Ержан Смагулов",
}

const items = [
  { title: "Цемент М400, мешок 50 кг", quantity: 40, unit_price: 2300, total: 92000, unit: "мешок", sku: "CEM-M400-50" },
  { title: "Кирпич керамический рядовой М150", quantity: 1200, unit_price: 95, total: 114000, unit: "шт", sku: "BRK-M150" },
  { title: "Песок карьерный мытый", quantity: 3.5, unit_price: 6000, total: 21000, unit: "м³", sku: "SND-WASH" },
  { title: "Доставка манипулятором, Астана", quantity: 1, unit_price: 15000, total: 15000, unit: "услуга", sku: null },
]

const snapshot: DocumentSnapshot = {
  issued_at: "2026-09-06T09:12:00.000Z",
  seller,
  footer_note:
    "Документ сформирован платформой СтройМаркет и не является официальной ЭСФ.",
  buyer: {
    name: "Айгуль Сарсенова",
    is_company: false,
    address: "г. Астана, ул. Тәуелсіздік, 34, кв. 71",
    phone: "+7 701 234-56-78",
    email: "aigul@example.kz",
  },
  order: { display_id: 63, currency_code: "kzt", created_at: "2026-09-06T08:40:00.000Z" },
  payment: { paid: true, provider: "pp_kaspi_kaspi", captured_at: "2026-09-06T08:55:00.000Z" },
  items,
  totals: { money: 232000, bonus: 10000, currency_code: "kzt" },
}

const companySnapshot: DocumentSnapshot = {
  ...snapshot,
  buyer: {
    name: "ТОО «Астана Курылыс»",
    bin: "210340001234",
    is_company: true,
    address: "г. Астана, пр. Мәңгілік Ел, 8",
    phone: "+7 7172 90-11-33",
    email: "buh@akurylys.kz",
  },
  payment: { paid: false, provider: null, captured_at: null },
  totals: { money: 242000, bonus: 0, currency_code: "kzt" },
}

describe("render-document-pdf", () => {
  it("рендерит все три бланка и они различаются", async () => {
    const cases: [string, Buffer][] = []
    for (const [name, input] of [
      ["invoice-person", { type: "invoice" as const, number: "INV-2026-000012", version: 1, snapshot }],
      ["invoice-company", { type: "invoice" as const, number: "INV-2026-000013", version: 1, snapshot: companySnapshot }],
      ["waybill", { type: "waybill" as const, number: "WB-2026-000007", version: 1, snapshot }],
      ["act", { type: "internal_avr" as const, number: "AVR-2026-000003", version: 2, snapshot: companySnapshot }],
    ] as const) {
      const buffer = await renderDocumentPdf(input)
      expect(buffer.subarray(0, 5).toString()).toBe("%PDF-")
      expect(buffer.length).toBeGreaterThan(2000)
      cases.push([name, buffer])
      if (OUT) {
        fs.mkdirSync(OUT, { recursive: true })
        fs.writeFileSync(path.join(OUT, `${name}.pdf`), buffer)
      }
    }
    const sizes = new Set(cases.map(([, b]) => b.length))
    expect(sizes.size).toBe(cases.length)
  })

  it("продавец-плательщик НДС: НДС выделяется из суммы, бланки рендерятся", async () => {
    // 242 000 с НДС 16%: 242 000 × 16 / 116.
    expect(vatIncluded(242000, 16)).toBe(33379.31)
    expect(vatIncluded(315, 16)).toBe(43.45)
    // Документ — сумма НДС строк: счёт и накладная сходятся до тиына.
    expect(itemsVat(items, 16)).toBe(33379.32)
    expect(sellerVatRate({ name: "ИП", vat_rate: 16 })).toBe(16)
    expect(sellerVatRate({ name: "ИП", vat_rate: null })).toBeNull()
    expect(sellerVatRate({ name: "ИП" })).toBeNull()

    const vatSeller = { ...seller, vat_rate: 16 }
    for (const [name, input] of [
      ["invoice-company-vat", { type: "invoice" as const, number: "INV-2026-000014", version: 1, snapshot: { ...companySnapshot, seller: vatSeller } }],
      ["waybill-vat", { type: "waybill" as const, number: "WB-2026-000008", version: 1, snapshot: { ...snapshot, seller: vatSeller } }],
      ["act-vat", { type: "internal_avr" as const, number: "AVR-2026-000004", version: 1, snapshot: { ...companySnapshot, seller: vatSeller } }],
    ] as const) {
      const buffer = await renderDocumentPdf(input)
      expect(buffer.subarray(0, 5).toString()).toBe("%PDF-")
      if (OUT) {
        fs.mkdirSync(OUT, { recursive: true })
        fs.writeFileSync(path.join(OUT, `${name}.pdf`), buffer)
      }
    }
  })
})
