import { AuthenticatedMedusaRequest } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { requestSalesChannelId } from "../../../../lib/tenants/storefront"

// Чья история: вошедший покупатель × витрина запроса (её канал — из
// publishable key, клиенту не доверяем).
export const conversationOwner = (req: AuthenticatedMedusaRequest) => {
  const salesChannelId = requestSalesChannelId(req)
  if (!salesChannelId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Витрина не определена: нужен publishable key"
    )
  }
  return { customer_id: req.auth_context.actor_id, sales_channel_id: salesChannelId }
}
