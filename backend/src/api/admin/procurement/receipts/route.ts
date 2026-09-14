import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { PROCUREMENT_MODULE } from "../../../../modules/procurement"
import ProcurementModuleService from "../../../../modules/procurement/service"
import { createDraftReceiptWorkflow } from "../../../../workflows/create-draft-receipt"
import { AdminCreateReceiptType } from "../validators"
import { serializeReceipt } from "../serializers"

// GET /admin/procurement/receipts — список приходов (новые сверху) со строками.
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const service =
    req.scope.resolve<ProcurementModuleService>(PROCUREMENT_MODULE)
  const receipts = await service.listReceipts(
    {},
    { order: { created_at: "DESC" }, relations: ["lines"] }
  )
  res.json({ receipts: receipts.map((r) => serializeReceipt(r)) })
}

// POST /admin/procurement/receipts — создать черновик прихода. Проводка (остаток
// ядра + партии) — отдельным вызовом POST /:id/post.
export async function POST(
  req: AuthenticatedMedusaRequest<AdminCreateReceiptType>,
  res: MedusaResponse
) {
  const { result } = await createDraftReceiptWorkflow(req.scope).run({
    input: req.validatedBody,
    throwOnError: true,
  })
  res.status(201).json({ receipt: serializeReceipt(result) })
}
