import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { buildOnecFileTemplate } from "../../../../lib/onec/file-template"

// GET /admin/onec/template — шаблон Excel-каталога для компании без 1С: его
// отдают компании, она заполняет и присылает, файл загружается на экране
// «1С и Excel».
export async function GET(_req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const file = buildOnecFileTemplate()
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  )
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="catalog-template.xlsx"; filename*=UTF-8''${encodeURIComponent("Шаблон каталога.xlsx")}`
  )
  res.send(file)
}
