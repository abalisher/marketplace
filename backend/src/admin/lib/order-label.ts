// Подпись заказа в панели: номер для людей «ORG-26-0007», а у заказов до
// 2026-11-02 (номера нет) — «№5». Одно правило на все экраны — бэкенд отдаёт
// order_number рядом с display_id (lib/orders/order-number.ts).
export const orderLabel = (
  orderNumber: string | null | undefined,
  displayId?: number | null
): string => orderNumber || (displayId != null ? `№${displayId}` : "—")
