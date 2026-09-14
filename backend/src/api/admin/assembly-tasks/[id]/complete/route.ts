import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ASSEMBLY_MODULE } from "../../../../../modules/assembly"
import AssemblyModuleService from "../../../../../modules/assembly/service"
import { completeAssemblyTaskWorkflow } from "../../../../../workflows/complete-assembly-task"
import { buildAssemblyTaskRow, loadOrderRefs } from "../../rows"
import { AdminCompleteAssemblyTaskType } from "../../validators"

// POST /admin/assembly-tasks/:id/complete — сборщик закрыл задание. Итог
// (собрано / нехватка) выводится из отметок позиций; когда закрыто последнее
// задание заказа, workflow сам передаёт набранное в отгрузку (ядровый
// fulfillment) и двигает статус заказа. В ответе — задание и агрегат по
// заказу: экран сразу показывает, собран ли заказ целиком.
export async function POST(
  req: AuthenticatedMedusaRequest<AdminCompleteAssemblyTaskType>,
  res: MedusaResponse
) {
  const { result } = await completeAssemblyTaskWorkflow(req.scope).run({
    input: {
      task_id: req.params.id,
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
    order_assembly: result.summary,
  })
}
