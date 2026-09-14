// Человекочитаемый вид номера телефона: канон `+77012345678` →
// `+7 701 234 56 78`. Зеркало `mobile/packages/core/lib/auth/phone_format.dart`
// и `storefront/src/lib/util/format-phone.ts` (правило «номера
// человекочитаемые»).
//
// Правило одно на всю панель, поэтому и файл один: до T5.1a форматтер лежал
// внутри DTO экрана кодов входа (`lib/login-codes.ts`), и очередь водителей
// показала бы номер каноном — слитной строкой из одиннадцати цифр, которую
// продавец не сверит с бумажкой на глаз.
export const formatPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, "")
  if (digits.length !== 11 || !digits.startsWith("7")) {
    return phone
  }
  const national = digits.slice(1)
  return `+7 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(
    6,
    8
  )} ${national.slice(8)}`
}

// Строка поиска, когда искать можно И по номеру, И по имени (очередь
// водителей). В базе номер лежит каноном `+77012345678`, а продавец набирает
// его так, как читает: копирует с экрана («+7 701 234 56 78») или пишет
// междугородней записью («8 701 …»). Без этого правила поиск по СВОЕМУ же
// экрану не находил бы ничего.
//
// Похожее на номер сжимаем в цифры канона (`ilike %77012345678%` совпадёт с
// `+77012345678`), «8» в начале полного номера меняем на «7» — как это делает
// `modules/auth-phone/normalize-phone.ts` на входе. Всё остальное — ФИО и его
// куски — отдаём как есть.
export const phoneSearchTerm = (value: string): string => {
  const trimmed = value.trim()
  if (!/^\+?[\d\s()-]+$/.test(trimmed)) {
    return trimmed
  }
  const digits = trimmed.replace(/\D/g, "")
  if (!digits) {
    return trimmed
  }
  return digits.length === 11 && digits.startsWith("8")
    ? `7${digits.slice(1)}`
    : digits
}
