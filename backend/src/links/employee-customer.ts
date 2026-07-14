import { defineLink } from "@medusajs/framework/utils"
import CustomerModule from "@medusajs/medusa/customer"
import CompanyModule from "../modules/company"

// Сотрудник компании ↔ customer ядра (1:1): сотрудники — это обычные
// покупатели, сгруппированные в компанию. FK на customer в модели Employee
// нет намеренно — изоляцию модулей обеспечивает этот link.
export default defineLink(
  CompanyModule.linkable.employee,
  CustomerModule.linkable.customer
)
