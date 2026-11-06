// Замороженные исходные данные документа-основания: то, что видит бухгалтерия
// покупателя через год, когда заказ уже изменился. Снапшот пишется в json
// строки Document, поэтому все даты — ISO-строки, а новые поля обязаны быть
// опциональными: старые снапшоты (до правки) рендерятся тем же кодом.

export type DocumentSnapshotItem = {
  title: string
  quantity: number
  unit_price: number
  total: number
  // Единица измерения из карточки товара (шт, мешок, м³, тонна) — колонка
  // «Ед. изм.» обязательна в форме З-2. Старые снапшоты её не несут.
  unit?: string | null
  // Артикул варианта — «номенклатурный номер» формы З-2.
  sku?: string | null
}

export type DocumentSnapshotSeller = {
  name: string
  bin?: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
  bank_name?: string | null
  bank_bik?: string | null
  iban?: string | null
  // Кбе — код бенефициара (17 у юрлиц-резидентов, 19 у ИП): без него банк
  // покупателя не проведёт платёж по счёту.
  kbe?: string | null
  // КНП — код назначения платежа (710 — оплата за товары).
  knp?: string | null
  // ФИО руководителя для подписи под счётом и актом.
  director_name?: string | null
  // Ставка НДС продавца, %; нет — не плательщик («не облагается»). Снапшоты
  // до 2026-11-05 её не несут.
  vat_rate?: number | null
}

// НДС, включённый в сумму с НДС: сумма × ставка / (100 + ставка), до тиына.
export const vatIncluded = (amount: number, rate: number): number =>
  Math.round(((amount * rate) / (100 + rate)) * 100) / 100

// НДС документа — сумма НДС строк (как в графе «Сумма НДС» накладной), чтобы
// счёт, акт и накладная по одному заказу не расходились на тиын.
export const itemsVat = (items: { total: number }[], rate: number): number =>
  Math.round(items.reduce((sum, item) => sum + vatIncluded(item.total, rate), 0) * 100) / 100

export const sellerVatRate = (seller: DocumentSnapshotSeller): number | null =>
  seller.vat_rate && seller.vat_rate > 0 ? seller.vat_rate : null

// Реквизиты покупателя: для юрлица — название и БИН компании (без них счёт не
// примет бухгалтерия), для физлица — имя из адреса заказа.
export type DocumentSnapshotBuyer = {
  name?: string | null
  bin?: string | null
  is_company?: boolean
  address?: string | null
  phone?: string | null
  email?: string | null
}

// Оплата заказа на момент выпуска. Счёт физлицу выпускается ПОСЛЕ оплаты
// (в чате порядок «счёт Kaspi → оплата → заказ»), поэтому документ печатает
// отметку «Оплачено» — иначе покупатель получает счёт на уже оплаченное.
export type DocumentSnapshotPayment = {
  paid?: boolean
  provider?: string | null
  captured_at?: string | null
  // Способ оплаты заказа (kaspi_qr | kaspi_transfer | debt | bonus) и куда
  // переводить — для неоплаченного счёта по переводу. Снапшоты до 2026-10-29
  // их не несут — печатаются как прежде.
  method?: string | null
  transfer_phone?: string | null
  transfer_recipient?: string | null
  // Долг: срок возврата (после одобрения продавцом); частичная оплата — сколько
  // получено и сколько осталось. Снапшоты до 2026-10-30 их не несут.
  due_date?: string | null
  paid_amount?: number | null
  outstanding?: number | null
}

export type DocumentSnapshot = {
  // ISO-строка момента выпуска (снапшоты сериализуются в json).
  issued_at: string
  seller: DocumentSnapshotSeller
  footer_note?: string | null
  buyer: DocumentSnapshotBuyer
  order: {
    display_id?: number | null
    // Номер заказа для людей (ORG-26-0007); в снимках до 2026-11-02 его нет —
    // тогда печатается «№<display_id>» (orderLabel).
    number?: string | null
    currency_code: string
    created_at?: string | null
  }
  payment?: DocumentSnapshotPayment
  items: DocumentSnapshotItem[]
  totals: { money: number; bonus: number; currency_code: string }
}

// Вход шаблона: номер и версия документа + снапшот. Тип документа шаблон уже
// знает — его выбирает диспетчер (render-document-pdf).
export type DocumentRenderInput = {
  number: string
  version: number
  snapshot: DocumentSnapshot
}
