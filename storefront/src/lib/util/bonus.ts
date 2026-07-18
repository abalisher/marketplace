// Бонусы на корзине/заказе живут кредитными линиями ядра с
// reference="bonus_account" (см. бэкенд, workflow apply-cart-bonus).
// Чистый хелпер суммирует их для отображения — никакой бизнес-логики.

export const BONUS_CREDIT_LINE_REFERENCE = "bonus_account"

type WithCreditLines = {
  credit_lines?:
    | { amount?: number | null; reference?: string | null }[]
    | null
}

// Принимает object: у ядрового типа StoreCart поле credit_lines не
// задекларировано (приходит через ?fields=*credit_lines), сужаем сами.
export function getBonusCreditAmount(entity?: object | null): number {
  const creditLines = (entity as WithCreditLines | null | undefined)
    ?.credit_lines
  if (!creditLines) {
    return 0
  }

  return creditLines
    .filter((line) => line.reference === BONUS_CREDIT_LINE_REFERENCE)
    .reduce((sum, line) => sum + Number(line.amount ?? 0), 0)
}
