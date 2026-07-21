import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { ESTIMATOR_MODULE } from "../../../../modules/estimator"
import EstimatorModuleService from "../../../../modules/estimator/service"
import { serializeEstimate } from "../helpers"

// GET /store/estimates/:id — расчёт с позициями (рекомендательный). Доступ по id
// (без владения — расчёт не содержит чувствительных данных, MVP-калькулятор).
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const estimatorService =
    req.scope.resolve<EstimatorModuleService>(ESTIMATOR_MODULE)
  try {
    const estimate = await estimatorService.retrieveEstimate(req.params.id, {
      relations: ["lines"],
    })
    res.json({ estimate: serializeEstimate(estimate) })
  } catch {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Estimate ${req.params.id} not found`
    )
  }
}
