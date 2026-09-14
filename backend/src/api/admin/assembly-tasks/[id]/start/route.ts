import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ASSEMBLY_MODULE } from "../../../../../modules/assembly"
import AssemblyModuleService from "../../../../../modules/assembly/service"
import { startAssemblyTaskWorkflow } from "../../../../../workflows/start-assembly-task"
import { buildAssemblyTaskRow, loadOrderRefs } from "../../rows"

// POST /admin/assembly-tasks/:id/start — сборщик взял задание (pending →
// picking). Исполнитель — учётка запроса. Тонкий роут: инвариант перехода в
// сервисе модуля, откат — компенсация шага.
export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  await startAssemblyTaskWorkflow(req.scope).run({
    input: {
      task_id: req.params.id,
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
