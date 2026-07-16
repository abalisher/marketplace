import { model } from "@medusajs/framework/utils"

// Настройки бонусной программы платформы — singleton-строка (MVP — один
// продавец; getOrCreateConfig создаёт её с дефолтами при первом обращении).
const BonusConfig = model.define("bonus_config", {
  id: model.id({ prefix: "boncfg" }).primaryKey(),
  // Процент начисления по умолчанию (уровень платформы), может быть дробным.
  accrual_percent: model.float().default(1),
  // Переопределения процента по сегментам каталога, напр. {"business": 2}.
  // Ключи — строки: тип сегмента из модуля catalog не импортируем (изоляция).
  segment_percents: model.json().nullable(),
  // Потолок списания: не более этого % от суммы нового заказа (ТЗ 4.16).
  max_spend_percent: model.float().default(50),
  // Срок жизни начисления в днях; null — сгорание выключено.
  expiry_days: model.number().nullable(),
  // Окно возврата (дни от доставки): начисляем только после его истечения.
  // При появлении модуля возвратов источник настройки станет общим.
  return_window_days: model.number().default(14),
})

export default BonusConfig
