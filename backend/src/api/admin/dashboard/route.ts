import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { ORDER_LIFECYCLE_MODULE } from "../../../modules/order-lifecycle"
import OrderLifecycleModuleService from "../../../modules/order-lifecycle/service"
import { PROCUREMENT_MODULE } from "../../../modules/procurement"
import ProcurementModuleService from "../../../modules/procurement/service"
import { REVIEWS_MODULE } from "../../../modules/reviews"
import ReviewsModuleService from "../../../modules/reviews/service"
import { buildDashboardSummary } from "./summary"

// GET /admin/dashboard — сводка дня для экрана «Дашборд» админки продавца:
// сколько заказов ждёт обработки, сколько претензий требует ответа, сколько
// карточек на модерации, какие позиции на исходе и какие приходы не проведены,
// сколько денег в дне и где магазин тормозит по стадиям (T4.12).
// Счёт и пороги — здесь, а не в браузере: админка остаётся тонким клиентом
// (CLAUDE.md).
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const procurement =
    req.scope.resolve<ProcurementModuleService>(PROCUREMENT_MODULE)
  const reviews = req.scope.resolve<ReviewsModuleService>(REVIEWS_MODULE)
  const lifecycle = req.scope.resolve<OrderLifecycleModuleService>(
    ORDER_LIFECYCLE_MODULE
  )

  res.json(
    await buildDashboardSummary(
      query,
      procurement,
      req.scope.resolve(Modules.ORDER),
      reviews,
      lifecycle
    )
  )
}
