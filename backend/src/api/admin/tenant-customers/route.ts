import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { normalizePhone } from "../../../modules/auth-phone/normalize-phone"
import { createTenantCustomerWorkflow } from "../../../workflows/create-tenant-customer"
import { getTenantScope } from "../../utils/tenant-access"
import { AdminCreateTenantCustomerType } from "./validators"

// POST /admin/tenant-customers — менеджер компании заводит клиента: учётку
// покупателя по номеру и привязку к своей компании. Компания — по входу, не из
// тела. Ответ одинаков для нового и уже известного площадке номера.
export async function POST(
  req: MedusaRequest<AdminCreateTenantCustomerType>,
  res: MedusaResponse
) {
  const scope = getTenantScope(req)
  if (!scope) {
    res.status(403).json({
      type: "not_allowed",
      message: "Клиента компании заводит её продавец.",
    })
    return
  }

  const phone = normalizePhone(req.validatedBody.phone)
  if (!phone) {
    res.status(400).json({
      type: "invalid_data",
      message: "Номер должен быть мобильным номером Казахстана (+7 7XX XXX XX XX)",
    })
    return
  }

  const { result } = await createTenantCustomerWorkflow(req.scope).run({
    input: { ...req.validatedBody, phone, tenant_id: scope.tenant_id },
  })

  res.json({ customer: { id: result.id } })
}
