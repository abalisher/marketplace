import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ESTIMATOR_MODULE } from "../../modules/estimator"
import EstimatorModuleService from "../../modules/estimator/service"
import { EstimateParams } from "../../modules/estimator/models/constants"

export type CreateEstimateStepInput = {
  customer_id?: string | null
  params: EstimateParams
  norm_codes?: string[]
  note?: string | null
}

// Расчёт материалов по параметрам и нормативной базе через сервис. Компенсация —
// удаление созданного расчёта (строки уходят вместе с ним).
export const createEstimateStep = createStep(
  "create-estimate",
  async (input: CreateEstimateStepInput, { container }) => {
    const estimatorService =
      container.resolve<EstimatorModuleService>(ESTIMATOR_MODULE)
    const estimate = await estimatorService.createManualEstimate(input)
    return new StepResponse(estimate, estimate.id)
  },
  async (estimateId, { container }) => {
    if (!estimateId) {
      return
    }
    const estimatorService =
      container.resolve<EstimatorModuleService>(ESTIMATOR_MODULE)
    await estimatorService.deleteEstimates(estimateId)
  }
)
