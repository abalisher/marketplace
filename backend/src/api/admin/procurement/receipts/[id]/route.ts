import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { deleteDraftReceiptWorkflow } from "../../../../../workflows/delete-draft-receipt"
import { loadReceiptWithBatches } from "../helpers"
import { serializeReceipt } from "../../serializers"

// GET /admin/procurement/receipts/:id — приход со строками и партиями (у
// проведённого). 404 — ядровый error-handler по MedusaError.NOT_FOUND.
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { receipt, batches } = await loadReceiptWithBatches(
    req.scope,
    req.params.id
  )
  res.json({ receipt: serializeReceipt(receipt, batches) })
}

// DELETE /admin/procurement/receipts/:id — удалить ЧЕРНОВИК прихода со строками.
// Проведённый приход не удаляется (инвариант сервиса: он уже изменил остаток и
// себестоимость). Мутация — через workflow, как остальные (конвенция проекта).
export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  await deleteDraftReceiptWorkflow(req.scope).run({
    input: { receipt_id: req.params.id },
    throwOnError: true,
  })
  res.json({ id: req.params.id, object: "receipt", deleted: true })
}
