// Подпись заказа для покупателя: номер «ORG-26-0007», а у заказов до
// 2026-11-02 (номера нет) — «№5». Одно правило на кабинет, чат и оплату;
// бэкенд отдаёт номер рядом с display_id (backend lib/orders/order-number.ts).
export const orderLabel = (
  orderNumber: string | null | undefined,
  displayId?: number | null
): string => orderNumber || (displayId != null ? `№${displayId}` : "")
