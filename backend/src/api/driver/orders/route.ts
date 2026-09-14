import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { listAvailableOrders } from "../../../lib/orders/driver-pool"
import { toDriverPoolOrderView } from "./pool-view"

// GET /driver/orders — пул свободных заказов (T5.2a): собранные заказы с
// доставкой, которых ещё никто не взял, FIFO — раньше оформлен, выше в списке.
// Допуск водителя проверяет middleware requireActiveDriver, правило пула —
// lib/orders/driver-pool.ts (общее со «взять заказ»).
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const orders = await listAvailableOrders(req.scope)
  res.json({ orders: orders.map(toDriverPoolOrderView) })
}
