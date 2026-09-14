import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ASSEMBLY_MODULE } from "../../../../../../modules/assembly"
import AssemblyModuleService from "../../../../../../modules/assembly/service"
import { markAssemblyItemWorkflow } from "../../../../../../workflows/mark-assembly-item"
import { buildAssemblyTaskRow, loadOrderRefs } from "../../../rows"
import { AdminMarkAssemblyItemType } from "../../../validators"

// POST /admin/assembly-tasks/:id/items/:item_id — отметка сборщика по позиции
// (набрано / частично / нет в наличии). В ответ — всё задание целиком: экран
// телефона перерисовывает список одним ответом, без второго запроса.
export async function POST(
  req: AuthenticatedMedusaRequest<AdminMarkAssemblyItemType>,
  res: MedusaResponse
) {
  await markAssemblyItemWorkflow(req.scope).run({
    input: {
      task_id: req.params.id,
      item_id: req.params.item_id,
      status: req.validatedBody.status,
      picked_quantity: req.validatedBody.picked_quantity,
      note: req.validatedBody.note,
      actor_id: req.auth_context.actor_id,
    },
    throwOnError: true,
  })

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
