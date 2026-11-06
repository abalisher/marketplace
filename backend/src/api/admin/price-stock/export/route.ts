import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { serializeTable } from "../csv"
import { buildExportTable, priceStockFileName } from "../export"
import { loadPriceStockSlice } from "../load"
import { withLocationNames } from "../rows"
import { AdminExportPriceStockParamsType } from "../validators"
import { getTenantScope } from "../../../utils/tenant-access"

// GET /admin/price-stock/export — тот же срез, что на экране (склад, поиск,
// чипы), но файлом и ЦЕЛИКОМ, а не страницей: продавец выгружает то, что видит,
// правит числа в Excel и загружает обратно (T10.14c).
//
// BOM в начале обязателен: без него русский Excel читает UTF-8 как ANSI и
// показывает «Ð¦ÐµÐ¼ÐµÐ½Ñ‚» вместо названий.
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { q, category, stock, status, location_id } =
    req.validatedQuery as AdminExportPriceStockParamsType

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  // Продавец компании выгружает только свой каталог и склады своего канала.
  const tenant = getTenantScope(req)
  const { rows, locationNames } = await loadPriceStockSlice(
    query,
    { q, category, status, stock, location_id },
    tenant?.stock_location_ids,
    tenant?.sales_channel_id
  )

  const csv = serializeTable(
    buildExportTable(withLocationNames(rows, locationNames))
  )

  res.setHeader("Content-Type", "text/csv; charset=utf-8")
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${priceStockFileName(new Date())}"`
  )
  res.send(`\ufeff${csv}`)
}
