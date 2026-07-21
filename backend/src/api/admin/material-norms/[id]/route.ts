import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { deleteMaterialNormWorkflow } from "../../../../workflows/delete-material-norm"

// DELETE /admin/material-norms/:id — удалить норматив (workflow с компенсацией).
export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  await deleteMaterialNormWorkflow(req.scope).run({
    input: { id: req.params.id },
    throwOnError: true,
  })
  res.json({ id: req.params.id, object: "material_norm", deleted: true })
}
