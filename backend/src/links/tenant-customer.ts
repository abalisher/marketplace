import { defineLink } from "@medusajs/framework/utils"
import CustomerModule from "@medusajs/medusa/customer"
import TenantModule from "../modules/tenant"

// Компания-продавец ↔ её клиенты (N:M), заведённые менеджером компании в
// панели (POST /admin/tenant-customers). Покупатель площадки один на все
// компании, поэтому один человек может быть клиентом нескольких компаний.
//
// Продавец компании видит в «Клиентах» объединение: покупателей с заказами в
// канале компании и привязанных этой связью (lib/tenants/scope.ts →
// loadTenantCustomerIds). Связь не открывает чужих заказов: список заказов
// продавца всегда режется по каналу его компании.
export default defineLink(
  { linkable: TenantModule.linkable.tenant, isList: true },
  { linkable: CustomerModule.linkable.customer, isList: true }
)
