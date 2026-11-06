// Единый форматтер денег панели продавца: целые тенге с разделителями разрядов
// и знаком валюты. Medusa v2 хранит суммы в основной единице валюты (KZT
// де-факто целочислен), поэтому ×100 не делаем — см. DECISIONS 2026-07-23.
//
// NB: в lib/procurement.ts и lib/scoring.ts живут две исторические копии этой
// функции; свести их сюда — в ревизии экранов T4.5 (сейчас не трогаем, чтобы
// не тащить churn в чужие экраны).

const FORMAT = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 })

export const formatTenge = (amount: number) => `${FORMAT.format(amount)} ₸`

// Количество на складе: целое — как есть, дробное (м³, т из 1С) — до тысячных
// с запятой: «34,95».
// Себестоимость из 1С — с копейками («5 172,41 ₸»): это учётная цена, а не
// круглый прайс.
const EXACT = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})
export const formatTengeExact = (amount: number) => `${EXACT.format(amount)} ₸`

const QUANTITY = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 3 })
export const formatQuantity = (value: number) => QUANTITY.format(value)

// Сумма заказа: магазин работает в тенге, но в базе стенда остались старые
// заказы в другой валюте — показываем их в их валюте, а не «переименовываем»
// в ₸. Валюту берём из самого заказа, по умолчанию — тенге.
export const formatAmount = (amount: number, currency?: string | null) => {
  const code = (currency ?? "kzt").toUpperCase()
  if (code === "KZT") {
    return formatTenge(amount)
  }
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: code,
    maximumFractionDigits: 2,
  }).format(amount)
}
