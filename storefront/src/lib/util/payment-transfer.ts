import { orderLabel } from "./order-label"

// Комментарий к переводу на Kaspi продавца: по нему продавец находит заказ в
// выписке. Текст одинаков во всех языках интерфейса (продавец ищет именно
// «Заказ ORG-26-0007») — это зеркало `place-order` бэкенда, а не строка словаря.
export const transferComment = (
  orderNumber?: string | null,
  displayId?: number | null
): string | null => {
  const label = orderLabel(orderNumber, displayId)
  return label ? `Заказ ${label}` : null
}
