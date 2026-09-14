import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { postReceiptWorkflow } from "../../../../../../workflows/post-receipt"
import { loadReceiptWithBatches } from "../../helpers"
import { serializeReceipt } from "../../../serializers"

// POST /admin/procurement/receipts/:id/post — провести приход: draft→posted +
// партии + увеличение остатка ЯДРА (workflow post-receipt, с компенсацией).
// Пустой приход / несопоставленные строки / повторная проводка → 400 (сервис).
export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  await postReceiptWorkflow(req.scope).run({
    input: { receipt_id: req.params.id },
    throwOnError: true,
  })
  const { receipt, batches } = await loadReceiptWithBatches(
    req.scope,
    req.params.id
  )
  res.json({ receipt: serializeReceipt(receipt, batches) })
}
