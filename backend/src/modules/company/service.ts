import { MedusaError, MedusaService } from "@medusajs/framework/utils"
import Company from "./models/company"
import Employee from "./models/employee"
import SpendLimit from "./models/spend-limit"

// Сервис домена «компании-покупатели». CRUD по трём моделям генерируется
// MedusaService; здесь — только переходы модерации с их инвариантами.
// Сквозные сценарии (регистрация с созданием customer, проверка лимита
// при заказе) живут в src/workflows/, не здесь.
class CompanyModuleService extends MedusaService({
  Company,
  Employee,
  SpendLimit,
}) {
  // Одобрение компании админом: активирует юрлицо (лимиты/отсрочка
  // доступны только после этого). Сбрасывает комментарий отклонения.
  async approveCompany(companyId: string) {
    return await this.updateCompanies({
      id: companyId,
      status: "approved",
      rejection_reason: null,
    })
  }

  // Отклонение компании админом — комментарий обязателен (требование ТЗ).
  async rejectCompany(companyId: string, reason: string) {
    if (!reason?.trim()) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Rejection reason is required"
      )
    }

    return await this.updateCompanies({
      id: companyId,
      status: "rejected",
      rejection_reason: reason.trim(),
    })
  }
}

export default CompanyModuleService
