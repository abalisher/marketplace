import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import {
  missingProfileFields,
  readBuyerIdentity,
  saveBuyerProfile,
} from "../../../../lib/assistant/tools/buyer-identity"
import { StoreAssistantCustomerProfileType } from "../validators"

// POST /store/assistant/customer-profile — мини-форма доставки в ленте чата:
// покупатель вписывает имя и адрес сам, не диктуя их ассистенту. Правила записи
// — те же, что у инструмента save_buyer_profile (buyer-identity.saveBuyerProfile):
// телефон учётки не меняется, адрес без имени не заводится, новая улица — новый
// адрес по умолчанию. Вход обязателен (middleware).
export async function POST(
  req: AuthenticatedMedusaRequest<StoreAssistantCustomerProfileType>,
  res: MedusaResponse
) {
  const identity = await readBuyerIdentity(req.scope, req.auth_context.actor_id)
  if (!identity) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Профиль покупателя не найден")
  }

  const saved = await saveBuyerProfile(req.scope, identity, req.validatedBody)

  res.json({
    profile: {
      first_name: saved.first_name || null,
      last_name: saved.last_name || null,
      address: saved.address
        ? { address_1: saved.address.address_1, city: saved.address.city }
        : null,
    },
    missing_fields: missingProfileFields(saved),
  })
}
