import { model } from "@medusajs/framework/utils"
import { REVIEW_STATUSES, REVIEW_TARGETS } from "./constants"

// Отзыв покупателя по завершённому заказу. Поставщик и доставка оцениваются
// раздельно — по строке на объект (target). order_id/customer_id — опазные
// ссылки-колонки (не FK, модуль order/customer не импортируем): сервису они
// нужны сами для инварианта «один отзыв на (заказ, покупатель, объект)» и
// агрегации рейтинга — внутренняя логика домена (идиома documents.order_id).
// Право оставить отзыв (заказ доставлен/закрыт и принадлежит покупателю) —
// гейт слоя API/workflow (подзадача 2), не модели.
const Review = model.define("review", {
  id: model.id({ prefix: "rev" }).primaryKey(),
  order_id: model.text(),
  customer_id: model.text(),
  // Спред — копия readonly-кортежа: model.enum не принимает readonly-массив.
  target: model.enum([...REVIEW_TARGETS]),
  // Оценка 1..5; границы проверяет сервис (createReview).
  rating: model.number(),
  comment: model.text().nullable(),
  // Видимость: published по умолчанию, hidden — скрыт модерацией.
  status: model.enum([...REVIEW_STATUSES]).default("published"),
})

export default Review
