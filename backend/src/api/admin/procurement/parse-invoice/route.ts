import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { AdminParseInvoiceType } from "../validators"
import { parseInvoiceDocument, RecognizedSupplier } from "../../../../lib/invoice-ai"
import { PROCUREMENT_MODULE } from "../../../../modules/procurement"
import ProcurementModuleService from "../../../../modules/procurement/service"
import { createSupplierWorkflow } from "../../../../workflows/create-supplier"
import { MedusaContainer } from "@medusajs/framework/types"

// POST /admin/procurement/parse-invoice — распознать накладную закупа (PDF/фото)
// через Gemini: файл (base64) → позиции (наименование/кол-во/ед./цена в тенге) +
// поставщик из шапки. Позиции РЕКОМЕНДАТЕЛЬНЫ (source=invoice_ai): продавец
// сопоставляет их с SKU и сохраняет/проводит через существующий флоу create-draft.
// Поставщика роут ЗАВОДИТ САМ, если такого ещё нет (замечание владельца
// 2026-08-12: «зачем лишний раз напрягать пользователя» — иначе закупщик должен
// был уйти в реестр поставщиков, потеряв заполненную форму). Сопоставление —
// по БИН, иначе по названию без регистра.

const findOrCreateSupplier = async (
  scope: MedusaContainer,
  recognized: RecognizedSupplier
): Promise<{ id: string; name: string; created: boolean } | null> => {
  const service = scope.resolve<ProcurementModuleService>(PROCUREMENT_MODULE)

  if (recognized.bin) {
    const [byBin] = await service.listSuppliers(
      { bin: recognized.bin },
      { take: 1, select: ["id", "name"] }
    )
    if (byBin) {
      return { id: byBin.id, name: byBin.name, created: false }
    }
  }

  // По названию сравниваем без регистра и лишних пробелов: «ТОО "СтройБаза"» и
  // «ТОО «СтройБаза»» — один поставщик по смыслу, но кавычки у поставщиков
  // разные, поэтому сверяем только по буквам и цифрам.
  const normalize = (value: string) =>
    value.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "")
  const all = await service.listSuppliers({}, { select: ["id", "name"] })
  const byName = all.find((s) => normalize(s.name) === normalize(recognized.name))
  if (byName) {
    return { id: byName.id, name: byName.name, created: false }
  }

  const { result } = await createSupplierWorkflow(scope).run({
    input: { name: recognized.name, bin: recognized.bin },
    throwOnError: true,
  })
  const created = result as { id: string; name: string }
  return { id: created.id, name: created.name, created: true }
}

export async function POST(
  req: AuthenticatedMedusaRequest<AdminParseInvoiceType>,
  res: MedusaResponse
) {
  const { mime_type, data } = req.validatedBody
  const recognized = await parseInvoiceDocument({ mimeType: mime_type, data })

  const supplier = recognized.supplier
    ? await findOrCreateSupplier(req.scope, recognized.supplier)
    : null

  res.json({ recognized, supplier })
}
