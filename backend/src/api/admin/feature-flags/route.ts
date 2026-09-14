import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { isCompaniesEnabled } from "../../../lib/feature-flags"

// Фича-флаги для панели продавца (T10.9). Панель — собранный заранее бандл и
// про env бэкенда не знает, поэтому спрашивает флаги по сети: так включение
// FEATURE_COMPANIES возвращает разделы юрлиц без пересборки админки.
//
// В контракт (`contracts/openapi.json`) роут не выносится: его читает только
// панель, мобильные приложения admin-API не трогают.
export const GET = async (_req: MedusaRequest, res: MedusaResponse) => {
  res.json({ feature_flags: { companies: isCompaniesEnabled() } })
}
