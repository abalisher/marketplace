import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { ESTIMATOR_MODULE } from "../../modules/estimator"
import EstimatorModuleService from "../../modules/estimator/service"
import { NormBase } from "../../modules/estimator/models/constants"

export type DeleteMaterialNormStepInput = { id: string }

// Удаление норматива с компенсацией — воссозданием прежней строки при откате
// workflow. Несуществующий id → 404.
export const deleteMaterialNormStep = createStep(
  "delete-material-norm",
  async (input: DeleteMaterialNormStepInput, { container }) => {
    const service =
      container.resolve<EstimatorModuleService>(ESTIMATOR_MODULE)
    let norm
    try {
      norm = await service.retrieveMaterialNorm(input.id)
    } catch {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Material norm ${input.id} not found`
      )
    }
    const snapshot = {
      id: norm.id,
      code: norm.code,
      name: norm.name,
      work_type: norm.work_type,
      material_kind: norm.material_kind,
      base: norm.base as NormBase,
      consumption_per_unit: Number(norm.consumption_per_unit),
      unit: norm.unit,
      category_id: norm.category_id,
      active: norm.active,
      note: norm.note,
    }
    await service.deleteMaterialNorms(input.id)
    return new StepResponse({ id: input.id }, snapshot)
  },
  async (snapshot, { container }) => {
    if (!snapshot) {
      return
    }
    const service =
      container.resolve<EstimatorModuleService>(ESTIMATOR_MODULE)
    await service.createMaterialNorms(snapshot)
  }
)
