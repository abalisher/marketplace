import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ASSEMBLY_MODULE } from "../../../../modules/assembly"
import AssemblyModuleService from "../../../../modules/assembly/service"
import { buildAssemblyTaskRow, loadOrderRefs } from "../rows"

// GET /admin/assembly-tasks/:id — карточка задания: позиции с количеством и
// отметками, заказ и статус. Тот же формат строки, что в очереди, — экран
// сборщика открывает задание, ничего не досчитывая.
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const service = req.scope.resolve<AssemblyModuleService>(ASSEMBLY_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const task = await service.retrieveAssemblyTask(req.params.id, {
    relations: ["items"],
  })
  const orders = await loadOrderRefs(query, [task.order_id])

  res.json({
    assembly_task: buildAssemblyTaskRow(task, orders.get(task.order_id)),
  })
}
