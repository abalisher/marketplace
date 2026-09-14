// Человекочитаемый вид номера телефона: канон бэкенда `+77012345678` →
// `+7 701 234 56 78`. Канон остаётся ключом для вызовов API — форматируется
// только показ (правило «номера человекочитаемые», гейт U). Зеркало
// `mobile/packages/core/lib/auth/phone_format.dart`.
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
