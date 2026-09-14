import { MedusaError, MedusaService } from "@medusajs/framework/utils"
import PriceChange from "./models/price-change"
import ProductCard from "./models/product-card"

// Сервис домена «каталог». CRUD по ProductCard генерируется MedusaService;
// здесь — только инварианты комментария модерации. Сами переходы статусов
// (draft → proposed → published/rejected) меняют product.status ЯДРА и потому
// живут в src/workflows/, не здесь (правило изоляции модулей).
class CatalogModuleService extends MedusaService({
  ProductCard,
  PriceChange,
}) {
  // Отклонение карточки: комментарий обязателен (требование ТЗ).
  async setRejectionReason(cardId: string, reason: string) {
    if (!reason?.trim()) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Rejection reason is required"
      )
    }

    return await this.updateProductCards({
      id: cardId,
      rejection_reason: reason.trim(),
    })
  }

  // Одобрение/повторная отправка: комментарий отклонения сбрасывается.
  async clearRejectionReason(cardId: string) {
    return await this.updateProductCards({
      id: cardId,
      rejection_reason: null,
    })
  }
}

export default CatalogModuleService
