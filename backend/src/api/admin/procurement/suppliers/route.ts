import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { PROCUREMENT_MODULE } from "../../../../modules/procurement"
import ProcurementModuleService from "../../../../modules/procurement/service"
import { createSupplierWorkflow } from "../../../../workflows/create-supplier"
import { AdminCreateSupplierType } from "../validators"
import { serializeSupplier } from "../serializers"

// GET /admin/procurement/suppliers — реестр поставщиков (по имени). ?active=true|
// false фильтрует по активности (деактивированные не мусорят в подборе прихода).
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const service =
    req.scope.resolve<ProcurementModuleService>(PROCUREMENT_MODULE)
  const active = req.query.active
  const filters = active === undefined ? {} : { active: active === "true" }
  const suppliers = await service.listSuppliers(filters, {
    order: { name: "ASC" },
  })
  res.json({ suppliers: suppliers.map(serializeSupplier) })
}

// POST /admin/procurement/suppliers — завести поставщика.
export async function POST(
  req: AuthenticatedMedusaRequest<AdminCreateSupplierType>,
  res: MedusaResponse
) {
  const { result } = await createSupplierWorkflow(req.scope).run({
    input: req.validatedBody,
    throwOnError: true,
  })
  res.status(201).json({ supplier: serializeSupplier(result) })
}
