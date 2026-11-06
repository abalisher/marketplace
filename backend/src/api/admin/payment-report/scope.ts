import { AuthenticatedMedusaRequest } from "@medusajs/framework/http"
import { getTenantScope } from "../../utils/tenant-access"

// Продавец отчёта: пользователь компании — только свой канал (из запроса не
// слушаем), сотрудник площадки — выбранный или все.
export const reportSalesChannel = (
  req: AuthenticatedMedusaRequest,
  requested?: string
): string | undefined => getTenantScope(req)?.sales_channel_id ?? requested
