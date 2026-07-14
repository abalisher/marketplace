import { defineLink } from "@medusajs/framework/utils"
import OrderModule from "@medusajs/medusa/order"
import CompanyModule from "../modules/company"

// Компания ↔ заказы ядра (1:N): заказ оформляется от имени компании
// (сотрудником в рамках лимита), у компании — много заказов.
export default defineLink(CompanyModule.linkable.company, {
  linkable: OrderModule.linkable.order,
  isList: true,
})
