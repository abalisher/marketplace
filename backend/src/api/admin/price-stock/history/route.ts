import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { CATALOG_MODULE } from "../../../../modules/catalog"
import CatalogModuleService from "../../../../modules/catalog/service"
import { loadLocationNames } from "../load"
import { buildHistoryRow } from "../rows"
import { AdminGetPriceStockHistoryParamsType } from "../validators"
import { getTenantScope } from "../../../utils/tenant-access"

// GET /admin/price-stock/history — журнал правок цены и остатка: кто, когда,
// было → стало. Весь журнал (лента экрана) или по одной позиции (карточка
// товара, T11.6) — фильтр variant_id.
//
// Журнал ведём сами: ядро истории цены не хранит (price set перезаписывается),
// а уровень остатка знает только текущее число.
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { variant_id, limit, offset } =
    req.validatedQuery as AdminGetPriceStockHistoryParamsType

  const service = req.scope.resolve<CatalogModuleService>(CATALOG_MODULE)
  // Продавец компании видит журнал остатков своих складов; правки цен и
  // остатков других компаний (с именами сотрудников) ему не показываем.
  const tenant = getTenantScope(req)
  const [changes, count] = await service.listAndCountPriceChanges(
    {
      ...(variant_id ? { variant_id } : {}),
      ...(tenant ? { location_id: tenant.stock_location_ids } : {}),
    },
    { skip: offset, take: limit, order: { created_at: "DESC" } }
  )

  // Названия складов страницы: у правки остатка в журнале стоит склад — цена в
  // магазине одна, а остаток у каждого склада свой, и «остаток 373 → 370» без
  // склада не отвечает «где» (Ф-прогон Данияра 2026-09-02).
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const locationNames = await loadLocationNames(
    query,
    changes
      .map((change) => change.location_id)
      .filter((id): id is string => !!id)
  )

  res.json({
    price_changes: changes.map((change) =>
      buildHistoryRow(
        change as Parameters<typeof buildHistoryRow>[0],
        locationNames
      )
    ),
    count,
    offset,
    limit,
  })
}
