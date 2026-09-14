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
}

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
}

export type DocumentSnapshot = {
  // ISO-строка момента выпуска (снапшоты сериализуются в json).
  issued_at: string
  seller: DocumentSnapshotSeller
  footer_note?: string | null
  buyer: DocumentSnapshotBuyer
  order: {
    display_id?: number | null
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
