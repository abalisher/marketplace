// Фича-флаги витрины (T10.9). Значения приходят из окружения сборки Next
// (`NEXT_PUBLIC_*`) и обязаны совпадать с флагами бэкенда: витрина собирается
// заранее и env бэкенда не видит, а его роуты юрлиц с выключенным флагом
// отвечают 404.
//
// FEATURE_COMPANIES — юрлица целиком: раздел «Компания» в аккаунте, ссылка на
// него из чата, карточка компании в обзоре. На MVP выключен (разворот владельца
// 2026-08-25) — магазин работает только с физлицами. Код и экраны не удалены:
// `NEXT_PUBLIC_FEATURE_COMPANIES=true` + пересборка возвращают раздел.
const enabled = (value: string | undefined): boolean =>
  value === "true" || value === "1"

export const FEATURE_COMPANIES = enabled(
  process.env.NEXT_PUBLIC_FEATURE_COMPANIES
)

// FEATURE_KASPI_MOCK — кнопка «Оплатить тестово» в чекауте и во вставке оплаты
// чата и server action mockPayKaspi (бэкенд POST /store/carts/:id/payment/kaspi/
// mock-pay — dev-канал мок-провайдера). Только для стендов: решение владельца
// 2026-10-01 — включается СТРОГО значением "true" (не "1"), на проде флага нет.
export const FEATURE_KASPI_MOCK =
  process.env.NEXT_PUBLIC_KASPI_MOCK === "true"
