import { model } from "@medusajs/framework/utils"

// Настраиваемые правила скоринга — singleton (ТЗ 4.7: веса/пороги настраивает
// админ/руководитель продавца, не хардкод). getOrCreateConfig создаёт с
// дефолтами. Идиома BonusConfig/DocumentSetting. Значения дефолтов — стартовые,
// владелец правит их в админке (подзадача 3). Суммы — в тенге (основная валюта).
const ScoringConfig = model.define("scoring_config", {
  id: model.id({ prefix: "scoreconf" }).primaryKey(),
  // Веса/потолки компонентов балла (0..100 суммарно).
  points_per_order: model.number().default(5),
  max_orders_points: model.number().default(40),
  volume_per_point: model.bigNumber().default(100000),
  max_volume_points: model.number().default(30),
  days_per_point: model.number().default(30),
  max_tenure_points: model.number().default(20),
  penalty_per_return: model.number().default(10),
  // Порог балла для доступа к отсрочке и параметры маппинга балла в лимит.
  min_score_for_credit: model.number().default(30),
  base_limit: model.bigNumber().default(0),
  limit_per_score_point: model.bigNumber().default(5000),
  max_limit: model.bigNumber().default(5000000),
})

export default ScoringConfig
