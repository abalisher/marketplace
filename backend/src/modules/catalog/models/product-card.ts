import { model } from "@medusajs/framework/utils"

// Сегменты каталога из ТЗ: у каждого товара ровно один.
export const PRODUCT_SEGMENTS = ["economy", "comfort", "business"] as const
export type ProductSegment = (typeof PRODUCT_SEGMENTS)[number]

// Кастомная часть карточки товара — поля, которых нет у product ядра.
// Статус модерации живёт на product.status ядра (draft/proposed/published/rejected),
// привязка к товару — через module link (см. docs/modules/catalog.md).
const ProductCard = model.define("product_card", {
  id: model.id({ prefix: "pcard" }).primaryKey(),
  // Спред — копия readonly-кортежа: model.enum не принимает readonly-массив.
  segment: model.enum([...PRODUCT_SEGMENTS]),
  // Ед. изм. для отображения на карточке (шт, мешок, м³, тонна…).
  unit: model.text(),
  // Сертификаты: массив { name, url } (файлы в file-провайдере Medusa).
  // Обязательны при отправке на модерацию — валидация в workflow, не здесь.
  certificates: model.json().nullable(),
  // Комментарий админа при отклонении; для остальных статусов — null.
  rejection_reason: model.text().nullable(),
})

export default ProductCard
