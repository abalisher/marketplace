import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { loadLifecycleDetail } from "./lifecycle-detail"

// GET /admin/orders/:id/lifecycle — бизнес-статус заказа (ТЗ) и полный лог
// переходов для админа (виджет на странице заказа). Ограничений по
// принадлежности нет — админ видит любой заказ. Выборка — в lifecycle-detail.ts
// (её же читает карточка-drawer очереди).
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  res.json(await loadLifecycleDetail(req.scope, req.params.id))
}
