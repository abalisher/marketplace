import { DriverPoolOrder } from "../../../lib/orders/driver-pool"

// Карточка заказа в пуле, как её видит приложение водителя. Снапшот адреса с
// именем и телефоном получателя сюда НЕ попадает: пул открыт всем допущенным
// водителям, а контакты нужны только тому, кто заказ взял, — он получит их
// вместе со своей точкой рейса.
export type DriverPoolOrderView = {
  order_id: string
  display_id: number | null
  order_number: string | null
  created_at: string | null
  address: string | null
  city: string | null
  items_count: number
  total_quantity: number
}

export const toDriverPoolOrderView = (
  order: DriverPoolOrder
): DriverPoolOrderView => ({
  order_id: order.order_id,
  display_id: order.display_id ?? null,
  order_number: order.order_number ?? null,
  created_at: order.created_at,
  address: order.address,
  city: order.city,
  items_count: order.items_count,
  total_quantity: order.total_quantity,
})
