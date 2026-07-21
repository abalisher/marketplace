import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ESTIMATOR_MODULE } from "../../../modules/estimator"
import EstimatorModuleService from "../../../modules/estimator/service"
import { upsertMaterialNormWorkflow } from "../../../workflows/upsert-material-norm"
import { AdminUpsertMaterialNormType } from "./validators"

const serializeNorm = (norm: {
  id: string
  code: string
  name: string
  work_type: string
  material_kind: string
  base: string
  consumption_per_unit: number
  unit: string
  category_id: string | null
  active: boolean
  note: string | null
}) => ({
  id: norm.id,
  code: norm.code,
  name: norm.name,
  work_type: norm.work_type,
  material_kind: norm.material_kind,
  base: norm.base,
  consumption_per_unit: Number(norm.consumption_per_unit),
  unit: norm.unit,
  category_id: norm.category_id,
  active: norm.active,
  note: norm.note,
})

// GET /admin/material-norms — справочник нормативов расхода (ТЗ 7). Admin-only
// (веб-админка) — контракт/Dart не трогаем.
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const service =
    req.scope.resolve<EstimatorModuleService>(ESTIMATOR_MODULE)
  const norms = await service.listMaterialNorms(
    {},
    { order: { code: "ASC" } }
  )
  res.json({ material_norms: norms.map(serializeNorm) })
}

// POST /admin/material-norms — создание/правка норматива (upsert по code).
export async function POST(
  req: AuthenticatedMedusaRequest<AdminUpsertMaterialNormType>,
  res: MedusaResponse
) {
  const { result } = await upsertMaterialNormWorkflow(req.scope).run({
    input: req.validatedBody,
    throwOnError: true,
  })
  res.json({ material_norm: serializeNorm(result) })
}
