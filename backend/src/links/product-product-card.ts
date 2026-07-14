import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import CatalogModule from "../modules/catalog"

// Товар ядра ↔ кастомная часть карточки (1:1): сегмент, ед. изм., сертификаты,
// комментарий модерации. FK на product в модели ProductCard нет намеренно —
// изоляцию модулей обеспечивает этот link.
export default defineLink(
  ProductModule.linkable.product,
  CatalogModule.linkable.productCard
)
