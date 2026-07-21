import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ESTIMATOR_MODULE } from "../../modules/estimator"
import EstimatorModuleService from "../../modules/estimator/service"
import { NormBase } from "../../modules/estimator/models/constants"

export type UpsertMaterialNormStepInput = {
  code: string
  name: string
  work_type: string
  material_kind: string
  base: NormBase
  consumption_per_unit: number
  unit: string
  category_id?: string | null
  active?: boolean
  note?: string | null
}

// Единая форма данных компенсации (без union-ветвей — иначе ломается вывод типов
// createStep): создан ли норматив, его id и прежние поля (null при создании).
type NormCompensation = {
  created: boolean
  id: string
  previous: {
    id: string
    name: string
    work_type: string
    material_kind: string
    base: NormBase
    consumption_per_unit: number
    unit: string
    category_id: string | null
    active: boolean
    note: string | null
  } | null
}

// Upsert норматива по code: существует → обновить, иначе создать. Компенсация —
// восстановить прежние поля (при обновлении) либо удалить (при создании).
export const upsertMaterialNormStep = createStep(
  "upsert-material-norm",
  async (input: UpsertMaterialNormStepInput, { container }) => {
    const service =
      container.resolve<EstimatorModuleService>(ESTIMATOR_MODULE)
    const [existing] = await service.listMaterialNorms(
      { code: input.code },
      { take: 1 }
    )

    if (existing) {
      const compensation: NormCompensation = {
        created: false,
        id: existing.id,
        previous: {
          id: existing.id,
          name: existing.name,
          work_type: existing.work_type,
          material_kind: existing.material_kind,
          base: existing.base,
          consumption_per_unit: Number(existing.consumption_per_unit),
          unit: existing.unit,
          category_id: existing.category_id,
          active: existing.active,
          note: existing.note,
        },
      }
      const updated = await service.updateMaterialNorms({
        id: existing.id,
        ...input,
      })
      return new StepResponse(updated, compensation)
    }

    const created = await service.createMaterialNorms({
      ...input,
      active: input.active ?? true,
    })
    const compensation: NormCompensation = {
      created: true,
      id: created.id,
      previous: null,
    }
    return new StepResponse(created, compensation)
  },
  async (comp, { container }) => {
    if (!comp) {
      return
    }
    const service =
      container.resolve<EstimatorModuleService>(ESTIMATOR_MODULE)
    if (comp.created) {
      await service.deleteMaterialNorms(comp.id)
      return
    }
    if (comp.previous) {
      await service.updateMaterialNorms(comp.previous)
    }
  }
)
