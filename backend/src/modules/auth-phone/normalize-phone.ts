// Нормализация телефона покупателя к каноническому виду +7XXXXXXXXXX.
// На вход приходит всё, что человек может набрать: «8 701 234-56-78»,
// «+7 (701) 234 56 78», «7012345678». Канон — единственный ключ учётки
// (entity_id провайдер-идентичности), поэтому вид должен быть однозначным.

// Мобильные Казахстана: код страны 7, код оператора 7XX. Действующие коды
// операторов — 70X, 74X, 75X, 76X, 77X; городские (717X Астана, 72X Алматы)
// сюда не попадают — по ним не приходит SMS с кодом.
const KZ_MOBILE = /^\+77[04567]\d{8}$/

/**
 * Приводит введённый номер к `+7XXXXXXXXXX`.
 * Возвращает `null`, если это не мобильный номер Казахстана.
 */
export const normalizePhone = (input: string): string | null => {
  const digits = (input ?? "").replace(/\D+/g, "")
  if (!digits) {
    return null
  }

  let national: string
  if (digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"))) {
    // Полный номер с кодом страны (7…) либо в междугородней записи (8…).
    national = digits.slice(1)
  } else if (digits.length === 10) {
    // Номер без кода страны — считаем казахстанским.
    national = digits
  } else {
    return null
  }

  const normalized = `+7${national}`
  return KZ_MOBILE.test(normalized) ? normalized : null
}

/**
 * Маска для показа в интерфейсе и в логах: +7 7XX XXX ХХ 78 —
 * последние две цифры оставляем, чтобы покупатель узнал свой номер.
 */
export const maskPhone = (phone: string): string => {
  if (!KZ_MOBILE.test(phone)) {
    return phone
  }
  return `+7 ${phone.slice(2, 5)} XXX XX ${phone.slice(-2)}`
}
