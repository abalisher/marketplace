import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ASSEMBLY_MODULE } from "../../../../../modules/assembly"
import AssemblyModuleService, {
  summarizeOrderAssembly,
} from "../../../../../modules/assembly/service"
import { AssemblyTaskStatus } from "../../../../../modules/assembly/models/constants"
import {
  buildAssemblyTaskRow,
  loadOrderRefs,
} from "../../../assembly-tasks/rows"

// GET /admin/orders/:id/assembly — сборка одного заказа: плитки категорий со
// статусом и агрегат («Заказ собран» / где нехватка). База экрана отгрузки
// (T10.13) и карточки заказа: по одному ответу видно, что тормозит отгрузку.
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const service = req.scope.resolve<AssemblyModuleService>(ASSEMBLY_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const tasks = await service.listOrderTasks(req.params.id)
  const orders = await loadOrderRefs(query, [req.params.id])

  const summary = summarizeOrderAssembly(
    tasks.map((task) => ({
      id: task.id,
      category_handle: task.category_handle,
      status: task.status as AssemblyTaskStatus,
    }))
  )

  res.json({
    order_id: req.params.id,
    assembly_tasks: tasks.map((task) =>
      buildAssemblyTaskRow(task, orders.get(req.params.id))
    ),
    summary,
  })
}
