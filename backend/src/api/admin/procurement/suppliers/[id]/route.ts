import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { PROCUREMENT_MODULE } from "../../../../../modules/procurement"
import ProcurementModuleService from "../../../../../modules/procurement/service"
import { updateSupplierWorkflow } from "../../../../../workflows/update-supplier"
import { AdminUpdateSupplierType } from "../../validators"
import { serializeSupplier } from "../../serializers"

// GET /admin/procurement/suppliers/:id — карточка поставщика (404 — ядровый
// error-handler по MedusaError.NOT_FOUND из retrieve).
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const service =
    req.scope.resolve<ProcurementModuleService>(PROCUREMENT_MODULE)
  const supplier = await service.retrieveSupplier(req.params.id)
  res.json({ supplier: serializeSupplier(supplier) })
}

// POST /admin/procurement/suppliers/:id — правка/деактивация поставщика.
export async function POST(
  req: AuthenticatedMedusaRequest<AdminUpdateSupplierType>,
  res: MedusaResponse
) {
  const { result } = await updateSupplierWorkflow(req.scope).run({
    input: { id: req.params.id, ...req.validatedBody },
    throwOnError: true,
  })
  res.json({ supplier: serializeSupplier(result) })
}
