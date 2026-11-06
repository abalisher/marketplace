import { defineLink } from "@medusajs/framework/utils"
import UserModule from "@medusajs/medusa/user"
import TenantModule from "../modules/tenant"

// Компания-продавец ↔ сотрудники панели (1:N): пользователь с этой связью —
// продавец компании, и admin-API отдаёт ему только данные её канала продаж
// (src/api/utils/tenant-access.ts). Без связи пользователь — сотрудник площадки.
//
// Связь, а не user.metadata: метаданные пользователь правит сам через ядровый
// POST /admin/users/:id, а значит мог бы «отвязаться» и увидеть чужие заказы.
// Связь меняет только владелец площадки (скрипт setup-tenant).
export default defineLink(TenantModule.linkable.tenant, {
  linkable: UserModule.linkable.user,
  isList: true,
})
